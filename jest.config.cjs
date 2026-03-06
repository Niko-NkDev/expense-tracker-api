module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: '.*\\.test\\.ts$',
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
};
