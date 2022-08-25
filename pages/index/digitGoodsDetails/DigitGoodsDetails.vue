<template>
	<view>
		<nav-bar>
			<view slot="left" class="left">
				<uni-icons @click="goBack" type="back" size="30" color="white"></uni-icons>
			</view>
		</nav-bar>
		<view class="showGoodItem">
			<view class="center" id="center">

			</view>
			<view class="bottom">
			</view>
		</view>
		<view class="introduce">
			<text>{{goodsItemDeatils.name}}</text>
		</view>
		<view class="tag">
			<text class="quality">限量:</text>
			<text class="count">{{goodsItemDeatils.sale_show_count}}份</text>
		</view>


		<!-- 认证 -->
		<view class="authentication">
			<view class="" v-for="(item,index) in authenticationInfo" :key="index">
				<text>{{item.title}}</text>
				<!-- <text class="copy" v-if="index<2" @click="copy(item.content)">复制</text> -->
				<text class="content">{{item.content}}</text>
			</view>
		</view>
		<!-- 创作者 -->
		<view class="author">
			<view class="top">
				<view class="headerImg">
					<image :src="goodsItemDeatils.framer_img" mode="aspectFill"></image>
				</view>
				<view class="">
					创作者
				</view>
				<view class="">
					{{goodsItemDeatils.framer}}
				</view>
			</view>
			<view class="center">
				{{goodsItemDeatils.goods_desc}}
			</view>
			<view class="bottom">
				<text class="left">发行方</text>
				<text class="right">{{goodsItemDeatils.publisher}}</text>
			</view>
		</view>

		<view class="more" v-if="goodsItemDeatils.goods_bg">
			<!-- <text class="tip">
				购买后即可体验内容
			</text> -->
			<image :src="goodsItemDeatils.goods_bg" mode="widthFix"></image>

		</view>
		<view class="provision">
			<view class="title">
				购买须知
			</view>
			<view class="">
				尊敬的Time 数藏在线平台用户，请您购买付费阅读服务前务必谨慎阅读以下条款：
			</view>
			<view class="">
				购买数字藏品之前，应知晓数字藏品是可用于虚拟社交场景应用、互联网区块链文化产业应用，收藏炫耀，转赠亲朋好友的虚拟物品，而非实物。数字藏品的版权由发行方或原创者拥有，除另行取得版权拥有者书面同意外，不得将数字藏品用于任何商业用途。本商品一经出售，不支持退还。本商品源文件不支持本地下载。请勿对数字藏品进行各种形式的炒作，场外交易、欺诈、或其他任何非法方式的使用。
			</view>

		</view>
		<view class="footer">
			提供技术支持
		</view>
		<view class="buy">
			<view class="left">
				单价：¥{{goodsItemDeatils.goods_price}}
			</view>

			<view class="right" @click="$noMultipleClicks(goBuy)">
				购买
			</view>

			<!-- <view class="right" @click="$noMultipleClicks(goBuy)"
				v-if="(currentAuthorityType==1)||(currentAuthorityType==2)">
				购买
			</view> -->
			<!-- 	<view class=" right" @click="$noMultipleClicks(beforeDrawLots)" v-if="currentAuthorityType==3">
				抽签
			</view>
			<view class="right" @click="$noMultipleClicks(afterDrawLots)" v-if="currentAuthorityType==4">
				已抽签
			</view> -->

		</view>
	</view>
</template>




