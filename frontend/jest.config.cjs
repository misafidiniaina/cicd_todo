// jest.config.cjs
module.exports = {
  testEnvironment: "node",
  transform: {}, // no babel needed for pure ESM Node tests
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  setupFilesAfterEnv: [],
  verbose: true,
};
