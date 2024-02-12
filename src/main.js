import Vue from 'vue'
import App from './App.vue'
import globalData from './assets/js/global.data.js'
import router from './router'
import ElementUI from "element-ui";
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/main.css'
Vue.prototype.GLOBAL = globalData

Vue.config.productionTip = false

Vue.use(globalData)
Vue.use(ElementUI)
new Vue({
  el: '#app',
  router,
  render: h => h(App),
}).$mount('#app')
