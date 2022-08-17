<template>
	<view class="content">
		<view class="logo">
			<image src="@/static/basic/logo.png" mode="widthFix"></image>
		</view>
		<view class="welcome">
			重置登录密码
		</view>

		<form>
			<view class="uni-form-item uni-column">
				<input class="uni-input" name="input" v-model="resetPwd.mobile" placeholder="手机号" />
			</view>
			<view class="uni-form-item uni-column codeBox">
				<input class="uni-input " name="input" v-model="resetPwd.code" placeholder="验证码" />
				<button class="getCode" :disabled="isdisabledFn" @click="getCode">{{isSms}}</button>
			</view>

			<view class="uni-form-item uni-column">
				<input class="uni-input" name="input" type="password" v-model="resetPwd.password" placeholder="新密码" />
			</view>
			<view class="uni-btn-v">
				<button form-type="submit" class="loginBtn" @click="submitLogin">重置</button>
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
				resetPwd: {
					mobile: '',
					code:'',
					password: ''
				},
				countdown: 60,
				isSms: "获取验证码",
				isdisabledFn: false
			}
		},
		mounted() {
		},
		methods: {

			async submitLogin() {
				const data = this.resetPwd
				const that = this


				const login = uniCloud.importObject("login")
				const resetPwd = await login.resetPwdBySms(data)
				console.log(resetPwd)
				if (resetPwd.code == 0) {
					uni.showToast({
						title: '重置成功',
						icon: 'none',
					})
					setTimeout(function() {
						uni.navigateTo({
							url: "/pages/login/Login"
						})
					}, 1000)
				}
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
				if (this.resetPwd.mobile) {
					this.settime()
					const sms = uniCloud.importObject("sms")
					const res = await sms.sendSms(this.resetPwd.mobile, "reset-pwd")
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
			toLogin() {
				uni.navigateTo({
					url: "/pages/login/Login"
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
		margin-top: 30rpx;
		color: white;
		// background-color: #3b496f;
		background-color: #dc991f;
		border-radius: 60rpx;
	}


</style>
