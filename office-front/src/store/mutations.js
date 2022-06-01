/**
 * Mutations业务层数据提交
 */
import storage from './../utils/storage'
import { ROLE_INFO } from './constants';

export default {
    saveUserInfo(state, userInfo) {
        state.userInfo = userInfo;
        storage.setItem('userInfo', userInfo)
    },
    saveActionList(state, actionList) {
        state.actionList = actionList;
        storage.setItem('actionList', actionList)
    },
    saveNoticeCount(state, noticeCount) {
        state.noticeCount = noticeCount;
        storage.setItem('noticeCount', noticeCount)
    },
    saveRoleInfo(state, roleInfo){
        state.roleInfo = roleInfo;
        storage.setItem(ROLE_INFO, roleInfo)
    }
}
