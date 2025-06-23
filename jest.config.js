module.exports = {
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": [
    "<rootDir>/src/test/setup.ts"
  ],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}",
    "!src/test/**/*"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 50,
      "functions": 50,
      "lines": 50,
      "statements": 50
    }
  },
  "coverageReporters": [
    "text",
    "html",
    "lcov",
    "json-summary"
  ]
};