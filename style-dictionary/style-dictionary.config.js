import StyleDictionary from "style-dictionary";

/**
 * Tailwind flat format (v4)
 */
StyleDictionary.registerFormat({
  name: "tailwind/flat",
  format: ({ dictionary }) => {
    const result = {};
    dictionary.allTokens.forEach((token) => {
      result[token.name] = token.value;
    });
    return JSON.stringify(result, null, 2);
  },
});

export default {
  source: ["tokens/source/tokens.json"],
  platforms: {
    tailwind: {
      transformGroup: "js",
      buildPath: "tokens/build/",
      files: [
        {
          destination: "tailwind.tokens.json",
          format: "tailwind/flat",
        },
      ],
    },
  },
};
