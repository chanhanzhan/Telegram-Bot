import axios from 'axios'

export default {
    command: 'qq',
    description: '查询 QQ 号并扣除 1 积分',
    permission: 'user',
    handler: async (ctx) => {
        const qqNumber = ctx.message.text.split(' ')[1]

        if (!qqNumber) {
            return ctx.reply('请提供一个 QQ 号。')
        }

        const userId = ctx.message.from.id

        try {
            // 检查用户积分
            const user = await db.get('SELECT points FROM users WHERE id = ?', [userId])

            if (user && user.points < 1) {
                return ctx.reply('您的积分不足，无法进行查询。')
            }

            // 扣除 1 积分
            await db.run('UPDATE users SET points = points - 1 WHERE id = ?', [userId])

            // 查询 QQ 号信息
            const response = await axios.get(`https://zy.xywlapi.cc/qqapi?qq=${qqNumber}`)
            const { status, message, qq, phone, phonediqu } = response.data

            if (status === 500) {
                return ctx.reply('没有找到该 QQ 号信息。')
            }

            ctx.reply(`成功查询到 QQ 号：${qq}\n手机号：${phone}\n手机号地区：${phonediqu}\n\n已扣除 1 积分。`)
        } catch (error) {
            logger.error('查询 QQ 号时发生错误:', error)
            ctx.reply('查询 QQ 号时发生了错误，请稍后再试。')
        }
    }
}
