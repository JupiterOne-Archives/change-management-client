import { IngestionResults } from "@jupiterone/jupiterone-client-nodejs";

export interface CommitRangeIngestionResults extends IngestionResults {
  entities: PREntity[];
  allCommits: string[];
  allCommitMessages: string[];
  emptyMergeCommits: string[];
  removedCommits: string[];
  removedCommitMessages: string[];
}

export interface PREntity {
  id: number;
  commits: string[];
  commitMessages: string[];
  commitsApproved: string[];
  commitsNotApproved: string[];
  account_uuid: string;
  webLink: string;
}

export interface RepoPRsMap {
  [repo: string]: CommitRangeIngestionResults;
}

export type Revision = {
  sha: string;
  username: string;
  repoSlug: string;
};

export interface Finding {
  _id: string;
  displayName: string;
}

export type Verdict = {
  text: string;
  verdict: "SHOULD_APPROVE" | "NEEDS_HUMAN_REVIEW";
};
