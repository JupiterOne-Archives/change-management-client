import JupiterOneClient, {
  QueryResult,
} from "@jupiterone/jupiterone-client-nodejs";

import {
  CommitRangeIngestionResults,
  RepoPRsMap,
  Revision,
  Verdict,
  Finding,
} from "./types";
import { shouldApprove, joinVerdicts, needsHumanReview } from "./verdicts";
import {
  repoFullNameFromRevision,
  j1FindingLink,
  detectPRReference,
} from "./helpers";

export class JupiterOneChangeManagementClient {
  private repoPRsMap: RepoPRsMap;
  private client: JupiterOneClient;

  constructor(
    readonly account: string,
    readonly integrationInstanceId: string,
    private token: string,
  ) {}

  async init(): Promise<JupiterOneChangeManagementClient> {
    this.client = await new JupiterOneClient({
      account: this.account,
      accessToken: this.token,
    }).init();

    return this;
  }

  async collectPREntities(
    proposedRevisions: Revision[],
    approvedRevisions: Revision[],
  ): Promise<RepoPRsMap> {
    const repoPRsMap: RepoPRsMap = {};

    for (const proposedRevision of proposedRevisions) {
      const proposedRepoId = repoFullNameFromRevision(proposedRevision);
      const approvedRevision = approvedRevisions.find(
        approved => repoFullNameFromRevision(approved) === proposedRepoId,
      );
      if (!approvedRevision) {
        throw new Error(
          `No matching approved repo could be found for ${proposedRepoId}`,
        );
      }

      const commitRangeResults = (await this.client.ingestCommitRange(
        this.integrationInstanceId,
        {
          /* eslint-disable @typescript-eslint/camelcase */
          account_uuid: proposedRevision.username,
          repo_uuid: proposedRevision.repoSlug,
          /* eslint-enable @typescript-eslint/camelcase */
          source: proposedRevision.sha,
          destination: approvedRevision.sha,
        },
      )) as CommitRangeIngestionResults;

      repoPRsMap[proposedRepoId] = commitRangeResults;
    }

    this.repoPRsMap = repoPRsMap;

    return repoPRsMap;
  }

  async buildSecurityComment(): Promise<Verdict> {
    const rawVerdicts = await Promise.all(
      Object.entries(this.repoPRsMap).map(([repository]) =>
        this.buildSecurityCommentForRepo(repository),
      ),
    );

    const verdicts = rawVerdicts.filter(v => v) as Verdict[];

    if (verdicts.length === 0) {
      return shouldApprove("(/) No findings found");
    }

    return joinVerdicts(verdicts, "\n");
  }

  buildReviewProcessComment(): Verdict {
    const verdicts = Object.entries(this.repoPRsMap).reduce(
      (verdicts: Verdict[], [repository, commitRange]) => {
        const verdict = this.reviewProcessVerdictForRepo(
          repository,
          commitRange,
        );

        if (verdict) {
          verdicts.push(verdict);
        }

        return verdicts;
      },
      [],
    );

    if (verdicts.length === 0) {
      return shouldApprove("(/) No commits were added since that request");
    }

    return joinVerdicts(verdicts, "\n\n");
  }

  /**************************************************
   * PRIVATES, DON'T LOOK OR I'LL REPORT YOU TO CPS *
   **************************************************/

  private async buildSecurityCommentForRepo(
    repository: string,
  ): Promise<Verdict | undefined> {
    let findingsForRepo: QueryResult[] = [];
    try {
      findingsForRepo = await this.client.queryV1(
        `find Finding that HAS CodeRepo with name='${repository}'`,
      );
    } catch (err) {
      return shouldApprove("Querying JupiterOne for Findings failed");
    }

    const findingComments = findingsForRepo.map(({ entity }: QueryResult) => {
      const finding = entity as Finding;
      const findingLink = j1FindingLink(finding._id, repository);
      return `- [${finding.displayName}|${findingLink}]`;
    });

    if (findingComments.length === 0) {
      return undefined;
    }

    const lines = [
      `In ${repository}:`,
      `(/) Disregarding ${findingsForRepo.length} findings from JupiterOne`,
      ...findingComments,
    ];

    return shouldApprove(lines.join("\n"));
  }

  private reviewProcessVerdictForRepo(
    repository: string,
    commitRange: CommitRangeIngestionResults,
  ): Verdict | undefined {
    if (commitRange.removedCommits.length > 0) {
      const header = needsHumanReview(
        "(x) Some commits were removed since that request",
      );
      const commentsForRemovedCommits = needsHumanReview(
        `The following commits were removed from ${repository}:\n${commitRange.removedCommitMessages.join(
          "\n",
        )}`,
      );

      return joinVerdicts([header, commentsForRemovedCommits], "\n\n");
    }

    const commitComments = commitRange.allCommits.map(commit =>
      this.commitToVerdict(commitRange, commit),
    );

    if (commitComments.length > 0) {
      const header = shouldApprove(`In ${repository}:`);
      return joinVerdicts([header, ...commitComments], "\n");
    } else {
      return undefined;
    }
  }

  private commitToVerdict(
    commitRange: CommitRangeIngestionResults,
    commit: string,
  ): Verdict {
    interface CommitMap<T> {
      [commit: string]: T;
    }

    const commitToMessageMap: CommitMap<string> = commitRange.allCommits.reduce(
      (m: CommitMap<string>, c, i) => {
        m[c] = commitRange.allCommitMessages[i];
        return m;
      },
      {},
    );

    const comment = this.commitMessageToCommentText(
      commitRange,
      commitToMessageMap[commit],
    );

    const relatedPR = commitRange.entities.find(pr =>
      pr.commits.includes(commit),
    );

    if (
      (relatedPR && relatedPR.commitsApproved.includes(commit)) ||
      commitRange.emptyMergeCommits.includes(commit)
    ) {
      return shouldApprove(`- (/) ${comment}`);
    } else {
      return needsHumanReview(
        `- (x) ${comment}\n-- Is not approved or an empty merge`,
      );
    }
  }

  private commitMessageToCommentText(
    commitRange: CommitRangeIngestionResults,
    message: string,
  ): string {
    const detectedPR = detectPRReference(message);
    const prEntity = detectedPR
      ? commitRange.entities.find(pr => pr.id.toString() === detectedPR.id)
      : undefined;

    if (detectedPR && prEntity) {
      const replacementText = `[${detectedPR.text}|${prEntity.webLink}]`;
      return message.replace(detectedPR.text, replacementText);
    } else {
      return message;
    }
  }
}
