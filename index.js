import { readFile, writeFile } from 'fs/promises'
import logger from './lib/logger.js'
import yaml from 'yaml'
import { initDB } from './components/db.js'
import { createBot } from './bot.js'

global.logger = logger
const db = await initDB()
global.db = db;

async function loadConfig() {
    try {
        const defaultConfig = yaml.parse(await readFile('./config/default_config.yaml', 'utf8'))
        let config

        try {
            config = yaml.parse(await readFile('./config/config.yaml', 'utf8'))
        } catch {
            await writeFile('./config/config.yaml', yaml.stringify(defaultConfig))
            config = defaultConfig
        }

        return { ...defaultConfig, ...config }
    } catch (error) {
        logger.error('配置文件加载失败:', error)
        process.exit(1)
    }
}

async function main() {
    const config = await loadConfig()
    global.config = config;
    const bot = await createBot(config)

    // **优化监听消息的日志输出**
    bot.on('message', async (ctx) => {
        try {
            const msg = ctx.message
            if (!msg) return

            const userId = msg.from.id
            const username = msg.from.username || `用户${userId}`
            const chatType = msg.chat.type // 'private' 代表私聊, 'group' 代表群聊
            const chatId = msg.chat.id
            const chatName = msg.chat.title || '私聊'
            let content = ''

            // 处理不同类型的消息
            if (msg.text) {
                content = msg.text
            } else if (msg.photo) {
                content = '[图片]'
            } else if (msg.video) {
                content = '[视频]'
            } else if (msg.voice) {
                content = '[语音]'
            } else if (msg.document) {
                content = '[文件]'
            } else {
                content = '[其他消息类型]'
            }

            // 格式化日志输出
            const logMessage = `[${chatType === 'private' ? '用户' : '群'}|${chatId}] ${username}(${userId}): ${content}`
            logger.info(`[message] ${logMessage}`)
        } catch (error) {
            logger.error(`监听消息时发生错误: ${error}`)
        }
    });

    bot.launch()
}

main().catch(err => logger.error('启动失败:', err))
