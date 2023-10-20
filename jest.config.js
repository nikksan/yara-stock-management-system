'use strict';

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  silent: false,
  forceExit: true,
  verbose: true,
  testMatch: [
    '<rootDir>/tests/unit-tests/**/?(*.)+(test).ts',
    '<rootDir>/tests/integration-tests/**/?(*.)+(test).ts',
  ],
  watchPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/docs/'],
  modulePathIgnorePatterns: ['node_modules'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: `<rootDir>` }),
  globalSetup: '<rootDir>/tests/dbSetupWithNodeWrapper.ts',
};
