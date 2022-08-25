<template>
	<view class="choice">
		<image src="../static/goods/good3.jpg" mode="aspectFill"></image>
		<view class="title">
			二次元系列
		</view>
	</view>
</template>

<script>
	export default {
		name:"Choiceness",
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="less" scoped>
	.choice{
		background-color: #202221;
		height: 400rpx;
		overflow: hidden;
		border-radius: 60rpx;
		margin: 40rpx 0;
		image{
			border-radius:inherit;
			width: 100%;
			height: 320rpx;
		}
		.title{
			padding-left: 50rpx;
			color: white;
			font-size: 40rpx;
		}
	}
</style>
