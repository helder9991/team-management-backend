import type { Config } from 'jest'

const config: Config = {
  moduleNameMapper: {
    '^container/(.*)$': ['<rootDir>/src/container/$1'],
    '^modules/(.*)$': ['<rootDir>/src/modules/$1'],
    '^middlewares/(.*)$': ['<rootDir>/src/middlewares/$1'],
    '^utils/(.*)$': ['<rootDir>/src/utils/$1'],
    '^database/(.*)$': ['<rootDir>/src/database/$1'],
    '^configs/(.*)$': ['<rootDir>/src/configs/$1'],
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
