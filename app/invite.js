import { v4 as uuidv4 } from 'uuid'

export default {
    command: 'invite',
    description: '生成邀请链接',
    permission: 'user',
    handler: async (ctx) => {
        const userId = ctx.from.id;
        let inviteCode, existingInviteCheck;

        try {
            // 检查用户是否已有邀请码
            const existingInvite = await db.get('SELECT invite_code FROM users WHERE id = ?', userId);
            if (existingInvite && existingInvite.invite_code) {
                return ctx.reply(`你已经有一个邀请码了，邀请链接：https://t.me/${ctx.botInfo.username || 'your_bot_username'}?start=${existingInvite.invite_code}`);
            }

            // 如果没有邀请码，生成一个新的邀请码
            do {
                inviteCode = uuidv4();
                existingInviteCheck = await db.get('SELECT invite_code FROM users WHERE invite_code = ?', inviteCode);
            } while (existingInviteCheck);  // 确保邀请码唯一

            // 更新数据库，保存新的邀请码
            await db.run(
                'UPDATE users SET invite_code = ? WHERE id = ?',
                inviteCode, userId
            );

            ctx.reply(`邀请链接：https://t.me/${ctx.botInfo.username}?start=${inviteCode}`);
        } catch (error) {
            console.error('生成邀请码时出错:', error);
            ctx.reply('生成邀请码时出错，请稍后再试。');
        }
    }
}
