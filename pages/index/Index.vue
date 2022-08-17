<template>
	<view>
		我是首页
		<!-- <button @click="buy">抢购</button>
		<button @click="addGoods">铸造藏品</button> -->
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {
			async buy() {
				const test = uniCloud.importObject("buy-test")
				// const res=await test.goodsInit()
				// console.log(res)
				const res2=await test.buy()
				console.log(res2)
			},
			async addGoods(){
				const test = uniCloud.importObject("good-test")
			
				const res2=await test.addGoods()
				console.log(res2)
			}
		}
	}
</script>

<style>

</style>
