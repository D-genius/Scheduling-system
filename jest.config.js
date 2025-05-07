module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['/home/deekali/Desktop/Backup/Personal/application/Tiberbu/Assignment/healthcare-frontend/src/setupTests.js'],
  // setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'], configure this to your path
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};