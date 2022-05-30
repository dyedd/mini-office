<template>
    <div class="dept-manage">
        <div class="query-form">
            <el-form :inline="true" ref="queryFormRef" :model="queryForm">
                <el-form-item label="部门名称" prop="deptname">
                    <el-input placeholder="请输入部门名称" v-model="queryForm.deptname"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="getDeptList" type="primary">查询</el-button>
                    <el-button @click="handleReset(queryFormRef)">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-table">
            <div class="action">
                <el-button type="primary" @click="handleOpen">创建</el-button>
            </div>
            <el-table :data="deptList" row-key="_id" :tree-props="{ children: 'children' }" stripe>
                <el-table-column v-for="item in columns" :key="item.prop" v-bind="item"></el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" @click="handleDel(scope.row._id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-dialog :title="action == 'create' ? '创建部门' : '编辑部门'" v-model="showModal">
            <el-form ref="dialogFormRef" :model="deptForm" :rules="rules" label-width="120px">
                <el-form-item label="上级部门" prop="parentid">
                    <el-cascader placeholder="请选择上级部门" v-model="deptForm.parentid"
                        :props="{ checkStrictly: true, value: '_id', label: 'deptname' }" clearable :options="deptList"
                        :show-all-levels="true"></el-cascader>
                </el-form-item>
                <el-form-item label="部门名称" prop="deptname">
                    <el-input placeholder="请输入部门名称" v-model="deptForm.deptname"></el-input>
                </el-form-item>
                <el-form-item label="负责人" prop="user">
                    <el-select placeholder="请选择部门负责人" v-model="deptForm.user" @change="handleUser">
                        <el-option v-for="item in userList" :key="item.userid" :label="item.username" :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="负责人邮箱" prop="useremail">
                    <el-input placeholder="请输入负责人邮箱" v-model="deptForm.useremail" disabled></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleClose(dialogFormRef)">取消</el-button>
                    <el-button @click="handleSubmit" type="primary">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<script setup>
import { ElMessage } from 'element-plus';
import { nextTick, onMounted, reactive, ref } from 'vue';
import api from "../api/index";

const queryFormRef = ref();
const dialogFormRef = ref();
let queryForm = reactive({
    deptname: "",
});
let columns = [
    {
        label: "部门名称",
        prop: "deptname",
    },
    {
        label: "负责人",
        prop: "username",
    }
    ,
    {
        label: "更新时间",
        prop: "updatetime",
    },
    {
        label: "创建时间",
        prop: "createtime",
    },
];
let deptList = ref([{
    deptname: "Superior1",
    username: "PrincipalName",
    updatetime: "1970-01-01 00:00",
    createtime: "1970-01-01 00:00",
}, {
    deptname: "Superior1",
    username: "PrincipalName",
    updatetime: "1970-01-01 00:00",
    createtime: "1970-01-01 00:00",
}]);

let pager = {
    pageNum: 1,
    pageSize: 10,
};

let action = ref("create");
let showModal = ref(false);
let deptForm = reactive({
    parentid: [],
});
let userList = [{ userid: 1, username: "Username", useremail: "mail@example.com" }];
let rules = {
    parentid: [
        {
            required: true,
            message: "请选择上级部门",
            trigger: "blur",
        },
    ],
    deptname: [
        {
            required: true,
            message: "请输入部门名称",
            trigger: "blur",
        },
    ],
    user: [
        {
            required: true,
            message: "请选择负责人",
            trigger: "blur",
        },
    ],
}
onMounted(() => {
    getDeptList();
    getAllUserList();
})

function getDeptList() {
    api.getDeptList(queryForm).then((list) => {
        deptList.value = list;
    });
};
function getAllUserList() {
    api.getAllUserList().then((list) => {
        userList = list;
    })
};
function handleUser(val) {
    Object.assign(deptForm, val);
};
function handleReset(form) {
    form.resetFields();
};
function handleOpen() {
    action.value = "create";
    showModal.value = true;
};
function handleEdit(row) {
    action = "edit";
    showModal = true;
    nextTick(() => {
        Object.assign(this.deptForm, row, {
            user: `${row.userId}/${row.userName}/${row.userEmail}`,
        });
    })
};
function handleDel(_id) {
    (async () => {
        action = "delete"
        await api.deptOperate({ _id, action: this.action });
        this.$message.success("删除成功");
        getDeptList();
    })();
};
function handleClose(form) {
    showModal.value = false;
    handleReset(form);
};
function handleSubmit() {
    dialogFormRef.value.validate(async (valid) => {
        if (valid) {
            try {

                let params = { ...deptForm, action: action.value };
                delete params.user;
                await api.deptOperate(params);
                ElMessage({
                    message: "操作成功",
                    type: "success",
                })
                handleClose();
                getDeptList();
            } catch (err) {
                ElMessage.error(`操作失败`);
            }
        }
    });
};
</script>
