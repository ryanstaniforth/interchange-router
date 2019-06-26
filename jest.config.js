module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/build'],
    testRegex: '.*\\.test\\.js?$',
    moduleFileExtensions: ['js'],
    collectCoverageFrom: ['**/*.js', '!**/index.js', '!build/types.js', '!build/server.js'],
};
