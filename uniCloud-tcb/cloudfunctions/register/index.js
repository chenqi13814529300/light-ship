// 云函数register的代码
const uniID = require('uni-id')
exports.main = async function(event, context) {

	const {
		mobile,
		password,
		inviteCode
	} = event
	// 自动验证用户名是否与已经注册的用户名重复，如果重复会直接返回错误。否则会自动生成token并加密password存储username、password、token到数据表uni-id-users，并返回如上响应参数
	const res = await uniID.register({ //支持传入任何值，比如可以直接传入mobile即可设置手机号码，切勿直接传入event否则这是一个极大的安全问题
		"username":mobile,
		"password": password,
		"mobile": mobile,
		"avatar": 'https://7463-tcb-d4ae9humf98e68-0dudeafb75fdc-1310755086.tcb.qcloud.la/head/good3.jpg',
		"goods_count": 0,
		"mobile_confirmed": 1,
		"realname_auth": 0,
		"invite_code": inviteCode,
		"create_invite_code": '',
	})
	return res


}
