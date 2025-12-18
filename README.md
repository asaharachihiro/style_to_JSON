このリポジトリは、Figma で管理しているデザイントークンを
Style Dictionary を使って各プラットフォーム向けに変換・管理するためのものです。

**---用途---**

- Figma の variables、styles を JSON 形式でエクスポートする
- STyle Dictionary で扱うための JSON にフォーマットする
- Figma の variables / styles を JSON にエクスポート
- 各プラットフォーム（Tailwind、iOS、Android など）で利用可能にする

**---ディレクトリ構成---**

- figma-plugin/ : Figma からトークン JSON をエクスポートするプラグイン
- tokens/source/ : 元となるデザイントークン（編集対象）
- tokens/build/ : 変換後の JSON（直接編集しない）
- style-dictionary/ : 変換ルール・設定

**---使用方法---**<br>

- Figma のデザイントークンをエクスポート
  1.  リポジトリをローカルにクローン
  2.  Figma ファイルを開く
  3.  「プラグインとウィジェット」から「マニフェストからインポート」を選択
  4.  manifest.json を指定してプラグインを登録
  5.  プラグインを実行して JSON をダウンロード

- Style Dictionary で各種プラットフォーム向けに変換
  1.  ダウンロードしたJSONを tokens/source/ に配置
  2.  CLIで変換を実行
      ```
      npx style-dictionary build --config style-dictionary/style-dictionary.config.js
      ```
  3.  tokens/build/ に変換されたJSONが生成される
  4.  source、buildのJSONはcommitしてOK

- Tokens の利用
  - Tailwind CSS
    - 生成したJSONをtaiwind.config.jsで読み込む
  - iOS / Android
    - iOS: StyleDictionarySwift でJSONを読み込む
    - Android: StyleDictionaryAndroid でJSONを読み込む
