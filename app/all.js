import axios from 'axios'

export default {
    command: 'all',
    description: '查询所有信息并扣除 1 积分',
    permission: 'user',
    handler: async (ctx) => {
        const args = ctx.message.text.split(' ')
        const queryValue = args[1]

        if (!queryValue) {
            return ctx.reply('请提供查询值。')
        }

        const userId = ctx.message.from.id

        try {
            // 检查用户积分
            const user = await db.get('SELECT points FROM users WHERE id = ?', [userId])

            if (user && user.points < 1) {
                return ctx.reply('您的积分不足，无法进行查询。')
            }

            // 查询信息
            const response = await axios.get(`https://api.qnm6.top/tszj666.php?link=${encodeURIComponent(queryValue)}`)
            const { code, message: responseMessage, shuju } = response.data

            if (code === 500) {
                return ctx.reply('查询失败')
            }

            if (code !== 200) {
                return ctx.reply('没有找到相关信息。')
            }

            // 解析返回的 JSON 信息并过滤重复信息
            const uniqueData = new Set()
            const parsedData = shuju.split('\n\n').map(item => {
                const lines = item.split('\n').map(line => line.trim())
                const formattedItem = lines.join('\n')
                if (!uniqueData.has(formattedItem)) {
                    uniqueData.add(formattedItem)
                    return formattedItem
                }
                return null
            }).filter(item => item !== null)

            // 扣除 1 积分
            await db.run('UPDATE users SET points = points - 1 WHERE id = ?', [userId])
            logger.info(`用户 ${userId} 扣除 1 积分`)

            // 分段发送信息
            const maxMessageLength = 4096
            let messageToSend = '成功查询到信息：\n'
            for (const data of parsedData) {
                if ((messageToSend + data).length > maxMessageLength) {
                    await ctx.reply(messageToSend)
                    messageToSend = ''
                }
                messageToSend += data + '\n\n'
            }
            if (messageToSend) {
                await ctx.reply(messageToSend)
            }

            await ctx.reply('已扣除 1 积分。')
        } catch (error) {
            logger.error('查询信息时发生错误:', error)
            ctx.reply('查询信息时发生了错误，请稍后再试。')
        }
    }
}