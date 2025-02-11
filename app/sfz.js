import axios from 'axios'

export default {
    command: 'sfz',
    description: '查询身份证号码并扣除 1 积分',
    permission: 'user',
    handler: async (ctx) => {
        const args = ctx.message.text.split(' ')
        const name = args[1]
        const idNumber = args[2]

        if (!name || !idNumber) {
            return ctx.reply('请提供姓名和身份证号码。')
        }

        const userId = ctx.message.from.id

        try {
            // 获取 cookie
            const cookieResponse = await axios.get('https://ggfw.rst.hunan.gov.cn/hrss-pss-pw-usc/web/login/loginByFaceGetWeappVerifyKeyH5')
            const cookie = cookieResponse.headers['set-cookie']
            logger.info(`获取到 cookie: ${cookie}`)

            // 查询身份证号码信息
            const payload = {
                "aac003": name,
                "aac002": idNumber,
                "checkCode": "SWbIQQldS87Huyvn3iORVAElCFeoOXQo",
                "openid": "encry_4e4b6d7556705255735759375246652f72364972737466317244385659744636375a46353671674a7333513d",
                "replayTimestamp": 1738917387269,
                "replayNonce": "9f1fea60-e52e-11ef-84b1-cd478b6e0af3",
                "replaySign": "PKRZYJLRZ6cqIvlmL62mcvUCiwldQu0RCufCf9khKycuiKS5zDBnl4qnTsQPedL3zSO4L+raYRhAuvSRPNRmK1oes1Xt5NexATsDZ1jcjs/S3NGb91oAEmFUIII5loTPMZme92DUkSoXNGa6p3/WIGqHo7tUIIqLTAsFEXyF0jbh3RCOmkW6wwexiWGrkCYL1PkgEyeXBFaVOAnOxaFQnrksG38582SUaTrEG5hZ1ggSelSIGoFvZvYgpu17LzwE/MJ9TolzSv+7P23qQM4UGFKPMyqkLWwnIYmt96cY6eqiWzmagyE0j58rqNlqt3nX2VhFxARp49zxLf7a6qfaHA=="
            }

            const headers = {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; CLT-AL01 Build/HUAWEICLT-AL01; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.103 Mobile Safari/537.36 XWEB/1300333 MMWEBSDK/20241103 MMWEBID/523 MicroMessenger/8.0.55.2780(0x2800373D) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
                "channel": "2",
                "Origin": "https://ggfw.rst.hunan.gov.cn",
                "X-Requested-With": "com.tencent.mm",
                "Referer": "https://ggfw.rst.hunan.gov.cn/WeiWoAppH5/user/newLogin?stack-key=4ff8ee8f",
                "Cookie": cookie
            }

            const response = await axios.post('https://ggfw.rst.hunan.gov.cn/hrss-pss-pw-usc/web/login/loginByFaceGetWeappVerifyKeyH5', payload, { headers })
            const { code, type, message, data } = response.data

            if (code !== 0 || type !== 'success' || !data) {
                logger.warn(`没有找到身份证号码 ${idNumber} 的信息`)
                return ctx.reply('没有找到该身份证号码信息。')
            }

            // 扣除 1 积分
            await db.run('UPDATE users SET points = points - 1 WHERE id = ?', [userId])
            logger.info(`用户 ${userId} 扣除 1 积分`)

            logger.info(`成功查询到身份证号码：${idNumber}，姓名：${name}`)
            ctx.reply(`成功查询到身份证号码：${idNumber}\n姓名：${name}\n\n已扣除 1 积分。`)
        } catch (error) {
            logger.error('查询身份证号码时发生错误:', error)
            ctx.reply('查询身份证号码时发生了错误，请稍后再试。')
        }
    }
}
