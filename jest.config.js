module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests/utils',
  ],
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
    '!**/tests/e2e/**',
    '!**/*.e2e.ts',
    '!**/*.e2e.spec.ts',
    '!**/tests/**/*.e2e.ts',
    '!**/tests/**/*.e2e.spec.ts',
    '!**/tests/e2e/**',
    '!**/tests/**/*.playwright.ts',
    '!**/tests/**/*.playwright.spec.ts',
    '!**/tests/ui-*.spec.ts',
    '!**/src/pages/api/webhooks/test.ts',
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/tests/e2e/**',
    '!**/*.e2e.ts',
    '!**/*.e2e.spec.ts',
    '!**/tests/**/*.e2e.ts',
    '!**/tests/**/*.e2e.spec.ts',
    '!**/tests/ui-*.spec.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 25,
      functions: 25,
      lines: 25,
      statements: 25,
    },
  },
};
