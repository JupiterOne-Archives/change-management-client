const { defaults } = require("jest-config");

module.exports = {
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: ["<rootDir>/src/**/*.test.{js,ts}"],
  collectCoverageFrom: ["src/**/*.ts"],
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts"],
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 88,
      branches: 68,
      lines: 88,
      functions: 96,
    },
  },
};
