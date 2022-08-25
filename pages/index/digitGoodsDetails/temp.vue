<template>
	<view>
		<nav-bar>
			<view slot="left" class="left">
				<uni-icons @click="goBack" type="back" size="30" color="white"></uni-icons>
				<text>确认订单</text>
			</view>
		</nav-bar>
		<!-- 	<view class="address">
			<uni-icons type="location-filled" color='#dc4d5a' size="37"></uni-icons>
			<view class="top">
				<text class="realName">{{getUserInfo.username}}</text>
				<text class="phone">13915138402</text>
			</view>
			<view class="bottom">
				<text>区块链地址：{{getUserInfo._id}}</text>
			</view>
		</view> -->
		<view class="goodsItem">
			<view class="top">
				<view class="goodsImg">
					<image :src="goodsItemDeatils.goods_thumb" mode="aspectFill"></image>
				</view>
				<view class="introduce">
					<view class="">
						{{goodsItemDeatils.name}}
					</view>
					<view class="">
						{{goodsItemDeatils.goods_desc}}
					</view>
				</view>
				<view class="priceAndCount">
					<view class="price">
						{{goodsItemDeatils.goods_price}}
					</view>
					<view class="count">
						x 1
					</view>
				</view>
			</view>
			<view class="bottom">
				<!-- 	<view class="service">
					服务 <text> 此商品性质不支持退款</text>
				</view>
				<view class="distribution">
					配送 <text> 能量时间链⚡️送达</text>
				</view> -->
				<view class="preferential">
					<!-- 	优惠 <text> 暂无优惠</text> --><text class="count">件数 <text class="sub" @click="sub">-</text><text
							class="currentCount">{{buyCount}}</text><text @click="add" class="add">+</text></text>
				</view>
			</view>
		</view>
		<!-- 		<view class="saleDetails">
			<view class="">
				<text>运费</text>
				<text>¥0.00</text>
			</view>
			<view class="">
				<text>立减</text>
				<text style="color:red">- ¥0.00</text>
			</view>
			<view class="">
				<text>发票</text>
				<text>电子(商品明细-个人)</text>
			</view>
		</view> -->
		<view class="paymentTitle">
			请选择支付方式 <text>(当前选择：{{paymentArr[currentPayIndex].name}})</text>
		</view>
		<view class="payment">
			<view class="ali" v-for="(item,index) in paymentArr" :key="index" @click="selectPayment(item,index)"
				:class="{currentPayment:index==currentPayIndex}">
				{{item.name}}
			</view>
		</view>
		<!-- 	<view class="viperBox">
			<text class="viper ">会员支付</text><text class="all">（优惠9.0折）</text>
			<text class="recharge">充值</text>
		</view> -->

		<vk-uni-pay ref="vkPay" :query-payment-action="vkPay.queryPaymentAction" :status.sync="vkPay.status"
			:code-url.sync="vkPay.codeUrl" :page-show="vkPay.pageShow" :polling="vkPay.polling"></vk-uni-pay>
		<view class="OrderBottom">
			<!-- <view class="goviper">
				首次开通会员，本单可以省¥10.00(¥30.00/月)
			</view> -->
			<view class="buy">
				<view class="left">
					<view class="">
						合计：<text>¥{{sumPrice}}</text>
					</view>
					<!-- 	<view class="">
						共计优惠¥0.00
					</view> -->
				</view>
				<!-- #ifdef H5 -->
				<view v-if="vkPay.status == 0" class="right" @click="startPayment">
					支付
				</view>
				<!-- #endif -->

				<!-- #ifndef H5 -->
				<view class="right" @click="createPayment">
					支付
				</view>
				<!-- #endif -->

				<!-- #ifdef H5 || APP-PLUS -->
				<view class="qrcodeBox">
					<view v-if="vkPay.status < 2 && vkPay.codeUrl" class="qrcode-view">
						<vk-uni-qrcode :text="vkPay.codeUrl" :size="450"></vk-uni-qrcode>
					</view>
				</view>
				<!-- #endif -->
				<!-- <button v-if="vkPay.status!=2" type="primary" @click="queryPayment">我已完成支付</button> -->
				<!-- 外部浏览器H5支付弹窗确认开始 -->
				<view class="pay-confirm-popup" v-if="vkPay.confirmShow">
					<view class="content">
						<view class="title">请确认支付是否已完成</view>
						<view><button type="primary" @click="queryPayment">已完成支付</button></view>
						<view style="margin-top: 20rpx;"><button type="default"
								@click="afreshPayment">支付遇到问题，重新支付</button></view>
						<view style="margin-top: 20rpx;text-align: center;" @click="vkPay.confirmShow = false">暂不支付
						</view>
					</view>
				</view>
				<!-- 外部浏览器H5支付弹窗确认结束 -->
			</view>
		</view>

	</view>
