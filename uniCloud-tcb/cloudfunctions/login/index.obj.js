const uniID = require('uni-id')

module.exports = {

	// 普通账号 密码登录
	async commonLogin(userInfo) {

		const {
			mobile,
			password
		} = userInfo


		// 自动完成mobile、password验证是否合法的逻辑
		const res = await uniID.login({
			username: mobile,
			password,
		})

		return res

	},
	// 重置密码
	async resetPwdBySms(resetInfo) {
		const {
			mobile,
			code,
			password
		} = resetInfo

		await uniID.resetPwdBySms({
			mobile,
			code,
			password
		})
		
		return {
			code:0
		}
	},
	
	// 手机一键登录
	async fastLogin(userInfo) {
		
		
		const {
			access_token,
			openid
		} = userInfo
	
		const res = await uniID.loginByUniverify({
			access_token,
			openid,
			type:'login'
		})
		return res
	},
}
