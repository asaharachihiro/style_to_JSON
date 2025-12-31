#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { convertTailwind } from "./platforms/tailwind.js";
// import { convertIOS } from "./platforms/ios.js";
// import { convertAndroid } from "./platforms/android.js";

// -------------------------
// パス解決（ESM用）
// -------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------
// 入出力パス
// -------------------------
const TOKENS_DIR = path.resolve(__dirname, "../tokens/build");
const INPUT_PRIMITIVES = path.join(TOKENS_DIR, "primitives.json");
const INPUT_SEMANTIC = path.join(TOKENS_DIR, "semantic.json");

// -------------------------
// 共通トークン読み込み
// -------------------------
const primitives = JSON.parse(fs.readFileSync(INPUT_PRIMITIVES, "utf-8"));
const semantic = JSON.parse(fs.readFileSync(INPUT_SEMANTIC, "utf-8"));

// -------------------------
// プラットフォーム定義
// -------------------------
const platforms = [
  {
    name: "tailwind",
    convert: convertTailwind,
    output: "tailwind.json",
  },
  // NOTE:
  // 一旦はtailwindのみに絞る.iOS/Androidは未実装。
  //   {
  //     name: "ios",
  //     convert: convertIOS,
  //     output: "ios.json",
  //   },
  //   {
  //     name: "android",
  //     convert: convertAndroid,
  //     output: "android.json",
  //   },
];

// -------------------------
// 変換 & 出力
// -------------------------
for (const platform of platforms) {
  const result = platform.convert(primitives.primitives, semantic.semantic);
  const outputPath = path.join(TOKENS_DIR, platform.output);

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`✔ Generated ${platform.output}`);
}

console.log("🎉 All platform tokens generated.");
