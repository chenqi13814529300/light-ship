<template>
	<view class="sellByDay">
		<view class="date">
			03-16
		</view>
		<view class="sellItem" v-for="item in 5">
			<view class="time">
				15:23:10
			</view>
			<view class="content">
				<view class="left">
					<image src="../static/goods/good1.jpg" mode=""></image>
				</view>
				<view class="right">
					<view class="">
						NFT -- 二次元 吹泡泡
					</view>
					<view class="center">
						<text class="quality">限量:</text>
						<text class="count">2份</text>
					</view>
					<view class="">
						¥ 1.00
					</view>
				</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style lang="less" scoped>
.sellByDay{
	color: white;
	.date{
		font-size: 45rpx;
		padding:20rpx 10rpx 10rpx;
	}
	.sellItem{
		margin-bottom: 40rpx;
		.time{
			font-size: 40rpx;
			padding:10rpx 10rpx 10rpx;
		}
		.content{
			border-radius: 60rpx;
			height: 270rpx;
			background-color: #202221 ;
			display: flex;
			.left{
				flex: 2;
				image{
					border-radius: 60rpx;
					width: 100%;
					height: 100%;
				}
			}
			.right{
				flex: 3;
				color: white;
				font-size: 35rpx;
				display: flex;
				flex-direction: column;
				justify-content: center;
				margin-left: 20rpx;
				view{
					padding: 10rpx 0;
				}
				.center{
					text{
						padding: 8rpx 12rpx;
						background-color: #feac59;
						font-size: 27rpx;
					}
					.quality{
						color: black;
					}
					.count{
						background-color: #3a3a3b;
					}
				}
				
			}
		}
	}
	
}
</style>
