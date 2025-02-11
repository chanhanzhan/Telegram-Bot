export default {
    command: 'me',
    description: '查看我的信息',
    permission: 'user',
    handler: async (ctx) => {
      const user = await db.get('SELECT * FROM users WHERE id = ?', ctx.from.id)
      ctx.replyWithMarkdown(`👤 用户信息
ID: ${user.id}
用户名: @${user.username}
积分: ${user.points}`)
    }
  }