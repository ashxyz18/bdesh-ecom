import type { Config } from "ts-jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__", "<rootDir>/packages"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  moduleNameMapper: {
    "^@bdesh/(.*)$": "<rootDir>/packages/$1/src",
    "^@/(.*)$": "<rootDir>/frontend/web/$1",
  },
  collectCoverageFrom: [
    "packages/*/src/**/*.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};

export default config;
