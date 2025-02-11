export default {
    command: 'sign',
    description: '每日签到',
    permission: 'user',
    handler: async (ctx) => {
        const user = await db.get('SELECT * FROM users WHERE id = ?', ctx.from.id)
        const lastSign = new Date(user.last_sign)
        const now = new Date()

        if (lastSign.toDateString() === now.toDateString()) {
            return ctx.reply('今天已经签到过了')
        }

        await db.run(
            'UPDATE users SET points = points + 1, last_sign = ? WHERE id = ?',
            now.toISOString(), ctx.from.id
        )

        ctx.reply('✅ 签到成功，积分+1')
    }
}