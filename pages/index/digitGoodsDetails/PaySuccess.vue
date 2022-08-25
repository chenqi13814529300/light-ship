<template>
	<view class="">
		<view class="paySuccess">
			购买成功
		</view>
		<button @click="goIndex">再逛逛</button>
		<button @click="goProfile">我的藏品</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				statusName: ''
			}
		},
		onLoad(option) {
			// this.statusName = option.type
		},
		methods: {
			goIndex() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			goProfile() {

				uni.reLaunch({
					url: '/pages/profile/profile'
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	.paySuccess {
		color: white;
		text-align: center;
		font-size: 40rpx;
		margin: 50rpx 0;
	}

	button {
		margin: 20rpx 0;
		background-color: #877ab7;
	}
</style>
