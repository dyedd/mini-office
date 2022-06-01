<script setup>
import { ElMessage } from "element-plus";
import { getCurrentInstance, nextTick, onMounted, reactive, toRaw } from "vue";
import utils from "../utils/utils";
import store from "../store/index";
const { appContext } = getCurrentInstance();
const queryForm = reactive({
  rolename: "",
})
const columns = reactive([
  {
    label: "角色名称",
    prop: "rolename",
  },
  {
    label: "更新时间",
    prop: "update_time",
    formatter(row, column, value) {
      return utils.formateDate(new Date(value));
    },
  },
  {
    label: "创建时间",
    prop: "created_time",
    formatter(row, column, value) {
      return utils.formateDate(new Date(value));
    },
  },
])
const roleList = ref([]);
const pager = reactive({
  total: 0,
  pageNum: 1,
  pageSize: 10,
});
const showModal = ref(false);
const action = ref("create");
let roleForm = reactive({})
const rules = reactive({
  rolename: [
    {
      required: true,
      message: "请输入角色名称",
    },
  ],
})
const showPermission = ref(false)
const curRoleName = ref('')
const curRoleId = ref(0)
const dialogForm = ref();
const tree = ref();
const form = ref();
const menuList = reactive([
  {
    label: '用户管理',
    value: 'user'
  },
  {
    label: '部门管理',
    value: 'dept'
  },
  {
    label: '角色管理',
    value: 'role'
  },
])
onMounted(() => {
  getRoleList();
})
// 角色列表初始化
const getRoleList = async () => {
  try {
    let { list, page } = await appContext.config.globalProperties.$api.getRoleList({
      ...queryForm,
      ...pager,
    });
    roleList.value = list;
    pager.total = page.total;
  } catch (e) {
    throw new Error(e);
  }
}
// 表单重置
const handleReset = () => {
  form.value.resetFields();
};
// 角色添加
const handleAdd = () => {
  action.value = "create";
  showModal.value = true;
}
// 角色编辑
const handleEdit = (row) => {
  action.value = "edit";
  showModal.value = true;
  nextTick(() => {
    Object.assign(roleForm, row);
  })
}
// 角色删除
const handleDel = async (roleid) => {
  await appContext.config.globalProperties.$api.roleOperate({ roleid, action: "delete" });
  ElMessage.success("删除成功");
  getRoleList();
}
// 弹框关闭
const handleClose = () => {
  handleReset(dialogForm.value);
  showModal.value = false;
}
// 角色提交
const handleSubmit = () => {
  dialogForm.value.validate(async (valid) => {
    if (valid) {
      let params = toRaw(roleForm)
      params.action = action.value;
      let res = await appContext.config.globalProperties.$api.roleOperate(params);
      if (res) {
        showModal.value = false;
        ElMessage.success("创建成功");
        handleReset(dialogForm.value);
        getRoleList();
      }
    }
  });
}
const handleCurrentChange = (current) => {
  pager.pageNum = current;
  getRoleList();
}
const handlePermission = (row) => {
  curRoleName.value = row.rolename;
  curRoleId.value = row.roleid;
  showPermission.value = true;
  setTimeout(() => {
    tree.value.setCheckedKeys(JSON.parse(row.permission));
  });
}
const handlePermissionSubmit = async () => {
  let nodes = tree.value.getCheckedNodes();
  let checkedKeys = [];
  nodes.map((node) => {
    checkedKeys.push(node.value);
  });
  let params = {
    id: curRoleId["_value"],
    permissionList: JSON.stringify(checkedKeys),
  };
  await appContext.config.globalProperties.$api.updatePermission(params);
  showPermission.value = false;
  ElMessage.success("设置成功");
  store.dispatch("fetchRoleInfo");
  await getRoleList();

}
</script>
<template>
  <div class="role-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="角色名称" prop="rolename">
          <el-input v-model="queryForm.rolename" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getRoleList">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleAdd">创建</el-button>
      </div>
      <el-table :data="roleList">
        <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="primary" @click="handlePermission(scope.row)">设置权限</el-button>
            <el-button type="danger" size="mini" @click="handleDel(scope.row.roleid)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total"
        :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>
    <el-dialog title="角色新增" v-model="showModal">
      <el-form ref="dialogForm" :model="roleForm" label-width="100px" :rules="rules">
        <el-form-item label="角色名称" prop="rolename">
          <el-input v-model="roleForm.rolename" placeholder="请输入角色名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 权限弹框-->
    <el-dialog title="权限设置" v-model="showPermission">
      <el-form label-width="100px">
        <el-form-item label="角色名称">
          {{ curRoleName }}
        </el-form-item>
        <el-form-item label="选择权限">
          <el-tree ref="tree" :data="menuList" node-key="value" show-checkbox
            :props="{ label: 'label' }">
          </el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPermission = false">取 消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>


<style lang="scss">
</style>
