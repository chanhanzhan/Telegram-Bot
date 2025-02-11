import { readdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { checkPermission } from './permission.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const commandPluginMap = new Map(); // 记录命令对应的插件

export async function loadPlugins(bot, db, config) {
    const pluginFiles = await readdir(path.join(__dirname, '../app'))

    for (const file of pluginFiles.filter(f => f.endsWith('.js'))) {
        const plugin = await import(`../app/${file}`)
        const { command, description, permission, handler } = plugin.default

        if (!command || !handler) {
            logger.warn(`插件 ${file} 缺少必要的 "command" 或 "handler"，已跳过`)
            continue
        }

        commandPluginMap.set(`/${command}`, file) // 记录插件来源

        bot.command(command, checkPermission(permission), async (ctx) => {
            ctx.db = db
            ctx.config = config

            // 获取触发命令的相关信息
            const msg = ctx.message
            if (!msg) return

            const userId = msg.from.id
            const username = msg.from.username || `用户${userId}`
            const chatType = msg.chat.type // 'private' 代表私聊, 'group' 代表群聊
            const chatId = msg.chat.id
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

            // 格式化日志输出，只显示必要信息
            const logMessage = `[${chatType === 'private' ? '私聊' : '群'}|${chatId}] [${username}(${userId})] ${content}`
            logger.info(`[命令触发] /${command} ${logMessage}`)

            await handler(ctx)
        })

        logger.info(`插件 ${file} 已加载，注册命令 /${command}`)
    }
}
