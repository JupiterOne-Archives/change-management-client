const ingestCommitRangeMock = jest.fn();
const queryMock = jest.fn();
const initMock = jest.fn().mockResolvedValue({
  ingestCommitRange: ingestCommitRangeMock,
  queryV1: queryMock,
});

jest.doMock("@jupiterone/jupiterone-client-nodejs", () => {
  return jest.fn().mockImplementation(() => ({
    init: initMock,
  }));
});

import { JupiterOneChangeManagementClient } from "./changeManagementClient";
import { shouldApprove } from "./verdicts";

import {
  demoCommitRange,
  pipelineCommitRange,
  demoPipelineRepoPRsMap,
} from "../test/fixtures";
import { mockFinding, mockQuery, mockIngestCommitRange } from "../test/helpers";

test("changeManagementClient", async () => {
  const expectedIntegrationInstanceId = "ebf2cdba-d596-11e9-a14b-ebfbbbf011ec";
  const client = await new JupiterOneChangeManagementClient(
    "account",
    expectedIntegrationInstanceId,
    "token",
  ).init();

  const findingOne = mockFinding();
  const findingTwo = mockFinding();
  const findingThree = mockFinding();

  const expectedDemoQuery = `find Finding that HAS CodeRepo with name='jupiteronedemo/bitbucket-integration-demo'`;
  const expectedPipelineQuery = `find Finding that HAS CodeRepo with name='pipeline/something-pipeline'`;

  mockQuery({
    queryMock,
    expectedDemoQuery,
    demoFindings: [findingOne, findingTwo],
    expectedPipelineQuery,
    pipelineFindings: [findingThree],
  });

  /* eslint-disable @typescript-eslint/camelcase */
  mockIngestCommitRange({
    ingestCommitRangeMock,
    expectedIntegrationInstanceId,
    commitRangesAndResults: [
      {
        commitRange: {
          account_uuid: "jupiteronedemo",
          repo_uuid: "bitbucket-integration-demo",
          source: "6410cfc63b5aad99db0b9ce895752f279c66e200",
          destination: "1b744fb915e60e2f003069d7321b789aedaf1ac7",
        },
        result: demoCommitRange,
      },
      {
        commitRange: {
          account_uuid: "pipeline",
          repo_uuid: "something-pipeline",
          source: "39fd5b991115237c1ab50f7fd5b99a3d8843b2b3",
          destination: "0f1485a2f5527aa9f47f21c1f2bc09e18c7823ab",
        },
        result: pipelineCommitRange,
      },
    ],
  });
  /* eslint-enable @typescript-eslint/camelcase */

  const repoPRsMap = await client.collectPREntities(
    [
      {
        username: "jupiteronedemo",
        repoSlug: "bitbucket-integration-demo",
        sha: "1b744fb915e60e2f003069d7321b789aedaf1ac7",
      },
      {
        username: "pipeline",
        repoSlug: "something-pipeline",
        sha: "0f1485a2f5527aa9f47f21c1f2bc09e18c7823ab",
      },
    ],
    [
      {
        username: "jupiteronedemo",
        repoSlug: "bitbucket-integration-demo",
        sha: "6410cfc63b5aad99db0b9ce895752f279c66e200",
      },
      {
        username: "pipeline",
        repoSlug: "something-pipeline",
        sha: "39fd5b991115237c1ab50f7fd5b99a3d8843b2b3",
      },
    ],
  );

  expect(repoPRsMap).toEqual(demoPipelineRepoPRsMap);

  const securityComment = await client.buildSecurityComment();

  expect(securityComment).toEqual(
    shouldApprove(`In jupiteronedemo/bitbucket-integration-demo:
(/) Disregarding 2 findings from JupiterOne
- [${findingOne.displayName}|https://lifeomic.apps.us.jupiterone.io/home?query=find%20Finding%20with%20_id=%22${findingOne._id}%22%0A%20%20%20%20that%20HAS%20CodeRepo%20with%20name=%22jupiteronedemo/bitbucket-integration-demo%22%0A%20%20%20%20return%20tree]
- [${findingTwo.displayName}|https://lifeomic.apps.us.jupiterone.io/home?query=find%20Finding%20with%20_id=%22${findingTwo._id}%22%0A%20%20%20%20that%20HAS%20CodeRepo%20with%20name=%22jupiteronedemo/bitbucket-integration-demo%22%0A%20%20%20%20return%20tree]
In pipeline/something-pipeline:
(/) Disregarding 1 findings from JupiterOne
- [${findingThree.displayName}|https://lifeomic.apps.us.jupiterone.io/home?query=find%20Finding%20with%20_id=%22${findingThree._id}%22%0A%20%20%20%20that%20HAS%20CodeRepo%20with%20name=%22pipeline/something-pipeline%22%0A%20%20%20%20return%20tree]`),
  );

  const reviewProcessComment = client.buildReviewProcessComment();

  expect(reviewProcessComment).toEqual(
    shouldApprove(`In jupiteronedemo/bitbucket-integration-demo:
- (/) Merged in add-shrek ([pull request #6|https://bitbucket.org/jupiteronedemo/bitbucket-integration-demo/pull-requests/6])
- (/) Add Shrek because he is beautiful and I love him

In pipeline/something-pipeline:
- (/) Merged in greeting ([pull request #1|https://bitbucket.org/pipeline/something-pipeline/pull-requests/1])
- (/) Fix typo
- (/) Add a greeting`),
  );
});
