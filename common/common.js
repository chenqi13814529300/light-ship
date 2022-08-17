// 防止处理多次点击
function noMultipleClicks(methods, info) {
	// methods是需要点击后需要执行的函数， info是点击需要传的参数
	let that = this;
	if (that.noClick) {
		// 第一次点击
		that.noClick = false;
		if (info && info !== '') {
			// info是执行函数需要传的参数
			methods(info);
		} else {
			methods();
		}
		setTimeout(() => {
			that.noClick = true;
		}, 3000)
	} else {
		// 这里是重复点击的判断
	}
}


/*
    delSameObjValue 数组对象相同值相加去重
    arr 需要处理的数组
    keyName 用于判断相同的键名
    keyValue 用于计算的键值
    */
function delSameObjValue(arr, keyName, keyValue) {
	let baseArr = [],
		newArr = [];
	for (let key in arr) {
		if (baseArr.includes(arr[key][keyName])) {
			newArr[baseArr.indexOf(arr[key][keyName])][keyValue] += arr[key][keyValue];
		} else {
			baseArr.push(arr[key][keyName]);
			newArr.push(arr[key]);
		}
	}
	return newArr;
}
//导出
export default {
	noMultipleClicks, //禁止多次点击
	delSameObjValue
}