<script>
	import NavBar from '@/components/NavBar.vue'
	import * as THREE from "@/static/js/three.js"
	import "@/static/js/OrbitControls"
	import {
		mapGetters
	} from 'vuex'
	// t1 抽签开始日期 t2 结束时间   t3 优先开始时间  t4 中签购买时间
	// const t1 = "2022/4/26 12:00:00"
	// const t2 = "2022/4/27 12:00:00"
	// const t3 = "2022/4/27 12:00:00"
	// const t4 = "2022/4/27 18:00:00"

	export default {
		components: {
			NavBar
		},
		onLoad: function(option) {
			console.log(option.id)
			this.goodsItemDeatilsId = option.id
		},
		data() {
			return {
				// 防抖挂载
				noClick: true,
				abc: null,
				cube: undefined,
				scene: undefined,
				camera: undefined,
				renderer: undefined,
				floorTexture: undefined,
				windowWidth: undefined,
				windowHeight: undefined,
				// 认证信息
				authenticationInfo: [{
						title: '合约地址',
						content: ''
					},
					{
						title: '交易哈希',
						content: ''
					},
					{
						title: '认证标准',
						content: ''
					},
					// {
					// 	title: '认证网络',
					// 	content: ''
					// }
				],
				goodsItemDeatils: {},
				goodsItemDeatilsId: null,
				// 优先，中奖，未抽签 已抽签，1 2 3 4
				currentAuthorityType: null
			}
		},
		computed: {
			...mapGetters(['getUserInfo'])
		},
		filters: {
			hashFiter(value) {
				if (value) {
					return value.slice(0, 4) + '...' + value.slice(value.length - 4)
				}
			},

		},
		async mounted() {
			let that = this
			uni.getSystemInfo({
				success: function(res) {
					that.windowWidth = res.windowWidth
					that.windowHeight = res.windowHeight
				}
			});
			// 等下面这个执行完了才可以配置data
			await this.getGoodsItemDeatils(this.goodsItemDeatilsId)
			this.initGoodItem()
			this.animate()
		},
		methods: {
			// 获得当前用户的特权信息
			async haveAuthorityType() {
				const msg = uniCloud.importObject("message")
				// 这边得到三种可能，第一种可能分两种，type=1 type=2 第二种是找不到这个人
				const authorityType = await msg.isHaveQualification(this.getUserInfo._id)
				console.log(authorityType)
				if (authorityType.code == 0) {
					// 优先购用户
					if (authorityType.data.authority_type == 1) {
						this.currentAuthorityType = 1
					}

					// 抽奖中的人
					if (authorityType.data.authority_type == 2) {
						this.currentAuthorityType = 2
					}

				} else {
					// 查找自己是否在抽签表之中
					const isDraw = await msg.isDrawLots(this.getUserInfo._id)
					// 未抽签
					if (isDraw.code == -100) {
						this.currentAuthorityType = 3
					}

					// 已抽签
					if (isDraw.code == 0) {
						this.currentAuthorityType = 4
					}

				}

				console.log(this.currentAuthorityType)

			},




			initGoodItem() {
				console.log(this.goodsItemDeatils)
				//建立了场景
				this.scene = new THREE.Scene();
				this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 2000);

				// // 渲染器
				this.renderer = new THREE.WebGLRenderer({
					antialias: true //是否执行抗锯齿
				});
				this.renderer.setPixelRatio(window.devicePixelRatio);
				this.renderer.setSize(0.9 * this.windowWidth, 300);

				// 添加到页面中
				document.getElementById('center').appendChild(this.renderer.domElement)

				// BoxGeometry（立方体）对象
				var geometry = new THREE.BoxBufferGeometry(10, 12, 0.3);


				// 换成自己的图片路径
				var loader = new THREE.TextureLoader();
				let one = loader.load('../../static/basic/desk.png');
				let two = loader.load('../../static/basic/desk.png');
				let three = loader.load('../../static//basicdesk.png');
				let four = loader.load('../../static/basic/desk.png');
				let five = loader.load(`../../static/goods/${this.goodsItemDeatils.goods_img}.png`);
				let six = loader.load('@/static/basic/desk.png');


				const material1 = new THREE.MeshBasicMaterial({
					color: 'rgb(248,248,255)'
				});
				const material2 = new THREE.MeshBasicMaterial({
					color: 'rgb(248,248,255)'
				});
				const material3 = new THREE.MeshBasicMaterial({
					color: 'rgb(248,248,255)'
				});
				const material4 = new THREE.MeshBasicMaterial({
					color: 'rgb(248,248,255)'
				});
				const material5 = new THREE.MeshBasicMaterial({
					map: five
				});
				const material6 = new THREE.MeshBasicMaterial({
					map: six
				});

				const materials = [material1, material2, material3, material4, material5, material6]

				// var materials = new THREE.MeshBasicMaterial()
				this.cube = new THREE.Mesh(geometry, materials);
				this.scene.add(this.cube);

				//为了防止这种情况的发生，我们只需要将摄像机稍微向外移动一些即可。
				this.camera.position.z = 15;

				// light
				var light = new THREE.PointLight("#F8F8FF");
				light.position.set(10, 0, 100);
				this.scene.add(light);


				var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
				controls.update();

			},

			// 更新
			animate() {
				requestAnimationFrame(this.animate)
				this.cube.rotation.y += 0.01
				this.renderer.render(this.scene, this.camera)

			},

			// 具有购买资格
			async goBuy() {
				// 再次获得商品信息
				await this.getGoodsItemDeatils(this.goodsItemDeatilsId)
				console.log(this.goodsItemDeatils)
				if (this.goodsItemDeatils.sale_show_count <= 0) {
					uni.showToast({
						title: "已售罄",
						icon: "none",
						duration: 1500
					})
				}

				if (this.goodsItemDeatils.sale_show_count > 0) {
						uni.navigateTo({
							url: "/pages/index/DigitGoodsDetails/BuyGoods?id=" + this
								.goodsItemDeatilsId,
						})
					// if (this.currentAuthorityType !== 2 && this.currentAuthorityType !== 1) {
					// 	uni.navigateTo({
					// 		url: "/pages/index/DigitGoodsDetails/BuyGoods?id=" + this
					// 			.goodsItemDeatilsId,
					// 	})
					// } else {
					// 	uni.showToast({
					// 		title: "优先购和中签者不参与抢购",
					// 		icon: "none"
					// 	})
					// }
				}



				// 这里即将开卖的藏品逻辑
				// if (this.goodsItemDeatils.sale_show_count > 0) {
				// let currentTime = new Date().getTime();
				// 	// 优选购，时间判断
				// 	const timeType1 = new Date(t3).getTime();
				// 	const timeType1Span = this.$moment(timeType1).diff(this.$moment(currentTime), "minutes")

				// 	// 时间1没到
				// 	if (timeType1Span > 0) {
				// 		uni.showToast({
				// 			title: "距离优先购用户开始购买时间还剩余" + timeType1Span + "分钟",
				// 			icon: "none",
				// 			duration: 1500
				// 		})
				// 	}
				// 	if (timeType1Span < -240) {
				// 		uni.showToast({
				// 			title: "优先购时间已结束",
				// 			icon: "none",
				// 			duration: 1500
				// 		})
				// 	}

				// 	console.log(timeType1Span)
				// 	// 到优先购的时间
				// 	if (-240 <= timeType1Span && timeType1Span <= 0) {
				// 		if (this.currentAuthorityType == 1) {
				// 			console.log(11111)
				// 			uni.navigateTo({
				// 				url: "/pages/index/DigitGoodsDetails/BuyGoods?id=" + this
				// 					.goodsItemDeatilsId,
				// 			})
				// 		}
				// console.log(this.currentAuthorityType)
				// 		if (this.currentAuthorityType == 2) {
				// 			// 中奖者购买时间
				// 			const timeType2 = new Date(t4).getTime();
				// 			const timeType2Span = this.$moment(timeType2).diff(this.$moment(currentTime), "minutes")
				// 			// 没有到中奖者购买时间
				// 			if (timeType2Span > 0) {
				// 				uni.showToast({
				// 					title: "距离中签者开始购买时间还剩余" + timeType2Span + "分钟",
				// 					icon: "none",
				// 					duration: 1500
				// 				})
				// 			}
				// 			console.log(timeType2Span)
				// 			// 到了中奖者购买时间
				// 			if (-180 <= timeType2Span && timeType2Span <= 0) {
				// 				uni.navigateTo({
				// 					url: "/pages/index/DigitGoodsDetails/BuyGoods?id=" + this
				// 						.goodsItemDeatilsId,
				// 				})
				// 			}

				// 			// 购买时间截止
				// 			if (timeType2Span < -180) {
				// 				uni.showToast({
				// 					title: "中签者购买时间已经结束",
				// 					icon: "none",
				// 					duration: 1500
				// 				})
				// 			}


				// 	// 	}
				// 	// }


				// }
			},

			// 去抽签
			async beforeDrawLots() {
				let currentTime = new Date().getTime();
				// 抽签开始日期时间判断
				const drawStart = new Date(t1).getTime();
				const drawStartSpan = this.$moment(drawStart).diff(this.$moment(currentTime), "minutes")

				// 抽签未开始
				if (drawStartSpan > 0) {
					uni.showToast({
						title: "抽签还未开始",
						icon: "none",
						duration: 2000,
						mask: true
					})
				}

				if (drawStartSpan < -1440) {
					uni.showToast({
						title: "抽签已经结束",
						icon: "none",
						duration: 2000,
					})
				}
				// 抽签开始时间
				if (-1440 <= drawStartSpan && drawStartSpan <= 0) {
					const msg = uniCloud.importObject("message")
					await msg.beforeDrawLots(this.getUserInfo._id)
					uni.showToast({
						title: "抽签中...",
						icon: "loading",
						duration: 2000,
						mask: true
					})
					setTimeout(() => {
						uni.showToast({
							title: "抽签完成，等待开奖时刻...",
							icon: "success",
							duration: 1500
						})
					}, 2000)

					this.currentAuthorityType = 4
				}



			},

			// 已抽签
			async afterDrawLots() {
				let currentTime = new Date().getTime();
				console.log(currentTime)
				// 抽签截止日期时间判断
				const drawEnd = new Date(t2).getTime();
				const drawEndSpan = this.$moment(drawEnd).diff(this.$moment(currentTime), "minutes")
				console.log(drawEndSpan)
				// 抽签进行中。。。
				if (drawEndSpan > 0) {
					uni.showToast({
						title: "您只有一次抽签的资格，请勿重新抽签",
						icon: "none",
						duration: 2000
					})
				}
				// 抽签截止。。。
				if (drawEndSpan <= 0) {
					uni.showToast({
						title: "抽签活动截止，敬请期待晚上6点开奖...",
						icon: "none",
						duration: 2000
					})
				}


			},


			goBack() {
				uni.navigateBack({
					delta: 1
				});
			},

			// 通过id查询
			async getGoodsItemDeatils(id) {
				const goods = uniCloud.importObject('digital-goods')
				const {
					data
				} = await goods.getGoodsById(id);
				console.log(data)
				this.goodsItemDeatils = data
				this.goodsItemDeatilsId = data._id;
			}

		},

	}
