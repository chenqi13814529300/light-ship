<template>
	<view>
		<turnLottery v-if="type==1" 
		:themeColor="themeColor" 
		:btn_Color="btn_Color" 
		:seled_Color="seled_Color" 
		:seled_t_Color="seled_t_Color" 
		:un_seled_Color="un_seled_Color"
		:un_seled_t_Color="un_seled_t_Color"
		:show_again="show_again"
		:again_txt="again_txt"
		:result_txt="result_txt"
		:tips_init="tips_init"
		:no_z_init="no_z_init"
		@show="show" 
		@again="again" 
		:seled_img="seled_img"
		:un_seled_img="un_seled_img"></turnLottery>
		
		
		<marquee v-if="type==2" :list="list" :themeColor="themeColor" :bgColor="bgColor" :bg_sd_Color="bg_sd_Color" @result="result" @toDetailPage="toDetailPage"
		:theme_img_bg="theme_img_bg" 
		:is_img_bg="is_img_bg"
		:box_shadow_Color="box_shadow_Color"
		:bg_img="bg_img"
		:stay_index="stay_index"></marquee>
		
		<turnplate v-if="type==3" :list="list" :chance_num_init="chance_num_init" :height="height" :width="width" @result="result" @toDetailPage="toDetailPage" :stay_index="stay_index"></turnplate>
		
		<blow v-if="type==4"  
		ref="blowRef"
		:canvasId="canvasId" 
		:height="height" 
		:width="width" 
		:percentage="percentage" 
		:touchSize="touchSize"
		:fillColor="fillColor"
		:watermark="watermark"
		:watermarkColor="watermarkColor"
		:watermarkSize="watermarkSize"
		:title="title"
		:titleColor="titleColor"
		:titleSize="titleSize"
		:disabled="disabled"
		
		:is_show="is_show"
		:result_img="result_img"
		:result_txt="result_txt"
		:txtFontSize="txtFontSize" 
		:txtColor="txtColor"
		:init_show="init_show"
		@complete="complete"
		@init="init"></blow>
		
		<blowImg v-if="type==5"
		ref="blowRef"
		:canvasId="canvasId" 
		:height="height" 
		:width="width" 
		:percentage="percentage" 
		:touchSize="touchSize"
		:fillColor="fillColor"
		:watermark="watermark"
		:watermarkColor="watermarkColor"
		:watermarkSize="watermarkSize"
		:title="title"
		:titleColor="titleColor"
		:titleSize="titleSize"
		:disabled="disabled"
		
		:is_show="is_show"
		:result_img="result_img"
		:result_txt="result_txt"
		:txtFontSize="txtFontSize" 
		:txtColor="txtColor"
		:init_show="init_show"
		@complete="complete"
		@init="init"></blowImg>
		
		<blowAny v-if="type==6"
		ref="blowRef"
		:canvasId="canvasId" 
		:height="height" 
		:width="width" 
		:percentage="percentage" 
		:touchSize="touchSize"
		:fillColor="fillColor"
		:watermark="watermark"
		:watermarkColor="watermarkColor"
		:watermarkSize="watermarkSize"
		:title="title"
		:titleColor="titleColor"
		:titleSize="titleSize"
		:disabled="disabled"
		
		:is_show="is_show"
		:result_img="result_img"
		:result_txt="result_txt"
		:txtFontSize="txtFontSize" 
		:txtColor="txtColor"
		:init_show="init_show"
		@complete="complete"
		@init="init">
			<slot></slot>
		</blowAny>
	</view>
</template>

