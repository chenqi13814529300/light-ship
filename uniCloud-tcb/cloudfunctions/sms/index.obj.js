// 开发文档: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
const uniID = require('uni-id')
const db = uniCloud.database();
module.exports = {
	// 发送验证码
	async sendSms(mobile, type) {
		// 生成验证码可以按自己的需求来，这里以生成6位数字为例
		const randomStr = '00000' + Math.floor(Math.random() * 1000000)
		const code = randomStr.substring(randomStr.length - 4)
		const res = await uniID.sendSmsCode({
			mobile,
			templateId: "14408",
			code,
			type
		})
		return res
	},

	// 校验验证码
	async verifySmsCode(mobile, code, type) {
		const res = await uniID.verifyCode({
			mobile,
			code,
			type
		})
		return res
	},


	// 根据电话号码查找个人信息
	async getUserByMobile(mobile) {
		let {
			data
		} = await db.collection("uni-id-users").where({
			"mobile": mobile
		}).get()
		if (data[0]) {
			return {
				code: 0,
				msg: '查询成功',
			}
		} else {
			return {
				code: -100,
			}
		}
	},

	// 手机+短信 登录
	// 注册后的可以直接登录，如果没有注册过则去注册页面

	async smsLogin(mobile, code) {
		// 判断mobild是否注册了
		const sms = uniCloud.importObject("sms")
		try {
			const res = await sms.getUserByMobile(mobile)
		} catch (e) {
			// 异常则显示未注册-100
			return {
				res: e
			}
		}


		const res = await db.collection("uni-id-users")
			.where({
				"mobile": mobile
			})
			.get()

		if (res.data[0].del == true) {
			return {
				code: -200,
				msg: "你被封号了"
			}
		}


		try {
			const res = await uniID.loginBySms({
				mobile,
				code
			})
			return {
				res: res
			}
		} catch (e) {
			return {
				res: e
			}
		}

	}
}
