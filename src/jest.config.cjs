module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 60,
      statements: 60,
      branches: 50,
      functions: 60
    }
  },
  testMatch: ['**/__tests__/**/*.test.ts']
}
