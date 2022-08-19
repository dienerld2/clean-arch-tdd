/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['**/src/**/*.ts'],
  testMatch: ['**/*.{test,spec}.ts']

}
