module.exports = function (api) {
  api.cache(true);
  return {
    // NativeWind's JSX wrapping (jsxImportSource + nativewind/babel) is off: the app styles with
    // theme tokens and never uses className, and the wrapper dropped Pressable function styles.
    // babel-preset-expo adds the Reanimated/Worklets plugin on its own.
    presets: ['babel-preset-expo'],
  };
};
