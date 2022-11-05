module.exports = {
  verbose: false,
  moduleDirectories: ["node_modules", "src", "test"],
  transform: {
    "^.+\\.js?$": "babel-jest",
  },
  testEnvironment: "jsdom",
  runner: "groups",
  collectCoverageFrom: ["src/**/*.js"],
};
