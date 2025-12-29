module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Needed for react-native-reanimated (must be last)
    'react-native-reanimated/plugin',
  ],
};
