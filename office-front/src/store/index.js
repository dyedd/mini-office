/**
 * Vuex状态管理
 */
import { createStore } from 'vuex'
import mutations from './mutations'
import storage from './../utils/storage'
import {ROLE_INFO} from "./constants"
import actions from "./actions"

const state = {
    userInfo: storage.getItem("userInfo") || {}, // 获取用户信息
    menuList: storage.getItem("menuList"),
    actionList: storage.getItem("actionList"),
    roleInfo: storage.getItem(ROLE_INFO),
    noticeCount: 0
}
export default createStore({
    state,
    mutations,
    actions,
})
