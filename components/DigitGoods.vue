<template>
	<view class="goodsItem">
		<view class="goodsStatus">
			{{goodsStatus}}
		</view>
		<image class="goodImg" :src="goodsItem.goods_img" mode="widthFix"></image>
		<view class="content">
			<view class="title">
				{{goodsItem.goods_name}}
				<text class="remain_count">库存：{{goodsItem.goods_count}}</text>
			</view>
			<view class="tag">
				<text class="quality">限量:</text>
				<text class="count">{{goodsItem.goods_count}}份</text>
				<text class="classes">{{goodsItem.goods_desc}}</text>
			</view>
			<view class="price">
				<text class="left">
					<image :src="goodsItem.framer_img" mode="aspectFill"></image>{{goodsItem.framer}}
				</text>
				<text class="right">¥ {{goodsItem.goods_price.toFixed(2)}}</text>
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		name: "DigitGoods",
		props: {
			goodsItem: {
				type: Object,
				default () {
					return {
						name: ''
					}
				}
			}
		},
		computed: {
			goodsStatus() {
				switch (this.goodsItem.sale_status) {
					case 1:
						return '⌚️预销售'
					case 2:
						return '🔥热销中'
					case 3:
						return '⌚️已售罄'
				}
			}
		},
		data() {
			return {

			};
		},
		onLoad() {
			console.log(2)

		},
		mounted() {}
	}
</script>

<style lang="less" scoped>
	.goodsItem {
		width: 100%;
		border-radius: 60rpx;
		background-color: #212121;
		position: relative;
		margin-bottom: 30rpx;

		image {
			width: 100%;
			height: 700rpx;
			border-radius: 60rpx;
		}

		// 目前销售状态
		.goodsStatus {
			position: absolute;
			left: 5%;
			top: 5%;
			text-align: center;
			font-size: 27rpx;
			line-height: 60rpx;
			color: #C0C0C0;
			width: 160rpx;
			height: 60rpx;
			background-color: black;
			z-index: 9;
			border-radius: 30rpx;
		}

		.content {
			padding: 20rpx;
			view{
				margin: 20rpx 0;
			}
			.title {
				color: white;
				margin-bottom: 10rpx;
				text{
					float: right;
					font-size: 25rpx;
					color: #feac59;
					line-height: 50rpx;
				}
				.remain_count{
					margin: 0 20rpx;
					// color: white;
				}
			}

			.tag {
				font-size: 27rpx;
				color: #988f78;
				margin-bottom: 15rpx;

				text {
					padding: 8rpx 12rpx;
					background-color: #feac59;
				}

				.quality {
					color: black;
				}

				.count {
					background-color: #3a3a3b;
				}

				.classes {
					margin-left: 20rpx;
					background-color: #3a3a3b;
					line-height: 60rpx;
				}
			}

			.price {
				overflow: hidden;

				.left {
					float: left;
					color: #818484;
					font-size: 25rpx;
					image {
						vertical-align: middle;
						margin-right: 15rpx;
						width: 50rpx;
						height: 50rpx;
						display: inline-block;
					}
				}

				.right {
					float: right;
					color: white;
					font-weight: 800;
					font-size: 40rpx;
				}
			}

		}
	}
</style>
