import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/pages/index'

//重复push的bug处理
const routerPush = Router.prototype.push;
Router.prototype.push = function push(location) {
    return routerPush.call(this, location).catch(error => error)
}
Vue.use(Router);

//所有权限通用路由表 
export const constantRoutes = [
    {
        path: '/login',
        component: () => import('@/pages/login/index'),
        hidden: true
    },
    {
        path: '/',
        name: 'Index',
        //redirect: '/a', // 重定向/a
        // alias: '/b',//别名  访问b就是访问index
        component: Index,
        children: [
            {
                path: "",
                components: {
                    header: () => import('@/pages/header'),
                    footer: () => import('@/pages/footer')
                }
            }
        ]
    },
    {
        path: '/shop',
        name: 'shop',
        component: () => import('@/pages/shop'),
    },
    {
        path: '/404',
        component: () => import('@/pages/error'),
    }
]

//异步挂载的路由 - 动态需要根据权限加载的路由表 
export const asyncRoutes = [
    {
        path: '/videoDeal',
        name: 'videoDeal',
        component: (resolve) => require(['@/pages/videoDeal'], resolve),
        meta: { role: ['2'] } // 页面需要的权限
    },
    { path: '*', redirect: '/404', hidden: true }
];

const createRouter = () => new Router({
    mode: 'history',
    routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // reset router
}

export default router