</template>

<script>
	var that; // 当前页面对象
	import NavBar from '@/components/NavBar.vue'
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	export default {
		components: {
			NavBar
		},
		data() {
			return {
				isMask: false,
				goodsItemDeatils: {},
				goodsItemDeatilsId: null,
				// 支付方式
				paymentArr: [{
						name: "支付宝",
						provider: 'alipay'
					},
					{
						name: "微信",
						provider: 'wxpay'
					}
				],
				currentPayIndex: 0,
				vkPay: {
					/**
					 * 查询支付状态的云函数配置
					 * 如果是非路由框架，则action为字符串，值为云函数名称
					 * 如果是路由框架，则按下方配置填写
					 */
					queryPaymentAction: {
						name: "vk-pay", // 云函数名称
						action: "pay/queryPayment", // 路由模式下云函数地址
						actionKey: "action", // 路由模式下云函数地址的识别key
						dataKey: "data" // 路由模式下云函数请求参数的识别key
					},
					// PC支付的付款二维码地址
					codeUrl: "",
					// 当前支付状态 0:等待发起支付 1:支付中 2:已支付
					status: 0,
					// 当前页面是否显示
					pageShow: true,
					// 启用轮询检测订单支付状态（仅h5支付有效）
					polling: true,
					// 微信手机外部浏览器H5支付时有效，必须是http或https开头的绝对路径，且在微信H5支付配置的域名白名单中。你还需要将此H5域名加入uniCloud白名单
					// 如果此值为空，则默认使用返回当前页面，返回的页面url参数会带上confirmShow=true&out_trade_no=实际订单号
					returnUrl: "",
					// 确认已支付的弹窗开关（微信手机外部浏览器H5支付时有效）
					confirmShow: true
				},
				// 表单请求数据
				payInfo: {
					provider: "alipay",
					total_fee: 10,
					out_trade_no: "",
					subject: "二次元",
					body: "二次元很多啊啊啊啊啊啊啊啊啊啊",
					type: "recharge"
				},
				buyCount: 1
			}
		},
		computed: {
			...mapGetters(['getUserInfo']),
			sumPrice() {
				return (this.buyCount * this.goodsItemDeatils.goods_price).toFixed(2)
			}
		},



		onLoad: function(options) {
			this.goodsItemDeatilsId = options.id
			console.log(options)
			that = this
			// 此处是因为微信H5外部浏览器支付后微信会重新打开指定页面，我们需要做一个弹窗让用户自己点下是否支付成功，同时云函数会去请求微信服务器检查是否真的付款成功。
			that.vkPay.confirmShow = options.confirmShow || false;
			if (options.out_trade_no) that.payInfo.out_trade_no = options.out_trade_no;
		},
		// 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
		onShow() {
			this.vkPay.pageShow = true;
		},
		// 监听 - 页面每次【隐藏时】执行(如：返回)
		onHide() {
			this.vkPay.pageShow = false;
		},
		mounted() {
			this.getGoodsItemDeatils(this.goodsItemDeatilsId)
		},
		methods: {
			...mapMutations(['setUserInfo']),
			// 通过id查询
			async getGoodsItemDeatils(id) {
				const goods = uniCloud.importObject('digital-goods')
				const {
					data
				} = await goods.getGoodsById(id);
				console.log(data)
				this.goodsItemDeatils = data
			},
			goBack() {
				uni.navigateBack({
					delta: 1
				});
			},
			selectPayment(item, index) {
				this.currentPayIndex = index
			},

			// 购买个数
			add() {
				if (this.buyCount >= 5) {
					uni.showToast({
						title: '一次最多购买5件呢',
						icon: 'none'
					})
				} else {
					this.buyCount++
				}
			},
			sub() {
				if (this.buyCount <= 1) {
					uni.showToast({
						title: '不能再减少了呢',
						icon: 'none'
					})
				} else {
					this.buyCount--
				}
			},

			// 点击支付的时候订单锁死，先token验证,是否进行了实名认证，库存是否充足
			// 这里库存是铁定够的，可以用展示的库存为实际库存的1/2
			// token有问题就再登录，实名认证有问题就再实名认证，手机号也要绑定。
			// 然后再返回支付
			startPayment() {
				// 先判断是否实名认证了
				if (this.getUserInfo.realname_auth) {
					// 设置payInfo
					this.payInfo.total_fee = 1
					this.payInfo.subject = this.goodsItemDeatils.name
					this.payInfo.body = this.getUserInfo._id
					// 发起支付 支付宝/微信之类的
					this.createPayment()
				} else {
					uni.redirectTo({
						url: "/pages/profile/UserInfo/Identification?id=" + this.getUserInfo._id
					})
				}

			},
			// 发起支付
			createPayment() {
				let {
					payInfo
				} = that;
				// 这里的订单号\金额等数据应该是从数据库里获取的,这里为演示需要,故直接本地生成.
				payInfo.out_trade_no = that.goodsItemDeatils.goods_level + "_" + new Date().getTime();
				// #ifdef MP-WEIXIN
				payInfo.provider = "wxpay";
				// #endif
				// #ifdef MP-ALIPAY
				payInfo.provider = "alipay";
				// #endif
				that.$refs.vkPay.createPayment({
					// 如果是非路由框架，则action为字符串，值为云函数名称
					// 如果是路由框架，则按下方配置填写
					action: {
						name: "vk-pay", // 云函数名称
						action: "pay/createPayment", // 路由模式下云函数地址
						actionKey: "action", // 路由模式下云函数地址的识别key(注意VK路由框架下,此值为$url)
						dataKey: "data" // 路由模式下云函数请求参数的识别key
					},
					// 请求数据
					data: {
						provider: payInfo.provider,
						total_fee: payInfo.total_fee,
						out_trade_no: payInfo.out_trade_no,
						subject: payInfo.subject,
						body: payInfo.body,
						type: payInfo.type,
					},
					// 成功回调
					success: res => {
						console.log(res)
						// 数据库业务逻辑
						this.saveGoodsForUser()
						uni.navigateTo({
							url: '/pages/index/DigitGoodsDetails/PaySuccess'
						})
					},
					// 失败回调
					fail: res => {
						if (res.failType === "create") {
							// 创建支付失败时提示
							that.alert(res.msg);
						} else if (res.failType === "request") {
							// 请求支付失败时提示
							that.toast("请求支付失败");
						} else if (res.failType === "result") {
							// 支付结果失败时提示
							that.toast("支付失败");
						}
					},
					// 取消回调
					cancel: res => {
						that.toast("用户取消支付");
					}
				});
			},
			async saveGoodsForUser() {
				const goods = uniCloud.importObject('digital-goods')
				// 查找目前库存
				const {
					res
				} = await goods.getGoodsCount(that.goodsItemDeatilsId)

				const currentGoodsIndex = that.goodsItemDeatils.all_count - res[0].remain_count + 1
				console.log(currentGoodsIndex)

				// 当前用户购买的序号索引
				const goods_array = []
				for (let i = 0; i < that.buyCount; i++) {
					goods_array[i] = {
						goods_number: currentGoodsIndex + i,
						status: 1
					}
				}


				// 用户得到商品同时库存减少
				const {
					errCode
				} = await goods.updateGoodsCount(that.goodsItemDeatilsId, that.buyCount);
				// 库存操作成功
				if (errCode == 0) {
					// 修改用户
					const user = uniCloud.importObject('user-service')
					const userRes = await user.addGoodsForUser(that.getUserInfo._id, that.goodsItemDeatils, that
						.buyCount)

					// 新增一个订单表 0未完成 1已完成
					const userOrder = uniCloud.importObject('order')
					const baseInfo = {
						goods_id: that.goodsItemDeatilsId,
						trade_id: that.payInfo.out_trade_no,
						goodsInfo: that.goodsItemDeatils,
						user_id: that.getUserInfo._id,
						status: 1
					}
					await userOrder.addFinshOrder(baseInfo, goods_array)

					// 新增用户商品信息
					const goodsItem = {
						"create_time": new Date().getTime(),
						"goods_id": that.goodsItemDeatilsId,
						"goods_name": that.goodsItemDeatils.name,
						"goods_image": that.goodsItemDeatils.goods_thumb,
						"goods_number": currentGoodsIndex,
						"goods_all_number": that.goodsItemDeatils.all_count
					}
					const userGoods = uniCloud.importObject("user-goods")
					for (let i = 0; i < that.buyCount; i++) {
						++goodsItem.goods_number
						await userGoods.addUserGoods(that.getUserInfo._id, goodsItem)
					}

					// vuex同步个人信息
					const {
						data
					} = await user.getUserById(that.getUserInfo._id)
					console.log(data)
					this.setUserInfo(data)
				} else {
					// 库存不足
					that.toast("库存不足", "error");
				}
			},
			// 支付状态查询
			queryPayment() {
				// 支付状态查询你可以直接查你的订单表，看订单是否已支付（因为最终判定用户是否支付成功应该以你的订单表为准）
				// 如果vkPay.queryPayment接口返回支付成功，但你的订单表查询到未支付，代表你的异步回调函数写的有问题。
				that.$refs.vkPay.queryPayment({
					title: "查询中...",
					data: {
						out_trade_no: uni.getStorageSync('out_trade_no')
					},
					success: data => {
						that.vkPay.status = 2; // 标记为已支付
						that.vkPay.confirmShow = false; // 关闭确认弹窗（微信H5支付有弹窗确认）
						that.toast(data.msg);
						// 数据库业务逻辑
						that.saveGoodsForUser()
						uni.navigateTo({
							url: '/pages/index/DigitGoodsDetails/PaySuccess'
						})
					}
				});
			},
			toast(title, icon = "none", mask = false) {
				uni.showToast({
					title,
					icon,
					mask,
					duration: 1500
				});
			},
			alert(content, title = "提示") {
				uni.showModal({
					title,
					content,
					showCancel: false
				});
			}
		}
	}
