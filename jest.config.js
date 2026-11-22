module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/apps"],
  setupFiles: ["<rootDir>/apps/backend/src/test/jest.setup.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  moduleNameMapper: {
    "^@ndrs92/contracts$": "<rootDir>/packages/contracts/dist/cjs/index.js",
  },
};
