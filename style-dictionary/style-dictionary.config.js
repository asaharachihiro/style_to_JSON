import StyleDictionary from "style-dictionary";

export default {
  source: ["tokens/source/tokens.json"],
  platforms: {
    web: {
      buildPath: "build/web/",
      files: [
        {
          destination: "primitives.json",
          format: "json",
          filter: (token) => token.path[0] === "primitives",
        },
        {
          destination: "semantic.json",
          format: "json",
          filter: (token) => token.path[0] === "semantic",
        },
      ],
    },
  },
};
