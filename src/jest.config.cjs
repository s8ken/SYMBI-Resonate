module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 30,
      statements: 30
    }
  },
  testMatch: ['**/__tests__/**/*.test.ts']
}
