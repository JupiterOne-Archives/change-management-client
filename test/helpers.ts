/* eslint-disable @typescript-eslint/no-explicit-any */
import uuidV4 from "uuid/v4";

/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
export const mockFinding = () => ({
  _id: uuidV4(),
  displayName: uuidV4(),
});

const equal = (a: any, b: any): boolean =>
  Object.entries(a).reduce((eq: boolean, [key, value]) => {
    return eq && value === b[key];
  }, true);

/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
const toQueryResult = (f: any) => ({ entity: f });

export const mockQuery = ({
  queryMock,
  expectedDemoQuery,
  demoFindings,
  expectedPipelineQuery,
  pipelineFindings,
}: {
  queryMock: jest.Mock;
  expectedDemoQuery: string;
  demoFindings: any[];
  expectedPipelineQuery: string;
  pipelineFindings: any[];
}): void => {
  queryMock.mockImplementation(query => {
    if (query === expectedDemoQuery) {
      return demoFindings.map(toQueryResult);
    } else if (query === expectedPipelineQuery) {
      return pipelineFindings.map(toQueryResult);
    }

    throw new Error(`Unexpected query passed to queryV1: ${query}`);
  });
};

export const mockIngestCommitRange = ({
  ingestCommitRangeMock,
  expectedIntegrationInstanceId,
  commitRangesAndResults,
}: {
  ingestCommitRangeMock: jest.Mock;
  expectedIntegrationInstanceId: string;
  commitRangesAndResults: { commitRange: any; result: any }[];
}): void => {
  ingestCommitRangeMock.mockImplementation(
    (integrationInstanceId, commitRange) => {
      if (integrationInstanceId != expectedIntegrationInstanceId) {
        throw new Error(
          "ingestCommitRange received unexpected integration instance ID",
        );
      }

      for (const rangeAndResult of commitRangesAndResults) {
        if (equal(commitRange, rangeAndResult.commitRange)) {
          return rangeAndResult.result;
        }
      }

      throw new Error("ingestCommitRange received an unexpected commit range");
    },
  );
};
