module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['ChromiumHeadless'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher')
    ],
    customLaunchers: {
      ChromiumHeadless: {
        base: 'Chromium',
        flags: ['--headless', '--no-sandbox', '--disable-gpu']
      }
    }
  });
};
