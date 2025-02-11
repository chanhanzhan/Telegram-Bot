export default {
    command: 'usecode',
    description: '使用积分兑换码（所有用户）',
    permission: 'user',
    handler: async (ctx) => {
        try {
            const [code] = ctx.message.text.split(' ').slice(1);

            if (!code) {
                return ctx.reply('请提供一个有效的兑换码。');
            }

            const exchangeCode = await db.get('SELECT * FROM exchange_codes WHERE code = ?', code);

            if (!exchangeCode) {
                return ctx.reply('无效的兑换码。');
            }

            if (exchangeCode.used) {
                return ctx.reply('该兑换码已被使用。');
            }

            const userId = ctx.from.id;

            await db.run(
                'UPDATE users SET points = points + ? WHERE id = ?',
                [exchangeCode.points, userId]
            );

            await db.run(
                'UPDATE exchange_codes SET used = 1 WHERE code = ?',
                [code]
            );

            ctx.reply(`成功使用兑换码：${code}，获得 ${exchangeCode.points} 积分！`);

        } catch (error) {
            logger.error('使用兑换码时出错:', error);
            ctx.reply('使用兑换码时发生了错误，请稍后再试。');
        }
    }
}
