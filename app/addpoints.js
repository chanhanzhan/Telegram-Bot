export default {
    command: 'addpoints',
    description: '添加积分（管理员）',
    permission: 'admin',
    handler: async (ctx) => {
        try {
            const [userId, points] = ctx.message.text.split(' ').slice(1);

            if (!userId || !points) {
                return ctx.reply('请提供有效的用户ID和积分数。格式：/addpoints <用户ID> <积分>');
            }

            if (isNaN(points) || parseInt(points) <= 0) {
                return ctx.reply('积分数必须是一个正整数。');
            }

            const user = await db.get('SELECT id FROM users WHERE id = ?', userId);
            if (!user) {
                return ctx.reply(`没有找到ID为 ${userId} 的用户。`);
            }

            await db.run(
                'UPDATE users SET points = points + ? WHERE id = ?',
                [points, userId]
            );

            ctx.reply(`成功为用户 ${userId} 添加 ${points} 积分`);

        } catch (error) {
            console.error('添加积分时出错:', error);
            ctx.reply('添加积分时发生了错误，请稍后再试。');
        }
    }
}
