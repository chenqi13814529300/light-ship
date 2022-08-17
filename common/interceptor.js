//拦截器 拦截只要是未登录状态，想要跳转到名单内的路径时，直接跳到登录页。
// 页面名单


export default function myInterceptor() {
	const whiteList = [
		'/pages/index/index',
		'/pages/index/DigitGoodsDetails/DigitGoodsDetails',
		'/pages/Register/Register',
		'/pages/Login/Login'
	]
	let list = ["switchTab", "navigateTo" ];
	list.forEach(item => {
		uni.addInterceptor(item, {
			// tabbar页面跳转前进行拦截
			invoke(e) {
				// 去除?后的参数
				const url = e.url.split('?')[0];
				// 先判断是否是白名单上面的路径
				if (whiteList.includes(url)) {
					// 如果是无需token检验直接跳转
					console.log("在白名单中")
					return true
				} else {
					// 进行token校验，如果有则跳转，无则跳转到登录页面
					if (uni.getStorageSync('uni_id_token')) {
						// console.log(uni.getStorageSync('uni_id_token'))
						console.log("token校验成功")
						return true
					} else {
						console.log("token校验失败或者无token")
						uni.redirectTo({
							url: '/pages/Login/Login'
						});
						return false
					}
				}

			},
			success(e) {
				// console.log(e)
			}
		})

	})


}
