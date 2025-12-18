ここでは、JSON化したデザイントークンデータを
各プラットフォーム向けに変換し、変換後のJSONを格納します。

**---利用方法---**<br>
Style Dictionary で各種プラットフォーム向けに変換

1.  ダウンロードしたJSONを tokens/source/ に配置
2.  CLIで変換を実行
    ```
    npx style-dictionary build --config style-dictionary/style-dictionary.config.js
    ```
3.  tokens/build/ に変換されたJSONが生成される
4.  source、buildのJSONはcommitしてOK
