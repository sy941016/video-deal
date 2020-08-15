import Vue from 'vue'
import Vuex from 'vuex'
import shop from './modules/shop'
import permission from './modules/permission'
import getters from './getters'
import user from './modules/user'

Vue.use(Vuex)
const store = new Vuex.Store({
  state: { count: 0 },
  getters,
  modules: {
    permission,
    shop,
    user
  }
});

export default store
