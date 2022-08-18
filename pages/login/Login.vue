<template>
	<view class="content">
		<view class="logo">
			<image src="@/static/basic/logo.png" mode="widthFix"></image>
		</view>
		<view class="welcome">
			欢迎登录启航
		</view>
		<!-- <button @click="isAutoLogin">自动登录</button> -->
		<view class="checkTip">
			<text :class="{currentSelect:isTradition===true}" @click="selectType">传统登录</text>
			<text>/</text>
			<text :class="{currentSelect:isTradition!==true}" @click="selectType">短信一键登录</text>
		</view>

		<form>
			<view class="uni-form-item uni-column">
				<input class="uni-input" name="input" v-model="loginInfo.mobile" placeholder="手机号" />
			</view>
			<view class="uni-form-item uni-column codeBox" v-if="!isTradition">
				<input class="uni-input " name="input" v-model="loginInfo.code" placeholder="验证码" />
				<button class="getCode" :disabled="isdisabledFn" @click="getCode">{{isSms}}</button>
			</view>
			<view class="uni-form-item uni-column" v-else>
				<input class="uni-input" name="input" type="password" v-model="loginInfo.password" placeholder="密码" />
			</view>
			<view class="tip">
				<text>没有账号？</text>
				<text class="register" @click="goRegister">注册</text>
				<text class="find" @click="resetPwdBySms">忘记密码</text>
			</view>
			<view class="uni-btn-v">
				<button form-type="submit" class="loginBtn" @click="submitLogin">登录</button>
			</view>
		</form>

	</view>
</template>

