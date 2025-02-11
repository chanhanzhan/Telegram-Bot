import { Telegraf } from 'telegraf'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { loadPlugins } from './lib/pluginLoader.js'
import { readdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from './lib/logger.js'  // 确保引入 logger
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const escapeMarkdown = (text) => {
    const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    return text.replace(new RegExp(`[${specialChars.join('\\')}]`, 'g'), '\\$&');
}

async function loadCommands() {
    const commands = []
    try {
        const files = await readdir('./app')
        for (const file of files) {
            if (file.endsWith('.js')) {
                try {
                    const commandModule = await import(path.join(__dirname, 'app', file))
                    if (commandModule.default) {
                        commands.push(commandModule.default)
                    }
                } catch (error) {
                    logger.error(error.stack)
                    logger.error(`加载命令 ${file} 时出错: ${error.message}`)
                }
            }
        }
    } catch (error) {
        logger.error('加载命令时出错:', error)
    }
    return commands
}



const sendMessage = async (ctx, text) => {
    try {
        if (!ctx || !ctx.replyWithMarkdownV2) {
            throw new Error('ctx 无效，无法发送消息');
        }
        const escapedText = escapeMarkdown(text);
        await ctx.replyWithMarkdownV2(escapedText);
    } catch (error) {
        logger.error(`消息发送失败: ${text}`, error);
    }
};

export async function createBot(config) {
    const options = {}

    if (config.proxy && config.proxy.host) {
        const proxy = `http://${config.proxy.host}:${config.proxy.port}`
        options.telegram = { agent: new HttpsProxyAgent(proxy) }
    }

    let bot
    try {
        bot = new Telegraf(config.botToken, options)
    } catch (error) {
        logger.error('创建 Bot 失败:', error)
        return null
    }

    // 加载命令并动态添加到机器人
    const commands = await loadCommands()

    // 设置命令菜单
    const commandList = commands.map(command => ({
        command: command.command,
        description: command.description
    }))

    try {
        // 更新机器人菜单
        await bot.telegram.setMyCommands(commandList)
        logger.info('成功更新命令菜单')
    } catch (error) {
        logger.error('更新命令菜单时出错:', error)
    }

    // 注册命令处理器
    for (const command of commands) {
        bot.command(command.command, command.handler)
    }

    bot.start(async (ctx) => {
        try {
            const userId = ctx.from.id;
            const username = ctx.from.username || `用户${userId}`;
            const inviteCode = ctx.startPayload;

            // 检查用户是否已存在
            const existingUser = await global.db.get('SELECT id FROM users WHERE id = ?', userId);
            if (!existingUser) {
                await global.db.run(
                    'INSERT INTO users (id, username, permission, points) VALUES (?, ?, ?, ?)',
                    userId, username, 'user', 1
                );

                const registerMessage = `
                🎉 已为你自动注册！
                👤 用户信息:
                ID: ${userId}
                用户名: @${username}
                权限: user
                初始积分: 1
                `;
                await sendMessage(ctx, registerMessage);
            }

            const welcomeMessage = `
🎉 *欢迎 @${username} 使用本机器人！*

*常用命令:*
/sign - 签到
/register - 注册
/all - 综合查询 (什么都能查)
/qq - 全网第一QQ跑现手机号 (可选参数: QQ 号)
/sfz - 全国大头 (可选参数: 名字+身份证)
/invite - 获取邀请链接
/usecode - 使用积分兑换码
/me - 查看我的信息

*ADMIN 组命令:*
/addpoints - 添加积分 (可选参数: 用户ID 积分数)
/generatecode - 生成积分兑换码 (可选参数: 积分数)
            `;
            await sendMessage(ctx, welcomeMessage);
        } catch (error) {
            logger.error('处理 /start 失败:', error);
        }
    });

    try {
        await loadPlugins(bot, config);
    } catch (error) {
        logger.error('加载插件失败:', error);
    }

    return bot
}
