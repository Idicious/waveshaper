// Karma configuration
// Generated on Mon Feb 19 2018 09:16:45 GMT+0100 (W. Europe Standard Time)

var path = require('path');

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],

    karmaTypescriptConfig: {
      tsconfig: './tsconfig.test.json',
      reports: {
        html: {
          combineBrowserReports: true
        }
      }
    },

    // list of files / patterns to load in the browser
    files: [
      'src/**/*.ts',
      'spec/**/*.ts',
      { pattern: 'spec/**/*.wav', included: false, served: true },
      { pattern: 'spec/**/*.mp3', included: false, served: true }
    ],

    proxies: {
      '/assets/': '/base/spec/assets/'
    },

    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*.ts': ['karma-typescript', 'coverage'],
      'spec/**/!(*.ts)': ['karma-typescript', 'coverage'],  //<-- Ignore spec for coverage
      'spec/**/*.ts': ['karma-typescript']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage', 'coveralls'],

    coverageReporter: {
      type: 'lcov', // lcov or lcovonly are required for generating lcov.info files
      dir: 'coverage/'
    },

    coveragePreprocessor: {
        exclude: [ "spec" ]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