<script>
	import marquee from './marquee.vue';
	import turnplate from './turnplate.vue';
	import turnLottery from './turnLottery.vue';
	import blow from './blow.vue';
	import blowImg from './blow_img.vue';
	import blowAny from './blow_any.vue';
	export default {
		components: {
			marquee,
			turnplate,
			turnLottery,
			blow,
			blowImg,
			blowAny,
		},
		props: {
			type: {
				type: Number,
				default: 1, //1:??????  2:????????? 3????????? 4??? ????????????????????? 5??? ?????????????????????6??? ???????????????????????????
			},
			list: {
				type: Array,
				default () {
					return []
				}
			},
			
			height: {
				type: Number,
				default: 150
			},
			width: {
				type: Number,
				default: 150
			},
			themeColor: {
				type: String,
				default: '#33CCCC',
			},
			btn_Color: {
				type: String,
				default: '#ffffff',
			},
			seled_Color: {
				type: String,
				default: '#f43f3b',
			},
			seled_t_Color: {
				type: String,
				default: '#98FB98',
			},
			un_seled_Color: {
				type: String,
				default: '#00BFFF',
			},
			un_seled_t_Color: {
				type: String,
				default: '#33CCCC',
			},
			result_txt: {
				type: String,
				default: '????????????',
			},
			show_again: {
				type: Boolean,
				default: false
			},
			again_txt: {
				type: String,
				default: '????????????',
			},
			tips_init: {
				type: String,
				default: '??????',
			},
			no_z_init: {
				type: String,
				default: '????????????',
			},
			bgColor: {
				type: String,
				default: '#1E90FF',
			},
			bg_sd_Color: {
				type: String,
				default: '#4169E1',
			},
			
			chance_num_init :{
				type: Number,
				default: 5
			},
			height: {
				type: Number,
				default: 700
			},
			width: {
				type: Number,
				default: 700
			},
			txtColor: {
				type: String,
				default: '#FFFFFF',
			},
			txtFontSize: {
				type: Number,
				default: 50,
			},
			canvasId: {
				type: String,
				default: 'blow',
			},
			//????????????
			stay_index :{
				type: Number,
				default: 1
			},
			percentage : { //????????????????????????????????????
				type : Number ,
				default : 45 
			},
			touchSize : { //??????????????????
				type : Number ,
				default : 20 
			},
			fillColor : { //??????????????????????????????
				type : String ,
				default : '#ddd' 
			},
			watermark : { //????????????
				type : String ,
				default : '?????????' 
			},
			watermarkColor : { //??????????????????
				type : String ,
				default : '#c5c5c5' 
			},
			watermarkSize : { //??????????????????
				type : Number ,
				default : 14 
			},
			title : { //????????????
				type : String ,
				default : '???????????????' 
			},
			titleColor : { //??????????????????
				type : String ,
				default : '#888' 
			},
			titleSize : { //??????????????????
				type : Number ,
				default : 24 
			},
			disabled : { //??????????????????
				type : Boolean ,
				default : false 
			},
			
			is_show : { //???????????????????????????
				type : Boolean ,
				default : false 
			},
			result_img: {
				type: String,
				default: 'https://cdn.pixabay.com/photo/2021/01/04/07/38/lily-5886728__340.jpg',
			},
			//???????????????????????????
			is_img_bg: { 
				type: Boolean,
				default: false
			},
			//????????????
			theme_img_bg: {
				type: String,
				default: '',
			},
			box_shadow_Color: {
				type: String,
				default: '#fcc8d0',
			},
			//??????????????????
			bg_img: {
				type: String,
				default: '',
			},
			//???????????????????????????
			seled_img: {
				type: String,
				default: '',
			},
			//??????????????????????????????
			un_seled_img: {
				type: String,
				default: '',
			},
			init_show: { //???????????????
				type : Boolean ,
				default : false 
			},
		},
		computed: {


		},

		watch: {

		},
		data() {
			return {

			};
		},

		methods: {
			initBlow(){
				this.$refs.blowRef.initBlow()
			},
			show(e){
				this.$emit('show', e);
			},
			again(e){
				this.$emit('again', e);
			},
			result(e){
				this.$emit('result', e);
			},
			toDetailPage(e){
				this.$emit('toDetailPage', e);
			},
			complete(e){
				this.$emit('complete', e);
			},
			init(e){
				this.$emit('init', e);
			},
		},
	}
</script>

<style lang="scss">

</style>
