# Telegram-Bot 🤖

## 项目描述 📄
这是一个用于与 Telegram 进行交互的机器人项目。

## 使用说明 📚
1. 克隆此仓库到本地：
   ```bash
   git clone <repository-url>
   ```
2. 安装所需的依赖项：
   ```bash
   npm install
   ```
3. 配置环境变量：
   - 在 `config/config.yaml` 中填写相关配置信息：
     ```yaml
     botToken: Telegram Bot Token
     admin: 管理员id
     proxy: 国内服务器或者本地调试使用的代理(非必填)
          host: 代理主机 (非必填)
          port: 代理端口 (非必填)
     ```
4. 启动机器人：
   ```bash
   node index
   ```

## 文件结构 📂
```
Telegram-Bot/
├── app/
│   └── sign.js
│   └── ...其他机器人插件
├── components/
│   └── db.js
├── config/
│   └── config.yaml
├── data/
│   └── data.db
├── lib/
│   └── ...其他文件
├── bot.js
├── index.js
├── package.json
└── README.md
```