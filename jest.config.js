module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/apps"],
  setupFiles: ["<rootDir>/apps/backend/src/test/jest.setup.ts"],
  moduleNameMapper: {
    "^@ndrs92/contracts$": "<rootDir>/packages/contracts/dist/cjs/index.js",
  },
};
