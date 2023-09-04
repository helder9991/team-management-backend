import type { Config } from 'jest'

const config: Config = {
  moduleNameMapper: {
    '^modules/(.*)$': ['<rootDir>/src/modules/$1'],
    '^shared/(.*)$': ['<rootDir>/src/shared/$1'],
    '^routes/(.*)$': ['<rootDir>/src/routes/$1'],
  },
  coverageDirectory: 'jest/coverage',
  collectCoverageFrom: [
    '<rootDir>/src/modules/**/repository/!(*interfaces)/**',
    '<rootDir>/src/modules/**/useCases/**',
    '<rootDir>/src/modules/**/controllers/**',
  ],
  globalSetup: '<rootDir>/jest/setup.ts',
  globalTeardown: '<rootDir>/jest/teardown.ts',
}

export default config
