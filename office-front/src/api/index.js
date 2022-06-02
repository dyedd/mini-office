/**
 * api管理
 */
import request from './../utils/request'
export default {
    login(params) {
        return request({
            url: '/users/login',
            method: 'post',
            data: params,
        })
    },
    noticeCount(params) {
        return request({
            url: '/leave/count',
            method: 'get',
            data: {},
            mock: false
        })
    },
    getUserList(params) {
        return request({
            url: '/users/list',
            method: 'get',
            data: params
        })
    },
    getAllUserList() {
        return request({
            url: '/users/all/list',
            method: 'get',
            data: {},
            mock: false
        })
    },
    userDel(params) {
        return request({
            url: '/users/delete',
            method: 'post',
            data: params
        })
    },
    getRoleAllList() {
        return request({
            url: '/roles/allList',
            method: 'get',
            data: {},
            mock: false
        })
    },
    getRoleList(params) {
        return request({
            url: '/roles/list',
            method: 'get',
            data: params,
            mock: false
        })
    },
    getDeptList(params) {
        return request({
            url: '/dept/list',
            method: 'get',
            data: params,
            mock: false
        })
    },
    deptOperate(params) {
        return request({
            url: '/dept/operate',
            method: 'post',
            data: params,
            mock: false
        })
    },
    userSubmit(params) {
        return request({
            url: '/users/operate',
            method: 'post',
            data: params,
            mock: false
        })
    },
    roleOperate(params) {
        return request({
            url: '/roles/operate',
            method: 'post',
            data: params,
            mock: false
        })
    },
    updatePermission(params) {
        return request({
            url: '/roles/update/permission',
            method: 'post',
            data: params,
            mock: false
        })
    },
    getApplyList(params) {
        return request({
            url: '/leave/list',
            method: 'get',
            data: params,
            mock: false
        })
    },
    leaveOperate(params) {
        return request({
            url: '/leave/operate',
            method: 'post',
            data: params,
            mock: false
        })
    },
    leaveApprove(params) {
        return request({
            url: '/leave/approve',
            method: 'post',
            data: params,
            mock: false
        })
    },
    async getRoleByID(id){
        if(id == null){
            throw new Error("id should not be null or undefined");
        }
        // since there isn't a corresponding function in the backend
        // just get all roles and find the one by id
        const response = await this.getRoleAllList()
        if (response && response.length !== 0) {
            const result_1 = response.find(item => item.roleid == id)
            result_1.permission = JSON.parse(result_1.permission)
            return result_1
        } else {
            throw new Error("Role list is empty, then how could you call getRoleById")
        }
    },
    // this should return candidates either (a having 'leave' permission, (b being the manager of the dept
    async getApproverCandidatesByDeptId(bmid){
        return request({
            url: '/leave/who',
            method: 'get',
            data: {
                bmid: bmid,
            }
        })
    }
}
