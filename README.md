このリポジトリは、Figma で管理しているデザイントークンを
Style Dictionary を使って各プラットフォーム向けに変換・管理するためのものです。

**---用途---**

- Figma の variables、styles を JSON 形式でエクスポートする
- STyle Dictionary で扱うための JSON にフォーマットする
- Figma の variables / styles を JSON にエクスポート
- 各プラットフォーム（Tailwind、iOS、Android など）で利用可能にする

**---ディレクトリ構成---**

styles_to_JSON/
├─ figma_plugin/ ...Figma からトークン JSON をエクスポートするプラグイン
├─ style-dictionary/ ...共通デザイントークンへの変換ルール・設定
├─ platform-converter/ ...各プラットフォーム用への変換
├─ tokens/ ...
│ ├─ source/ ...元となるデザイントークン（編集対象）
│ │ ├─ primitives.json
│ │ └─ semantic.json
│ └─ build/ ...変換後の JSON（直接編集しない）
│
└─package.json

**---使用方法---**<br>

- Figma のデザイントークンをエクスポート
  1.  リポジトリをローカルにクローン
  2.  Figma ファイルを開く
  3.  「プラグインとウィジェット」から「マニフェストからインポート」を選択
  4.  manifest.json を指定してプラグインを登録
  5.  プラグインを実行して JSON をダウンロード

- Style Dictionary で共通デザイントークンを生成
  1.  ダウンロードしたJSONを tokens/source/ に配置
  2.  CLIで変換を実行
      ```
      npm run build
      ```
  3.  tokens/build/ に変換されたJSONが生成される
  4.  source、buildのJSONはcommitしてOK

- 各プラットフォーム向けに変換
  1.  共通デザイントークンを　tokens/source/ に配置
  2.  CLIで変換を実行
      ```
      npm run build:platform
      ```
  3.  tokens/build/ に変換されたJSONが生成される
  4.  source、buildのJSONはcommitしてOK

- Tokens の利用
  - Tailwind CSS
    - 生成したJSONをtaiwind.config.jsで読み込む
  - iOS / Android
    - iOS: StyleDictionarySwift でJSONを読み込む
    - Android: StyleDictionaryAndroid でJSONを読み込む
