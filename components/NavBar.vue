<template>
  <view class="nav-bar">
    <view class="left"><slot name="left"></slot></view>
    <view class="center"><slot name="center"></slot></view>
    <view class="right"><slot name="right"></slot></view>
  </view>
  
  
</template>

<script>
  export default {
    name: "NavBar"
  }
</script>

<style scoped>
  .nav-bar {
    position: -webkit-sticky;
    position: sticky;
    top: var(--window-top);
    z-index: 99;
    height: 80rpx;
    overflow: hidden;
    line-height: 80rpx;
    background-color: #242729;
	color: white;
  }
	.left{
		float: left;
	}
	.right{
		float: right;
	}

	
</style>
