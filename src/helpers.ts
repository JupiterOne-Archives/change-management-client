import { Revision } from "./types";

export function repoFullNameFromRevision(revision: Revision): string {
  return `${revision.username}/${revision.repoSlug}`;
}

export function j1FindingLink(findingId: string, repository: string): string {
  const lines = [
    `find Finding with _id="${findingId}"`,
    `that HAS CodeRepo with name="${repository}"`,
    `return tree`,
  ];
  const query = lines.join("\n    ");
  const encodedQuery = encodeURI(query);

  return `https://lifeomic.apps.us.jupiterone.io/home?query=${encodedQuery}`;
}

const PR_REFERENCE_REGEX = /pull request #([\d]+)/;

export function detectPRReference(
  comment: string,
): { id: string; text: string } | undefined {
  const match = PR_REFERENCE_REGEX.exec(comment);
  if (!match) {
    return undefined;
  }

  return {
    id: match[1],
    text: match[0],
  };
}
