import { getToken, setToken, removeToken } from '@/util/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    roles: ''
  }
}

const state = getDefaultState()

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      //此处传入账号密码校验，调用接口 返会token
      if (username && password === "123456") {
        const token = "ssssyyyy"
        commit("SET_TOKEN", token)
        setToken(token)
        resolve()
      } else {
        reject('密码错误')
      }
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      // 此处传入token，调用接口 返回用户信息及权限
      if (state.token) {
        const name = "史远"
        const roles = ['2']
        commit('SET_NAME', name)
        commit('SET_ROLES', roles)
        resolve(roles)
      } else {
        reject()
      }
    })
  },

  // user logout
  logout({ commit }) {
    return new Promise((resolve) => {
      // 此处应有登出接口 回调
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resetRouter()
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
