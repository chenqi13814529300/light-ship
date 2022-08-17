import App from './App'
import common from '@/common/common.js'
import store from '@/store/index.js'
// 防抖点击
Vue.prototype.$noMultipleClicks = common.noMultipleClicks

// #ifndef VUE3
import Vue from 'vue'

Vue.config.productionTip = false
Vue.prototype.$store = store
App.mpType = 'app'
const app = new Vue({
    ...App,
	store
	
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif