ここでは、共通デザイントークンから各プラットフォーム向けの変換を行います。</br>
参照：tokens/build/

- primitives.json
- semantic.json
  </br>

出力：tokens/build/

**---利用方法---**<br>

1. tokens/build/に共通トークンを配置
2. CLIで変換を実行
   ```
   npm run build:platform
   ```
3. tokens/build/ に変換されたJSONが生成される
4. source、buildのJSONはcommitしてOK
