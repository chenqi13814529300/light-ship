<template>
	<view>
		<nav-bar>
			<view slot="left" class="left">
				<uni-icons @click="goBack" type="back" size="30" color="white"></uni-icons>
				<text>确认订单</text>
			</view>
		</nav-bar>
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
				<view class="preferential">
					<!-- 	优惠 <text> 暂无优惠</text> --><text class="count">件数 <text class="sub" @click="sub">-</text><text
							class="currentCount">{{buyCount}}</text><text @click="add" class="add">+</text></text>
				</view>
			</view>
		</view>

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
				<view v-if="vkPay.status == 0" class="right" @click="$noMultipleClicks(startPaymentUniPay)">
					支付
				</view>
				<!-- #endif -->

				<!-- #ifndef H5 -->
				<view class="right" @click="startPaymentUniPay">
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
			</view>
		</view>
		<uni-popup ref="popup" type="dialog">
			<uni-popup-dialog :disabled="isDisabled" mode="input" message="成功消息" :duration="2000" :before-close="true"
				@close="close" @confirm="confirm" cancelText="返回" confirmText="取消未支付订单">
				您有未支付的订单
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	var that; // 当前页面对象
	import NavBar from '@/components/NavBar.vue'
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	// t1 抽签开始日期 t2 结束时间   t3 优先开始时间  t4 中签购买时间
	// const t3 = "2022/4/27 12:00:00"
	// const t4 = "2022/4/27 18:00:00"
	var setTime
	export default {
		components: {
			NavBar
		},
		data() {
			return {
				currentOutTradeNo: null,
				isDisabled: false,
				// 防抖挂载
				noClick: true,
				isMask: false,
				goodsItemDeatils: {},
				goodsItemDeatilsId: null,
				// 支付方式
				paymentArr: [
					
					// {
					// 	name: "支付宝",
					// 	provider: 'alipay'
					// },
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
				buyCount: 1,
				// 优先，中奖，普通1，2，3
				currentAuthorityType: null
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
			// console.log(options)
			that = this

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
			open() {
				this.$refs.popup.open()

			},
			/**
			 * 点击取消按钮触发
			 * @param {Object} done
			 */
			close() {
				this.$refs.popup.close()
			},
			/**
			 * 点击确认按钮触发
			 * @param {Object} done
			 * @param {Object} value
			 */
			async confirm(value) {
				this.isDisabled = true
				this.$refs.popup.close()
				// 清除所有未支付的订单
				const order = uniCloud.importObject("order")
				await order.delNoPayOrder(this.getUserInfo._id)
				uni.redirectTo({
					url: "/pages/index/DigitGoodsDetails/BuyGoods?id=" + this.goodsItemDeatilsId
				})
			},
			// 通过id查询
			async getGoodsItemDeatils(id) {
				const goods = uniCloud.importObject('digital-goods')
				const {
					data
				} = await goods.getGoodsById(id);
				// console.log(data)
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
				if (this.buyCount >= this.goodsItemDeatils.limit_count) {
					uni.showToast({
						title: '一次最多购买' + this.goodsItemDeatils.limit_count + '件呢',
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
			// 支付前，查看是否有其他订单未支付	
			async beforePaymentFindOrder() {
				// 查询最新的一个订单是否支付的，如果支付了继续，如果没有支付，提示去支付，或者取消订单
				// this.queryPayment()
				const order = uniCloud.importObject("order")
				let res = await order.getOrderById(this.getUserInfo._id)
				if (res.code == 0) {
					this.beforePayment()
				}
				if (res.code == -100) {
					this.open()
				}
			},

			// 购买前 角色权限 预判断
			async beforePayment() {
				// 再次获得商品信息
				await this.getGoodsItemDeatils(this.goodsItemDeatilsId)
				console.log(this.goodsItemDeatils)
				// 展示的库存
				if (this.goodsItemDeatils.sale_show_count <= 0) {
					uni.showToast({
						title: "已售罄",
						icon: "none",
						duration: 1500
					})
				}


				// 展示的库存>0
				if (this.goodsItemDeatils.sale_show_count > 0) {


					if (this.currentAuthorityType !== 2 && this.currentAuthorityType !== 1) {
						this.startPayment()
					} else {
						uni.showToast({
							title: "优先购和中签者不参与抢购",
							icon: "none"
						})
					}





					// let currentTime = new Date().getTime();


					// 优选购，时间判断
					// const timeType1 = new Date(t3).getTime();
					// const timeType1Span = this.$moment(timeType1).diff(this.$moment(currentTime), "minutes")

					// // 优选购的时间没有到
					// if (timeType1Span > 0) {
					// 	uni.showToast({
					// 		title: "距离优先购用户开始购买时间还剩余" + timeType1Span + "分钟",
					// 		icon: "none",
					// 		duration: 1500
					// 	})
					// }

					// if (timeType1Span < -240) {
					// 	uni.showToast({
					// 		title: "优先购时间已结束",
					// 		icon: "none",
					// 		duration: 1500
					// 	})
					// }
					// 优选购的时间到了
					// if (-240 <= timeType1Span && timeType1Span <= 0) {
					// const msg = uniCloud.importObject("message")
					// // 这边得到三种可能，第一种可能分两种，type=1 type=2 第二种是找不到这个人
					// const authorityType = await msg.isHaveQualification(this.getUserInfo._id)
					// console.log(authorityType)

					// // 人是否在系统优先+中奖名单表
					// if (authorityType.code == 0) {
					// 	// 人在系统名单

					// 	// type=1，即优先购者
					// 	if (authorityType.data.authority_type == 1) {
					// 		this.currentAuthorityType = 1
					// 		// 继续判断当前优先购买的次数是否够
					// 		let limit = uniCloud.importObject("digital-goods")

					// 		let limitAuthorityType1 = await limit.qualificationLimit(this.getUserInfo._id, this
					// 			.buyCount)
					// 		console.log(limitAuthorityType1)

					// 		// 优先购次数检验通过
					// 		if (limitAuthorityType1.code == 0) {
					// 			this.startPayment()
					// 		} else {
					// 			uni.showToast({
					// 				title: "目前您优先购剩余购买次数为" + authorityType.data.use_buy_count + "件",
					// 				icon: "none",
					// 				duration: 1500
					// 			})
					// 		}
					// 	}



					// 	// type=2,即抽奖中者
					// 	if (authorityType.data.authority_type == 2) {
					// 		this.currentAuthorityType = 2

					// 		// 中奖者购买时间
					// 		const timeType2 = new Date(t4).getTime();
					// 		const timeType2Span = this.$moment(timeType2).diff(this.$moment(currentTime),
					// 			"minutes")
					// 		// 到了中奖者购买时间
					// 		if (-180 <= timeType2Span && timeType2Span <= 0) {

					// 			// 继续判断当前优先购买的次数是否够
					// 			let limit = uniCloud.importObject("digital-goods")
					// 			let limitAuthorityType2 = await limit.qualificationLimit(this.getUserInfo._id,
					// 				this.buyCount)

					// 			// 优先购次数检验通过
					// 			if (limitAuthorityType2.code == 0) {
					// 				this.startPayment()
					// 			} else {
					// 				uni.showToast({
					// 					title: "目前您中签剩余购买次数为" + authorityType.data.use_buy_count + "件",
					// 					icon: "none",
					// 					duration: 1500
					// 				})
					// 			}

					// 		}

					// 		if (timeType2Span < -180) {
					// 			uni.showToast({
					// 				title: "中签者购买时间已经结束",
					// 				icon: "none",
					// 				duration: 1500
					// 			})
					// 		}

					// 		// 没有到中奖者购买时间
					// 		if (timeType2Span > 0) {
					// 			uni.showToast({
					// 				title: "距离中签者开始购买时间还剩余" + timeType2Span + "分钟",
					// 				icon: "none",
					// 				duration: 1000
					// 			})
					// 		}


					// 	}



					// } else {
					// 	// 人不在系统名单
					// 	this.currentAuthorityType = 3
					// 	uni.showToast({
					// 		title: "您不是优先购用户或者中签者用户，请关注此次剩余商品的抢购环节",
					// 		icon: "none",
					// 		duration: 2000
					// 	})
					// }

					// }




				}




			},
			async startPaymentUniPay() {
				console.log(11)
				// 1.新增一个订单表 0未完成 1已完成
				const userOrder = uniCloud.importObject('order')
				const orderInfo = {
					user_id: that.getUserInfo._id,
					count: that.buyCount,
					goods_id: that.goodsItemDeatilsId,
					goods_image: that.goodsItemDeatils.goods_thumb,
					authority_type: that.currentAuthorityType
				}

				const addOrderRes = await userOrder.addOrder(orderInfo)
				console.log(addOrderRes)
				// 2.订单表是否创建成功
				if (addOrderRes.code == 0) {
					const orderRecode = {
						subject: addOrderRes.order.subject,
						totalFee: addOrderRes.order.total * 100,
						outTradeNo:addOrderRes.order.out_trade_no
					}

					const admin = uniCloud.importObject("pay")
					const res = await admin.createPayment(orderRecode)
					console.log(res)

					window.location.href = res.orderInfo.mwebUrl
					this.currentOutTradeNo = res.outTradeNo
					
					setTime=setInterval(() => {
						this.queryOrderStatus()
					}, 4000)
				


				} else {
					// 2.2订单表创建失败
					uni.showToast({
						title: "订单创建失败",
						icon: "none"
					})
				}

			},
			async queryOrderStatus() {
				const admin = uniCloud.importObject("pay")
				const res = await admin.queryOrderStatus(this.currentOutTradeNo)
				console.log(res)
				if(res.tradeState=="SUCCESS"){
					clearInterval(setTime)
					const pay = uniCloud.importObject("pay")
					const res = await pay.addGoods(this.currentOutTradeNo)
					
					// vuex同步个人信息
					const user = uniCloud.importObject("user-service")
					const {
						data
					} = await user.getUserById(this.getUserInfo._id)
					console.log(data)
					this.setUserInfo(data)
					console.log("paySuccess", res);
					uni.redirectTo({
						url: "/pages/index/DigitGoodsDetails/PaySuccess"
					})
				}
			},

			// 点击支付的时候订单锁死，先token验证,是否进行了实名认证，库存是否充足
			// 这里库存是铁定够的，可以用展示的库存为实际库存的1/2
			// token有问题就再登录，实名认证有问题就再实名认证，手机号也要绑定。
			// 然后再返回支付
			async startPayment() {


				// 先判断是否实名认证了
				if (this.getUserInfo.realname_auth) {

					// 0.限制购买（库存+限购个数）
					let limit = uniCloud.importObject("digital-goods")
					console.log(this.buyCount)
					let limitInfo = await limit.buyLimit(this.goodsItemDeatilsId, this.getUserInfo._id, this.buyCount)

					console.log(limitInfo)

					if (limitInfo.code == 0) {

						// 1.新增一个订单表 0未完成 1已完成
						const userOrder = uniCloud.importObject('order')
						const orderInfo = {
							user_id: that.getUserInfo._id,
							count: that.buyCount,
							goods_id: that.goodsItemDeatilsId,
							goods_image: that.goodsItemDeatils.goods_thumb,
							authority_type: that.currentAuthorityType
						}

						const addOrderRes = await userOrder.addOrder(orderInfo)
						console.log(addOrderRes)
						// 2.订单表是否创建成功
						if (addOrderRes.code == 0) {
							// 2.1 订单表创建成功，开始支付
							this.$refs.vkPay.createPayment({
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
									provider: "alipay",
									total_fee: addOrderRes.order.total * 100,
									out_trade_no: addOrderRes.order.out_trade_no,
									subject: addOrderRes.order.subject,
									type: "goods"
								},
								// 成功回调
								success: async res => {
									// vuex同步个人信息
									const user = uniCloud.importObject("user-service")
									const {
										data
									} = await user.getUserById(that.getUserInfo._id)
									console.log(data)
									this.setUserInfo(data)
									this.toast("支付成功", "success");
									console.log("paySuccess", res);
									uni.redirectTo({
										url: "/pages/index/DigitGoodsDetails/PaySuccess"
									})
								},
								// 失败回调
								fail: res => {
									console.log("超时，此订单关闭")
									if (res.failType === "create") {
										// 创建支付失败时提示
										this.alert(res.msg);
									} else if (res.failType === "request") {
										// 请求支付失败时提示
										this.toast("请求支付失败");
									} else if (res.failType === "result") {
										// 支付结果失败时提示
										this.toast("支付失败");
									}


								},
								// 取消回调
								cancel: res => {
									this.toast("用户取消支付");
								}
							});

						} else {
							// 2.2订单表创建失败
							uni.showToast({
								title: "订单创建失败",
								icon: "none"
							})
						}



					} else {
						uni.showToast({
							title: "库存为空或者购买量太多",
							icon: "none"
						})
					}





				} else {
					uni.redirectTo({
						url: "/pages/profile/UserInfo/Identification?id=" + this.getUserInfo._id
					})
				}

			},

			// 支付状态查询
			queryPayment() {

				console.log(uni.getStorageSync('out_trade_no'))
				// 支付状态查询你可以直接查你的订单表，看订单是否已支付（因为最终判定用户是否支付成功应该以你的订单表为准）
				// 如果vkPay.queryPayment接口返回支付成功，但你的订单表查询到未支付，代表你的异步回调函数写的有问题。
				that.$refs.vkPay.queryPayment({
					title: "查询中...",
					data: {
						out_trade_no: uni.getStorageSync('out_trade_no')
					},
					success: data => {
						console.log("成功")
						console.log(data)
						// that.vkPay.status = 2; // 标记为已支付

						// that.toast(data.msg);
						// // 数据库业务逻辑
						// that.saveGoodsForUser()
						// uni.navigateTo({
						// 	url: '/pages/index/DigitGoodsDetails/PaySuccess'
						// })
					},
					error: data => {
						console.log("失败")
						console.log(data)
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
					// color: #53591a;
					color: white;
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