</script>
<style>
	page {
		background-color: black;
	}
</style>
<style lang="less" scoped>
	.nav-bar {
		background-color: black;
	}

	.showGoodItem {
		height: 800rpx;
		display: flex;
		flex-direction: column;

		.center {
			overflow: hidden;
			flex: 6;
		}

		.bottom {

			flex: 2;
			background-image: url(../../../static/basic/desk.png);
			background-repeat: no-repeat;
			background-size: 100%;
			z-index: 9999;
		}
	}

	.introduce {
		margin-top: 80rpx;
		color: white;
		text-align: center;
		line-height: 30rpx;
		font-size: 45rpx;

		text:before {
			background: url(@/static/basic/left.png);
			content: '';
			display: inline-block;
			width: 80rpx;
			height: 80rpx;
			background-size: 100%;
			background-repeat: no-repeat;
			vertical-align: top;
		}

		text::after {
			background: url(@/static/basic/right.png);
			content: '';
			display: inline-block;
			width: 80rpx;
			height: 80rpx;
			background-size: 100%;
			background-repeat: no-repeat;
			vertical-align: top;

		}
	}

	// 限量
	.tag {
		font-size: 27rpx;
		color: #988f78;
		margin-bottom: 15rpx;
		text-align: center;

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
	}

	// 倒计时
	.countDown {
		margin-top: 40rpx;
		text-align: center;
		color: #C0C0C0;
		font-size: 40rpx;

		text {
			color: white;
		}
	}

	// 认证
	.authentication {
		color: white;
		padding: 20rpx;

		view {
			padding: 20rpx 0;
			margin: 20rpx 0;
			overflow: hidden;
			border-bottom: 1rpx dotted #1f625f;


			text:nth-child(1) {
				float: left;
			}

			.copy {
				margin-left: 20rpx;
				font-size: 20rpx;
				float: right;
				color: #0099CC;
			}

			.content {
				float: right;
				color: #C0C0C0;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
		}

	}

	// 查看更多
	.more {
		margin-top: 40rpx;
		color: #C0C4CC;
		font-size: 25rpx;
		text-align: center;
		width: 100%;

		// height: 600rpx;
		image {
			width: 100%;
			// height: 100%;
		}

		// .tip:before {
		// 	content: '🔒';
		// }
	}

	.author {
		// height: 450rpx;
		margin-top: 60rpx;
		display: flex;
		flex-direction: column;
		background-color: #141414;
		color: white;

		.top {
			height: 100rpx;
			font-size: 27rpx;

			view {
				margin-right: 20rpx;
			}

			view:nth-child(3) {
				font-size: 30rpx;
			}



			.headerImg {
				float: left;
				height: 70rpx;
				width: 70rpx;
				border-radius: 50%;
				overflow: hidden;

				image {
					width: 100%;
					height: 100%;
				}
			}
		}

		.center {
			flex: 1;
			margin: 20rpx 0;
			font-size: 27rpx;
			color: white;
			line-height: 40rpx;
		}

		.bottom {
			height: 60rpx;
			overflow: hidden;
			color: #C7C7C7;

			.left {
				float: left;
			}

			.right {
				float: right;
			}
		}
	}

	// 购买须知
	.provision {
		margin-top: 40rpx;
		padding-bottom: 50rpx;
		background-color: #141414;

		.title {
			font-size: 40rpx;
			color: white;
			text-align: center;
			padding-top: 20rpx;
		}

		view {
			color: #C0C0C0;
			font-size: 25rpx;
			margin: 30rpx 0;
		}
	}

	.footer {
		height: 80rpx;
		color: white;
		text-align: center;
		font-size: 25rpx;
	}

	.buy {
		position: fixed;
		bottom: 0;
		left: 5%;
		right: 5%;
		padding: 20rpx 0;
		height: 100rpx;
		color: white;
		background-color: black;

		.left {
			float: left;
			font-size: 40rpx;
			line-height: 70rpx;
		}

		.right {
			float: right;
			width: 180rpx;
			height: 70rpx;
			border-radius: 40rpx;
			line-height: 70rpx;
			text-align: center;
			color: #ccc;
			background-color: #141414;
		}
	}
</style>
