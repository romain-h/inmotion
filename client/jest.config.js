module.exports = {
  globals: {
    'ts-jest': {
      // This is required only because Jest needs the option
      // "jsx": "react" which is not compatible with Next.js
      tsConfig: 'tsconfig.jest.json',
    },
  },
  modulePaths: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/setup-tests.js'],
};
