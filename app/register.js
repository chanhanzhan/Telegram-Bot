export default {
    command: 'register',
    description: '注册用户',
    permission: 'all',
    handler: async (ctx) => {
        const userId = ctx.from.id
        const username = ctx.from.username || `用户${userId}`

        const existingUser = await db.get('SELECT * FROM users WHERE id = ?', userId)
        if (existingUser) {
            return ctx.reply('✅ 你已经注册过了，无需重复注册！')
        }

        await global.db.run(
            'INSERT INTO users (id, username, permission, points) VALUES (?, ?, ?, ?)',
            userId, username, 'user', 1
        )

        ctx.replyWithMarkdown(`
        🎉 注册成功！
        👤 用户信息:
        ID: ${userId}
        用户名: @${username}
        权限: user
        初始积分: 1
      `)
    }
}
