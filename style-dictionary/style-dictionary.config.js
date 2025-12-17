const StyleDictionary = require("style-dictionary");

module.exports = {
  // 入力
  source: ["../tokens/source/tokens.json"],

  // 出力
  platforms: {
    tailwind: {
      transformGroup: "js",

      buildPath: "../tokens/build/",

      files: [
        {
          destination: "tailwind.tokens.json",
          format: "javascript/module",

          filter: (token) => {
            // primitives だけを対象にする
            return token.path[0] === "primitives";
          },
        },
      ],
    },
  },
};
