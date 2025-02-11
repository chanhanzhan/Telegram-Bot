import { v4 as uuidv4 } from 'uuid';

export default {
    command: 'generatecode',
    description: '生成积分兑换码（管理员）',
    permission: 'admin',
    handler: async (ctx) => {
        try {
            const [points] = ctx.message.text.split(' ').slice(1);

            if (!points || isNaN(points) || parseInt(points) <= 0) {
                return ctx.reply('请提供有效的积分数（正整数）。');
            }

            const code = uuidv4()
            await db.run(
                'INSERT INTO exchange_codes (code, points) VALUES (?, ?)',
                [code, points]
            );

            ctx.reply(`成功生成兑换码：${code}\n该兑换码可兑换 ${points} 积分。`);

        } catch (error) {
            logger.error('生成兑换码时出错:', error);
            ctx.reply('生成兑换码时发生了错误，请稍后再试。');
        }
    }
}
