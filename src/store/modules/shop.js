//state是Vuex中的公共的状态
const state = {
    products: [
        { name: '鼠标', price: 20 },
        { name: '键盘', price: 40 },
        { name: '耳机', price: 60 },
        { name: '显示屏', price: 80 }
    ]
}
//store的computed
const getters = {
    saleProducts: (state, getters, rootState) => {
        window.console.log("根节点状态---", rootState.count)
        let saleProducts = state.products.map(product => {
            return {
                name: product.name,
                price: product.price / 2
            }
        })
        return saleProducts;
    }
}
//store的methods
const mutations = {
    minusPrice(state, payload) {
        state.products.forEach(product => {
            product.price -= payload
        })
    }
}
//actions提交的是mutations,并不是直接变更状态
//actions中可以包含异步操作, mutations中不允许出现异步
//actions中的回调函数的第一个参数是context, 是一个与store实例具有相同属性和方法的对象
const actions = {
    minusPriceAsync(context, payload) {
        window.console.log("根节点状态---", context.rootState.count)
        setTimeout(() => {
            context.commit('minusPrice', payload); //context提交
        }, 2000)
    }
}

export default {
    namespaced: true,//通过添加 namespaced: true 的方式使其成为带命名空间的模块
    state,
    getters,
    actions,
    mutations
}