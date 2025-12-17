このリポジトリは、Figma で管理しているデザイントークンを
Style Dictionary を使って各プラットフォーム向けに変換・管理するためのものです。

**---用途---**

Figma で使用されているデザイントークンをコードでも利用するためのプラグイン。

- Figma の variables、styles を JSON 形式でエクスポートする
- STyle Dictionary で扱うための JSON にフォーマットする

**---ディレクトリ構成---**

- figma-plugin/ : Figma からトークン JSON をエクスポートするプラグイン
- tokens/source/ : 正のデザイントークン（編集対象）
- tokens/build/ : 生成物（直接編集しない）
- style-dictionary/ : 変換ルール

**---利用フロー---**

1. Figma でプラグインを実行<br>

   ↓ 　(figma-plugin)<br>

2. tokens/source/に JSON を格納<br>

   ↓ 　(style-dictionary 実行)<br>

3. tokens/build/に生成した JSON を格納<br>

   ↓<br>

4. 各プロダクトでデザイントークンを使用（Tailwind / etc）

**---使用方法---**<br>

Figma のデザイントークンをエクスポート

1. リポジトリをローカルにクローンする（ローカルファイルしか参照できないため）
2. Figma ファイルを開く
3. 「プラグインとウィジェット」から「マニフェストからインポート」を選択
4. 参照ファイルに manifest.json を選択
5. スクリプト実行後、Figma の UI から JSON ファイルをダウンロード

Style Dictionary で各種プラットフォーム向けに変換

1. aaaa

Tokens の利用

1. aaaaa
