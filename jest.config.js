/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  
  // Only test source files, ignore dist
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/*.test.ts'
  ],
  
  // Ignore dist folder and node_modules
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Module resolution for ESM (correct option name)
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // Transform configuration
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext',
        target: 'es2020'
      }
    }]
  },
  
  // Coverage configuration  
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/__tests__/**/*',
    '!src/**/*.test.ts'
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Test timeout for Docker operations
  testTimeout: 10000,
  
  // Clear mocks between tests for clean TDD
  clearMocks: true,
  restoreMocks: true,
  
  // Verbose output for better TDD feedback
  verbose: true
};
