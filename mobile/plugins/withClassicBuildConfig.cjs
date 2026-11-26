const {withProjectBuildGradle} = require('expo/config-plugins');

// Classic's receivers reference BuildConfig, which AGP no longer generates by default.
const configuration = `
// VehicleSenseX: Bluetooth Classic BuildConfig
subprojects { subproject ->
    if (subproject.name == 'react-native-bluetooth-classic') {
        subproject.plugins.withId('com.android.library') {
            subproject.android.buildFeatures.buildConfig = true
        }
    }
}
`;

module.exports = config => withProjectBuildGradle(config, config => {
  if (config.modResults.language !== 'groovy') throw new Error('Classic BuildConfig requires Groovy project Gradle.');
  if (!config.modResults.contents.includes(configuration.trim())) config.modResults.contents += configuration;
  return config;
});
