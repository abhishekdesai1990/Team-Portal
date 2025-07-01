/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/types.ts",
    "!**/test/**",
    "!**/node_modules/**",
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageReporters: ["html", "text", "text-summary", "cobertura", "lcov"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  moduleDirectories: ["node_modules"],
  preset: "ts-jest",
  reporters: ["default", "jest-html-reporters"],
  setupFiles: ["<rootDir>/src/__tests__/setup/setup.ts"],
  snapshotSerializers: ["jest-serializer-html"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  verbose: true,
};
