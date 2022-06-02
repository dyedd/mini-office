import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import storage from './../utils/storage'
import API from './../api'
import utils from './../utils/utils'

const routes = [
    {
        name: 'home',
        path: '/',
        meta: {
            title: '首页'
        },
        component: Home,
        redirect: '/welcome',
        children: [
            {
                name: 'welcome',
                path: '/welcome',
                meta: {
                    title: '欢迎来到叮咚办公审批管理后台'
                },
                component: () => import('@/views/Welcome.vue')
            },
            {
                name: 'user',
                path: '/system/user',
                meta: {
                    title: '用户管理'
                },
                component: () => import('@/views/User.vue')
            },
            {
                name: 'dept',
                path: '/system/dept',
                meta: {
                    title: '部门管理'
                },
                component: () => import('@/views/Dept.vue')
            },{
                name: 'role',
                path: '/system/role',
                meta: {
                    title: '角色管理'
                },
                component: () => import('@/views/Role.vue')
            },{
                name: 'leave',
                path: '/system/leave',
                meta: {
                    title: '休假申请'
                },
                component: () => import('@/views/Leave.vue')
            },{
                name: 'approve',
                path: '/system/approve',
                meta: {
                    title: '休假审批'
                },
                component: () => import('@/views/Approve.vue')
            },
        ]
    },
    {
        name: 'login',
        path: '/login',
        meta: {
            title: '登录'
        },
        component: () => import('@/views/Login.vue')
    },
    {
        name: '404',
        path: '/404',
        meta: {
            title: '页面不存在'
        },
        component: () => import('@/views/404.vue')
    }
]
const router = createRouter({
    history: createWebHashHistory(),
    routes
})


// 导航守卫
router.beforeEach((to, from, next) => {
    if (router.hasRoute(to.name)) {
        document.title = to.meta.title;
        next()
    } else {
        next('/404')
    }
})

export default router
