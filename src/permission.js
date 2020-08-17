import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/util/auth'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start()

  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          const roles = await store.dispatch('user/getInfo');
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles);
          router.addRoutes(accessRoutes);
          //hack方法 确保addRoutes已完成
          next({ ...to, replace: false });
        } catch (error) {
          // 获取信息失败
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          next(`/login`)
          NProgress.done()
        }
      }
    }
  } else {
    // has no token
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})