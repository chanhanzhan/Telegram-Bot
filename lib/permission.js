export function checkPermission(requiredPermission) {
    return async (ctx, next) => {
        if (!global.db) {
            return ctx.reply('数据库连接异常，请稍后再试');
        }

        let user = await global.db.get('SELECT permission FROM users WHERE id = ?', ctx.from.id);

        // 如果用户不存在，则自动注册
        if (!user) {
            const userId = ctx.from.id;
            const username = ctx.from.username || `用户${userId}`;
            const defaultPermission = 'user';

            try {
                await global.db.run(
                    'INSERT INTO users (id, username, permission, points) VALUES (?, ?, ?, ?)',
                    userId, username, defaultPermission, 1
                );
                ctx.replyWithMarkdown(`
                🎉 已为你自动注册！
                👤 用户信息:
                ID: ${userId}
                用户名: @${username}
                初始积分: 1
              `);
                user = { permission: defaultPermission };
            } catch (error) {
                console.error('自动注册用户时出错:', error);
                return ctx.reply('自动注册失败，请稍后再试');
            }
        }

        // 检查用户是否为管理员
        const userId = ctx.from.id;
        if (userId === config.admin) {
            user.permission = 'admin'
        }

        const userPermission = user.permission;

        // 如果是管理员，跳过权限检查
        if (userId === config.admin || userPermission === requiredPermission || requiredPermission === 'all') {
            return next();
        }

        // 如果权限不足
        return ctx.reply('⚠️ 权限不足');
    };
}
