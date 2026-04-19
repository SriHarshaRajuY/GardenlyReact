export default {
  transform: {},
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/client/'],
  collectCoverageFrom: [
    'api/controllers/**/*.js',
    'api/utils/**/*.js'
  ],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
