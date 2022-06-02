/**
 * Vuex状态管理
 */
import { createStore } from 'vuex'
import mutations from './mutations'
import storage from './../utils/storage'
import actions from "./actions"

const state = {
    userInfo: storage.getItem("userInfo") || {}, // 获取用户信息
    menuList: storage.getItem("menuList"),
    actionList: storage.getItem("actionList"),
    noticeCount: storage.getItem("noticeCount")|| 0,
    roleInfo: storage.getItem("roleInfo"),
}
export default createStore({
    state,
    mutations,
    actions,
})
