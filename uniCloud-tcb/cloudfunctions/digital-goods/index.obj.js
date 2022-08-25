const {
	get
} = require("http");

// 开发文档: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
const db = uniCloud.database();
const dbCmd = db.command
module.exports = {
// 获取
	async getGoodsBySkipAndtype(skip,goods_type) {
		console.log(goods_type)
		let {data} = await db.collection("digital-goods").where({
				"is_on_sale": true,
				goods_type
			}).skip(skip).limit(10)
			.orderBy("rank_index","desc")
			.get()
			
		return {
			code: 0,
			msg: '查询成功',
			data
		}
	},
	// 根据id查找数藏
	async getGoodsById(id) {
		let {
			data
		} = await db.collection("digital-goods").doc(id).get()
		return {
			errCode: 0,
			errMsg: '查询成功',
			data: data[0]
		}
	},
	// 根据id更新库存
	async updateGoodsCount(id, count) {
		// 修改库存
		let res = await collection.doc(id).update({
			"remain_count": dbCmd.inc(-count),
			"sale_show_count": dbCmd.inc(-count)
		});

		return {
			errCode: 0,
			errMsg: '修改库存成功'
		}
	},

	// 获得当前库存
	async getGoodsCount(id) {
		const {
			data
		} = await collection.doc(id).get()
		return {
			errCode: 0,
			errMsg: '搜索库存成功',
			res: data
		}
	},






}
