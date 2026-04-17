# 随机密码生成器

一个适合个人使用的中文静态工具，可以直接部署到 GitHub Pages，也可以本地打开使用。

## 功能

- 按长度生成随机密码
- 支持小写字母、大写字母、数字、特殊字符组合
- 支持排除易混淆字符
- 自动显示密码强度
- 一键复制密码
- 支持输入明文并用浏览器内置 Web Crypto API 生成 RSA 密文
- 所有生成逻辑都在浏览器本地完成

## 本地使用

直接打开 `index.html` 即可使用。

## 运行测试

```bash
node --test tests/password-generator.test.mjs
```

## GitHub Pages

这个项目使用纯静态文件，无需构建。

## 项目文件

- `index.html`：页面结构
- `styles.css`：页面样式
- `script.js`：页面交互
- `password-generator.mjs`：密码生成核心逻辑
- `tests/password-generator.test.mjs`：逻辑测试
