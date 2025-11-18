module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 10,
      statements: 10
    }
  },
  testMatch: ['**/__tests__/**/*.test.ts']
}
