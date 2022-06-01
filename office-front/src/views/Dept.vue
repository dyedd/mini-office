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
            <el-table :data="deptList" row-key="bmid" :tree-props="{ children: 'children' }" stripe>
                <el-table-column v-for="item in columns" :key="item.prop" v-bind="item"></el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" @click="handleDel(scope.row.bmid)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-dialog :title="action == 'create' ? '创建部门' : '编辑部门'" v-model="showModal"
            :before-close="(() => handleClose(dialogFormRef))">
            <el-form ref="dialogFormRef" :model="deptForm" :rules="rules" label-width="120px">
                <el-form-item label="上级部门" prop="parent">
                    <el-cascader placeholder="请选择上级部门" v-model="deptForm.parent"
                        :props="{ value: 'bmid', label: 'bmm', checkStrictly: true }" clearable :options="deptList"
                        :show-all-levels="true"></el-cascader>
                </el-form-item>
                <el-form-item label="部门名称" prop="bmm">
                    <el-input placeholder="请输入部门名称" v-model="deptForm.bmm"></el-input>
                </el-form-item>
                <el-form-item label="负责人" prop="bmr">
                    <el-select placeholder="请选择部门负责人" v-model="deptForm.bmr">
                        <el-option v-for="item in userList" :key="item.userid" :label="item.uname" :value="item.userid">
                        </el-option>
                    </el-select>
                </el-form-item>
                <template v-if="deptForm.user">
                    <el-form-item label="负责人邮箱" prop="user.umail">
                        <el-input placeholder="请输入负责人邮箱" v-model="deptForm.user.umail" disabled></el-input>
                    </el-form-item>
                </template>
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
        prop: "bmm",
    },
    {
        label: "负责人",
        prop: "bmr",
    }
    ,
    {
        label: "更新时间",
        prop: "update_time",
    },
    {
        label: "创建时间",
        prop: "created_time",
    },
];
let deptList = ref([]);

let pager = {
    pageNum: 1,
    pageSize: 10,
};

let action = ref("create");
let showModal = ref(false);
let deptForm = reactive({
});
let userList = ref([]);
let rules = {
    parent: [
        {
            required: false,
            message: "请选择上级部门",
            trigger: "blur",
        },
    ],
    bmm: [
        {
            required: true,
            message: "请输入部门名称",
            trigger: "blur",
        },
    ],
    bmr: [
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
        userList.value = list;
    })
};
function handleReset(form) {
    form.resetFields();
};
function handleOpen() {
    action.value = "create";
    showModal.value = true;
};
function handleEdit(row) {
    action.value = "edit";
    showModal.value = true;
    nextTick(() => {
        Object.assign(this.deptForm, {
            ...row,
            parent: [row.parent],
        });
    })
};
function handleDel(_id) {
    (async () => {
        action.value = "delete"
        await api.deptOperate({ params: { bmid: _id }, action: action.value });
        ElMessage.success("删除成功");
        getDeptList();
    })();
};
function handleClose(form) {
    handleReset(form);
    showModal.value = false;
};
function handleSubmit() {
    dialogFormRef.value.validate(async (valid) => {
        if (valid) {
            try {

                let params = { params: deptForm, action: action.value };
                params.params.user = undefined;
                if (params.params?.parent?.length) {
                    params.params.parent = params.params.parent[params.params.parent.length - 1];
                }
                await api.deptOperate(params);
                ElMessage({
                    message: "操作成功",
                    type: "success",
                })
                handleClose(dialogFormRef.value);
                getDeptList();
            } catch (err) {
                console.log(err);
                ElMessage.error(`操作失败`);
            }
        }
    });
};
</script>