</script>

<style lang="less" scoped>
	.left {
		.uni-icons {
			vertical-align: middle;
		}

		text {
			color: white;
		}
	}

	.address {
		margin-top: 20rpx;
		color: white;
		padding: 40rpx 20rpx;
		background-color: #1d1e19;
		border-radius: 60rpx;
		overflow: hidden;

		.top {
			margin-bottom: 20rpx;

			.phone {
				margin-left: 10rpx;
				color: #C0C0C0;
				font-size: 27rpx;
			}
		}

		.bottom {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;


		}

		.uni-icons {
			float: left;
			line-height: 100rpx;
			margin-right: 20rpx;
		}
	}

	.goodsItem {
		background-color: #262c2b;
		border-radius: 60rpx;
		margin-top: 40rpx;
		padding: 20rpx;
		color: white;

		.top {
			display: flex;

			.goodsImg {
				height: 200rpx;
				width: 200rpx;
				border-radius: 40rpx;
				overflow: hidden;

				image {
					width: 100%;
					height: 100%;
				}
			}

			.introduce {
				flex: 1;
				padding-left: 20rpx;
				font-size: 25rpx;
				color: #C0C0C0;

				view:nth-child(1) {
					color: white;
					font-size: 35rpx;
				}
			}

			.priceAndCount {
				width: 120rpx;
				text-align: center;

				.price {
					color: red;
				}

				.count {
					color: #C0C0C0;
					font-size: 25rpx;

				}
			}

		}

		.bottom {
			margin-top: 40rpx;
			color: white;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: right;
			padding-left: 5%;

			text {
				color: #C0C0C0;
				font-size: 27rpx;
				margin-left: 20rpx;
			}

			.preferential {
				.count {
					color: white;
					font-size: 30rpx;
					display: inline-block;
					float: right;
					padding-right: 30rpx;

					.currentCount {
						padding: 0 10rpx;
					}

					.sub,
					.add {
						padding: 10rpx;
					}
				}
			}

		}

	}

	// 销售运费 优惠卷等
	.saleDetails {
		margin-top: 40rpx;
		padding: 20rpx;
		border-radius: 60rpx;
		color: white;
		background-color: #262c2b;

		view {
			overflow: hidden;
			margin: 20rpx 0;

			text:nth-child(1) {
				float: left;
			}

			text:nth-child(2) {
				float: right;
				color: #C7C7C7;
			}
		}
	}

	// 支付方式
	.paymentTitle {
		margin-top: 40rpx;
		color: white;
		font-size: 40rpx;
		text-align: center;

		text {
			font-size: 27rpx;
		}
	}

	.payment {
		display: flex;
		color: white;
		font-size: 40rpx;
		margin-top: 30rpx;
		text-align: center;

		view:nth-child(1) {
			flex: 1;
			margin-right: 60rpx;
			background-color: #0099CC;
			border-radius: 40rpx;
		}

		view:nth-child(2) {
			flex: 1;
			margin-left: 60rpx;
			background-color: #18BC37;
			border-radius: 40rpx;
		}
	}

	.currentPayment {
		border: 2rpx dashed white;
	}

	.qrcodeBox {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 100;

		.qrcode-view {
			text-align: center;
			border: 2rpx solid #e11829;

			.qrcode-img {
				width: 400rpx;
			}
		}
	}


	.viperBox {
		min-height: 280rpx;
		margin-top: 40rpx;
		color: white;
		font-size: 40rpx;
		overflow: hidden;

		.viper {
			display: inline-block;
			background-color: #d8532b;
			border-radius: 40rpx;
			padding: 8rpx 25rpx;
		}

		.all {
			font-size: 30rpx;
		}

		.recharge {
			margin-left: 20rpx;
			font-size: 30rpx;
			color: #18BC37;
		}

	}

	.OrderBottom {
		position: fixed;
		bottom: 0;
		left: 0%;
		right: 0%;
		padding: 20rpx 0;
		height: 100rpx;
		color: white;
		background-color: #002a22;

		// .goviper {
		// 	height: 50rpx;
		// 	background-color: #fe3b39;
		// 	text-align: center;
		// 	font-size: 29rpx;
		// }

		.buy {
			height: 100rpx;
			padding: 0 5%;
			padding-top: 20rpx;

			.left {
				float: left;
				font-size: 37rpx;
				line-height: 50rpx;

				text {
					font-size: 45rpx;
					color: #53591a;
				}

				view:nth-child(2) {
					font-size: 22rpx;
					color: #c34a3a;
				}
			}

			.right {
				float: right;
				width: 180rpx;
				height: 70rpx;
				border-radius: 40rpx;
				line-height: 70rpx;
				text-align: center;
				color: #ccc;
				background-color: #2C405A;
			}
		}
	}
</style>
