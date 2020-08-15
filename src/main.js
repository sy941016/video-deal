// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'  //vuex
import '@/permission' 
import '@/assets/css/common.scss'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import { mainMixin } from '@/mixin'
Vue.mixin(mainMixin)

Vue.config.productionTip = false;

// 实例化的vue
new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
});
