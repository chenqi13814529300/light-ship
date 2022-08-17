<template>
	<view class="content">
		<view class="logo">
			<image src="@/static/basic/logo.png" mode="widthFix"></image>
		</view>
		<view class="welcome">
			欢迎注册启航
		</view>

		<form>
			<view class="uni-form-item uni-column">
				<input class="uni-input" v-model="regsiterInfo.mobile" name="input" placeholder="手机号" />
			</view>
			<view class="uni-form-item uni-column">
				<input class="uni-input" v-model="regsiterInfo.password" name="input" placeholder="密码" />
			</view>
			<view class="uni-form-item uni-column codeBox">
				<input class="uni-input" v-model="regsiterInfo.inviteCode" name="input" placeholder="邀请码(选填)" />
				<button class="getInviteCode" @click="$noMultipleClicks(checkInviteCode)">检查邀请码</button>
			</view>
			<view class="uni-form-item uni-column codeBox">
				<input class="uni-input " name="input" v-model="regsiterInfo.code" placeholder="验证码" />
				<button class="getCode" :disabled="isdisabledFn" @click="getCode">{{isSms}}</button>
			</view>
			<view class="tip">
				<text>已有账号？</text>
				<text class="login" @click="goLogin">登录</text>
			</view>
			<view class="checkBox">
				<checkbox-group @change="selfChangde">
					<checkbox :checked="isAgree" /><text>阅读即同意</text>
					<text class="big" @click="userAgreement">《用户协议》</text><text>和</text><text class="big"
						@click="privacyAgreement">《隐私政策》</text>
				</checkbox-group>
			</view>
			<view class="uni-btn-v">
				<button form-type="submit" class="registerBtn" @click="$noMultipleClicks(submitRegister)">注册</button>
			</view>
		</form>
	</view>
</template>


<script>
	var that
	export default {
		data() {
			return {
				// 防抖挂载
				noClick: true,
				regsiterInfo: {
					mobile: '',
					password: '',
					inviteCode: '',
					code: ''
				},
				isAgree: false,
				countdown: 60,
				isSms: "获取验证码",
				isdisabledFn: false
			}
		},
		onLoad(option) {
			that = this
			this.regsiterInfo.inviteCode = option.inviteCode

		},
		methods: {
			async checkInviteCode() {
				const invite = uniCloud.importObject("invite")
				const isHave = await invite.isHaveInviteCode(this.regsiterInfo.inviteCode)
				uni.showToast({
					title: isHave.msg,
					icon: "none"
				})
			},
			userAgreement() {
				// uni.reLaunch({
				// 	url: "/pages/Register/UserAgreement"
				// })
			},
			privacyAgreement() {
				// uni.reLaunch({
				// 	url: "/pages/Register/PrivacyAgreement"
				// })
			},
			selfChangde(e) {
				this.isAgree = !this.isAgree;
			},

			// 注册
			async submitRegister() {
				if (!this.isAgree) {
					uni.showToast({
						title: '请阅读用户协议与隐私政策',
						icon: 'error',
						duration: 850
					});
				} else {

					try {
						const sms = uniCloud.importObject("sms")
						const smsInfo = await sms.verifySmsCode(this.regsiterInfo.mobile, this.regsiterInfo.code,
							"register")
						console.log(smsInfo)
						if (smsInfo.code == 0) {

							const data = this.regsiterInfo
							// 客户端代码
							uniCloud.callFunction({
								name: 'register',
								data,
								async success(res) {
									console.log(res)
									if (res.result.code === 0) {
										uni.showToast({
											title: '注册成功',
											icon: 'none'
										})
										// 2.8.0版本起调整为蛇形uni_id_token（调整后在一段时间内兼容驼峰uniIdToken）
										uni.setStorageSync('uni_id_token', res.result.token)
										uni.setStorageSync('uni_id_token_expired', res.result.tokenExpired)


										// 把邀请码清单归到邀请码数据库之中(存在就入库不存在不执行)
										if (that.regsiterInfo.inviteCode) {
											console.log("我有邀请码奥")
											const userInfo = {
												"registerUserId": res.result.uid,
												"mobile": res.result.mobile,
												"username": res.result.username
											}
											const invite = uniCloud.importObject("invite")
											await invite.updateInvite(that.regsiterInfo.inviteCode,
												userInfo)
										}

										// 跳转到登录页
										setTimeout(function() {
											uni.navigateTo({
												url: "/pages/login/Login"
											})
										}, 1000)


									} else if (res.result.code == -100) {
										uni.showToast({
											title: res.result.msg,
											icon: "none"
										})
									} else {
										uni.redirectTo({
											content: res.result.message,
											showCancel: false
										})
									}
								},
								fail(res) {
									console.log(res)
									uni.showModal({
										content: '注册失败，请稍后再试',
										showCancel: false
									})
								}
							})



						} else {
							uni.showToast({
								title: '注册高峰期，请稍后再试',
								icon: 'none'
							})
						}
					} catch (e) {
						console.log(e)
						uni.showToast({
							title: '验证码错误，请核对验证码',
							icon: 'none'
						})
					}





				}

			},
			goLogin() {
				uni.navigateTo({
					url: "/pages/login/Login"
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
			async getCode() {
				if (this.regsiterInfo.mobile && this.isAgree) {
					this.settime()
					const sms = uniCloud.importObject("sms")
					// 正常查找到就说，该用户名已经被注册
					const isRegister = await sms.getUserByMobile(this.regsiterInfo.mobile)
					console.log(isRegister)
					if (isRegister.code == 0) {
						uni.showToast({
							title: "该用户名已经被注册",
							icon: "none"
						})
						this.countdown = 0
					}
					if (isRegister.code == -100) {

						const res = await sms.sendSms(this.regsiterInfo.mobile, "register")
						console.log(res)

						if (res.code != 0) {
							uni.showToast({
								title: "验证码发送失败",
								icon: "none"
							})
							return 
						}
						uni.showToast({
							title: "验证码发送成功",
							icon: "none"
						})
					}


				} else {
					uni.showToast({
						title: "请输入手机号并且勾选协议",
						icon: "none"
					})
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.content {}

	.logo {
		height: 250rpx;
		// background-color: red;
		display: flex;
		justify-content: center;
		align-items: center;

		image {
			width: 30%;
		}
	}

	.welcome {
		color: white;
		font-size: 45rpx;
		margin: 20rpx 0;
	}

	.checkTip {
		color: white;
		font-size: 32rpx;
	}

	.uni-input {
		height: 90rpx;
		border: 1rpx solid #4954b3;
		margin-top: 50rpx;
		padding-left: 30rpx;
		font-size: 27rpx;
		color: white;
		border-radius: 40rpx;
	}

	.registerBtn {
		color: white;
		margin: 80rpx 0;
		// background-color: #3b496f;
		background-color: #dc991f;
		border-radius: 60rpx;
	}

	.tip {
		margin: 30rpx 0 30rpx;
		color: #C8C7CC;
		font-size: 25rpx;

		.login {
			color: white;
		}
	}

	.checkBox {
		margin: 30rpx 0;

		checkbox {
			zoom: 60%;
			vertical-align: middle;
			padding-right: 10rpx;
			background: black;
		}

		text {
			color: #C0C0C0;
			font-size: 27rpx;
		}

		.big {
			color: white;
			font-weight: bolder;
			font-size: 33rpx;
		}
	}

	.codeBox {
		position: relative;

	}

	button[disabled] {
		color: #2EA7E0;
		border: none;
		background-color: #45384d;
	}

	.getCode,
	.getInviteCode {
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
</style>
