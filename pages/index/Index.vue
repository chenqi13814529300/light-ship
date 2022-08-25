<template>
	<view>
		<!-- 登录状态 -->
		<nav-bar>
			<view slot="left" class="left">启航</view>
			<view slot="right" v-if="isLogin" @click="goLogin">{{getUserInfo._id.slice(0,12)}} <text @click="outLogin"
					class="outLogin">退出</text></view>
			<view slot="right" v-else @click="goLogin">登录</view>
		</nav-bar>
		<!-- tab栏固定  -->
		<view class="tab-control-fix" v-show="isTabFixed">
			<view class="tabItem" @click="changeCurrent(index)" v-for="(item,index) in tabInfo"
				:class="{currentTab: index === currentIndex}">
				{{item}}
			</view>
		</view>
		<!--  -->
		<!-- 轮播图 -->
		<uni-swiper-dot :info="info" :current="current" field="content" mode="round">
			<swiper class="swiper-box" @change="change" autoplay="true">
				<swiper-item v-for="(item ,index) in info" :key="index">
					<image @click="bigImgDeatils(item)" :src="require(`@/static/lun/${item.content}`)" mode="widthFix">
					</image>
				</swiper-item>
			</swiper>
		</uni-swiper-dot>
		<!-- 公告 -->
		<view class="lwNoticeBox">
			<lwNotice :showScale="true" @itemClick="newsItemDetails" :list="newsList"></lwNotice>
			<uni-icons class="more" @click="oatoUrl" type="bars" size="30" color="white"></uni-icons>
		</view>

		<!-- 切换栏 -->
		<view class="tab-control">
			<view class="tabItem" @click="changeCurrent(index)" v-for="(item,index) in tabInfo"
				:class="{currentTab: index === currentIndex}">
				{{item}}
			</view>
		</view>

		<!-- 单个皮肤展示组件 -->
			<digit-goods v-for="item in goodsList.data" :goodsItem="item" v-show="currentIndex==0"
			@click.native="toGoodsDetails(item)"></digit-goods>
			
	</view>
</template>

<script>
	import NavBar from '../../components/NavBar.vue'
	import lwNotice from '@/components/lw-notice/lw-notice.vue'
	import DigitGoods from '../../components/DigitGoods.vue'
	import {
		mapGetters,
		mapMutations
	} from "vuex";
	export default {
		components: {
			NavBar,
			lwNotice,
			DigitGoods,
		},
		data() {
			return {
				// 轮播图片 这里就不从后端获取了，大家应该都会
				info: [{
						content: 'lun2.jpeg',
						big: 'lun2-big.jpeg'
					},
					{
						content: 'lun1.jpeg',
						big: 'lun1-big.jpeg'
					},

				],
				current: 0,

				// 新闻公告栏 也是写死，反正这个简单
				newsList: [
					"启航官网jrx.jrxtiejin.com",
					"江河地笑CSDN",
				],
				// tab切换栏
				currentIndex: 0,
				tabInfo: [
					"法师皮肤",
					"战士皮肤",
					"辅助皮肤",
					"皮肤抽奖"
				],
				// tab下拉的时候需要固定在最上面
				isTabFixed: false,
				// 相同type的皮肤（法师皮肤）
				goodsList:[]
			}
		},
		computed: {
			...mapGetters(["getUserInfo"]),
			isLogin() {
				console.log(this.getUserInfo)
				if (Object.keys(this.getUserInfo).length > 0) {
					return true;
				} else {
					return false;
				}
			},
		},
		onLoad() {
			this.getGoodsBySkipAndtype()
		},
		methods: {
			...mapMutations(['setUserInfo']),
			// 去登录
			goLogin() {
				uni.navigateTo({
					url: "/pages/login/Login"
				})
			},
			// 退出登录
			outLogin() {
				this.setUserInfo({})
				uni.removeStorageSync('uni_id_token')
				uni.removeStorageSync('uni_id_token_expired')
				uni.navigateTo({
					url: "/pages/Login/Login"
				})
			},
			// 轮播图详情页面
			bigImgDeatils(item) {
				// 预览图片
				let imgArr = [];
				/* 这里可以使用网络路径，也可以使用图片的base64编码 */
				imgArr.push(require(`@/static/lun/${item.big}`))
				//预览图片
				uni.previewImage({
					urls: imgArr,
					current: imgArr[0]
				});
			},
			// 轮播图改变都时候的方法
			change(e) {
				this.current = e.detail.current;
			},
			// 公告详情
			newsItemDetails(data) {

				// 数据库中的新闻是包含title和id字段
				// 通过title找到对应的新闻对象，然后通过新闻对象的id得到新闻详情，这里就不演示后端代码了
				// const currentNews = this.newsList.find(item => item.title == data)
				// uni.navigateTo({
				// 	url: '/pages/activities/OfficialNewsDeatils?id=' + currentNews.id
				// })

			},

			// tab切换栏
			changeCurrent(index) {
				this.currentIndex = index
			},

			// 获得不同的goods_type的皮肤列表
			async getGoodsBySkipAndtype() {
				const goods = uniCloud.importObject('digital-goods')
				this.goodsList= await goods.getGoodsBySkipAndtype(0, this.currentIndex)
				console.log(this.goodsList)
			},
			// 对应的皮肤详情
			toGoodsDetails(info) {
				uni.navigateTo({
					url: "/pages/index/digitGoodsDetails/DigitGoodsDetails?id=" + info._id,
				})
			},

		},
		// 滚动页面位置监听
		onPageScroll(res) {
			if (res.scrollTop >= 170) {
				this.isTabFixed = true
			} else {
				this.isTabFixed = false
			}
		},
	}
</script>

<style lang="less" scoped>
	// 轮播图
	.swiper-box {
		margin-top: 40rpx;
		border-radius: 20rpx;
		height: 300rpx;

		swiper-item {
			overflow: hidden;
			border-radius: 20rpx;
			height: 300rpx;
		}

		image {
			height: 300rpx;
			border-radius: 20rpx;
			width: 100%;
		}
	}

	// 新闻公告栏
	// 公告
	.lwNoticeBox {
		position: relative;
		overflow: hidden;
		margin: 20rpx 0;
		border-radius: 20rpx;

		.more {
			position: absolute;
			right: 0;
			top: 0;
		}

	}

	// tab切换栏
	// 图片控制器
	.tab-control,
	.tab-control-fix {
		padding: 20rpx 0 40rpx;
		display: flex;
		width: 100%;
		background-color: #242729;

		view {
			color: #cac7cc;
			margin: 0 10rpx;
		}

		.currentTab {
			color: white;
			border-bottom: 4rpx solid white;
		}
	}

	.tab-control-fix {
		position: fixed;
		z-index: 99;
	}
</style>