<script>
	import {
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				loginInfo: {
					mobile: '',
					password: ''
				},
				// 传统登录还是短信一键登录
				isTradition: true,
				countdown: 60,
				isSms: "获取验证码",
				isdisabledFn: false
			}
		},
		onLoad() {},
		mounted() {
			this.isAutoLogin()
		},
		methods: {
			...mapMutations(["setUserInfo"]),
			// 判断是否支持一键登录
			isAutoLogin() {
				let _that = this
				uni.getProvider({ //获取可用的服务提供商
					service: 'oauth',
					success: function(res) {
						console.log(res.provider) // ['weixin', qq', 'univerify']
					}
				});
				uni.preLogin({ //预登录
					provider: 'univerify', //用手机号登录
					success() {
						_that.autoStatus = true
						console.log('预登录成功')
						_that.fasterLogin()
					},

					fail(err) { //预登录失败
						_that.autoStatus = false
						_that.error = err
						console.log('错误码：' + err.errCode)
						console.log(err.errMsg)
					}
				})
			},

			async fasterLogin() {

				let that = this

				uni.login({
					provider: 'univerify',
					async success(res) { // 登录成功
						console.log(res.authResult); // {openid:'登录授权唯一标识',access_token:'接口返回的 token'}
						const login = uniCloud.importObject("login")
						const fastLoginRes = await login.fastLogin(res.authResult)
						console.log(fastLoginRes)
						if (fastLoginRes.code == -100) {
							uni.showToast({
								title: "请先注册",
								icon: "none"
							})
							setTimeout(function() {
								uni.closeAuthView()
								uni.navigateTo({
									url: "/pages/register/Register"
								})
							}, 1000)

						}

						if (fastLoginRes.code == 0) {
							uni.closeAuthView()
							that.loginAfter(fastLoginRes)
						}

					},
					fail(res) { // 登录失败
						console.log(res.errCode)
						uni.closeAuthView()
					}
				})
			},
			// 选择登录类型
			selectType() {
				this.isTradition = !this.isTradition
			},
			async submitLogin() {
				const data = this.loginInfo
				const that = this
				console.log(this.isTradition)

				if (this.isTradition) {
					const login = uniCloud.importObject("login")
					const loginInfo = await login.commonLogin(data)
					console.log(loginInfo)
					if (loginInfo.code == 0) {
						// 执行登录成功后的逻辑
						that.loginAfter(loginInfo)
					}
				} else {
					// 电话号码+验证码登录
					// 1.是否填写验证码
					if (that.loginInfo.code) {
						const sms = uniCloud.importObject("sms")
						const {
							res
						} = await sms.smsLogin(that.loginInfo.mobile, that.loginInfo.code)
						// res.code为-100则res.errMsg 未注册
						// 50202  errMsg "验证码错误或已失效"
						// 0 是成功的
						console.log(res)
						switch (res.code) {
							case 0:
								// 执行登录成功后的逻辑
								that.loginAfter(res)
								break;
							case -100:
								uni.showToast({
									title: res.errMsg,
									icon: 'none'
								});
								break;
							case 50202:
								uni.showToast({
									title: res.errMsg,
									icon: 'none'
								});
								break;
							case -300:
								uni.showToast({
									title: res.errMsg,
									icon: 'none'
								});
								break;
						}
					} else {
						uni.showToast({
							title: "请填写验证码",
							icon: 'none'
						})
					}

				}



			},
			// 登录成功后的逻辑
			loginAfter(res) {
				// uni.closeAuthView()
				uni.showToast({
					title: '登录成功',
					icon: 'none',
				})

				// 保存token
				uni.setStorageSync('uni_id_token', res.token)
				uni.setStorageSync('uni_id_token_expired', res.tokenExpired)

				var dayAdd1 = new Date();
				dayAdd1 = dayAdd1.setDate(dayAdd1.getDate() + 1);
				dayAdd1 = new Date(dayAdd1);
				// 记入token终止日期，1天
				uni.setStorageSync('uni_id_token_end_time', dayAdd1.getTime())
				// 其他业务代码，如跳转到首页等

				this.setUserInfo(res.userInfo)

				setTimeout(function() {
					uni.switchTab({
						url: "/pages/index/Index"
					})
				}, 1000)
			},

			goRegister() {
				uni.navigateTo({
					url: "/pages/register/Register"
				})

			},
			// 获取验证码时间
			settime() {
				let smsTime = null
				if (this.countdown == 0) {
					this.isdisabledFn = false
					this.isSms = "获取验证码"
					this.countdown = 60;
					clearInterval(smsTime)
				} else {
					this.isdisabledFn = true
					this.isSms = "重新发送(" + this.countdown + ")"
					this.countdown--;
					smsTime = setTimeout(() => {
						this.settime()
					}, 1000)
				}
			},
			// 获取验证码
			async getCode() {
				if (this.loginInfo.mobile) {
					this.settime()
					const sms = uniCloud.importObject("sms")
					const res = await sms.sendSms(this.loginInfo.mobile, "login")
					uni.showToast({
						title: "验证码已发送",
						icon: "none"
					})
					console.log(res)
				} else {
					uni.showToast({
						title: "请输入手机号",
						icon: "none"
					})
				}
			},
			// 重置密码
			resetPwdBySms() {
				uni.navigateTo({
					url: "/pages/login/ResetPwd"
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	.logo {
		height: 400rpx;
		// background-color: red;
		display: flex;
		justify-content: center;
		align-items: center;

		image {
			width: 30%
		}
	}

	.welcome {
		color: white;
		font-size: 45rpx;
		margin: 20rpx 0;
	}

	.checkTip {
		color: white;
		font-size: 35rpx;

		text {
			margin-right: 25rpx;
			color: #8d9da8;
		}

		// 传统vs短信
		.currentSelect {
			padding: 10rpx;
			border-radius: 40rpx;
			color: #3b496f;
			background-color: #dc991f;
		}
	}

	.uni-input {
		height: 90rpx;
		border: 1rpx solid #4954b3;
		margin-top: 30rpx;
		padding-left: 30rpx;
		font-size: 27rpx;
		color: white;
		border-radius: 40rpx;
	}

	.codeBox {
		position: relative;

		.getCode {
			width: 160rpx;
			height: 50rpx;
			padding: 0;
			position: absolute;
			color: #0099CC;
			right: 15rpx;
			top: 50%;
			transform: translateY(-50%);
			cursor: pointer;
			font-size: 20rpx;
			background-color: #52235f;
			line-height: 50rpx;
		}
	}

	.loginBtn {
		color: white;
		// background-color: #3b496f;
		background-color: #dc991f;
		border-radius: 60rpx;
	}

	.tip {
		margin: 30rpx 0 80rpx;
		color: #C8C7CC;
		font-size: 25rpx;

		.register {
			color: white;
		}

		.find,
		.update {
			color: white;
			float: right;
			margin: 0 20rpx;
		}
	}
</style>
