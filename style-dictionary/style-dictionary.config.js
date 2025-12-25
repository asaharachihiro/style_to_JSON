import StyleDictionary from "style-dictionary";

export default {
  source: ["tokens/source/tokens.json"],
  platforms: {
    web: {
      buildPath: "build/web/",
      files: [
        {
          destination: "tokens.json",
          format: "json",
        },
      ],
    },
  },
};
