export const demoCommitRange = {
  entities: [
    {
      id: 6,
      commits: ["ea08ec9edbf00186ecad390f52259fafffd73c9e"],
      commitMessages: ["Add Shrek because he is beautiful and I love him"],
      commitsApproved: ["ea08ec9edbf00186ecad390f52259fafffd73c9e"],
      commitsNotApproved: [],
      /* eslint-disable-next-line @typescript-eslint/camelcase */
      account_uuid: "jupiteronedemo",
      webLink:
        "https://bitbucket.org/jupiteronedemo/bitbucket-integration-demo/pull-requests/6",
    },
  ],
  allCommits: [
    "1b744fb915e60e2f003069d7321b789aedaf1ac7",
    "ea08ec9edbf00186ecad390f52259fafffd73c9e",
  ],
  allCommitMessages: [
    "Merged in add-shrek (pull request #6)",
    "Add Shrek because he is beautiful and I love him",
  ],
  emptyMergeCommits: ["1b744fb915e60e2f003069d7321b789aedaf1ac7"],
  removedCommits: [],
  removedCommitMessages: [],
};

export const pipelineCommitRange = {
  entities: [
    {
      id: 1,
      commits: [
        "80800d1191784c98d0eb5d728d40aff1bf1d1a06",
        "8446386f906e377c59aefcd56535015b3f850ae3",
      ],
      commitMessages: ["Fix typo", "Add a greeting"],
      commitsApproved: [
        "80800d1191784c98d0eb5d728d40aff1bf1d1a06",
        "8446386f906e377c59aefcd56535015b3f850ae3",
      ],
      commitsNotApproved: [],
      /* eslint-disable-next-line @typescript-eslint/camelcase */
      account_uuid: "pipeline",
      webLink:
        "https://bitbucket.org/pipeline/something-pipeline/pull-requests/1",
    },
  ],
  allCommits: [
    "0f1485a2f5527aa9f47f21c1f2bc09e18c7823ab",
    "80800d1191784c98d0eb5d728d40aff1bf1d1a06",
    "8446386f906e377c59aefcd56535015b3f850ae3",
  ],
  allCommitMessages: [
    "Merged in greeting (pull request #1)",
    "Fix typo",
    "Add a greeting",
  ],
  emptyMergeCommits: ["0f1485a2f5527aa9f47f21c1f2bc09e18c7823ab"],
  removedCommits: [],
  removedCommitMessages: [],
};

export const demoPipelineRepoPRsMap = {
  "jupiteronedemo/bitbucket-integration-demo": demoCommitRange,
  "pipeline/something-pipeline": pipelineCommitRange,
};

export const pipelineCommitRangeNoChanges = {
  entities: [],
  allCommits: [],
  allCommitMessages: [],
  emptyMergeCommits: [],
  removedCommits: [],
  removedCommitMessages: [],
};
