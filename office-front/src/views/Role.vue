<script setup>
import { ElMessage } from "element-plus";
import { getCurrentInstance, nextTick, onMounted, reactive, toRaw } from "vue";
import utils from "../utils/utils";
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
const dialogForm = ref();
const tree = ref();
const form = ref();
const menuList = reactive([
  {
    label: '用户管理',
    children: [
      {
        label: '新增',
        value: 'u1'
      },
      {
        label: '增加',
        value: 'u2'
      },
      {
        label: '删除',
        value: 'u3'
      },
    ],
  },
  {
    label: '部门管理',
    children: [
      {
        label: '新增',
        value: 'd1'
      },
      {
        label: '增加',
        value: 'd2'
      },
      {
        label: '删除',
        value: 'd3'
      },
    ],
  },
  {
    label: '身份管理',
    children: [
      {
        label: '新增',
        value: 'j1'
      },
      {
        label: '增加',
        value: 'j2'
      },
      {
        label: '删除',
        value: 'j3'
      },
    ],
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
const handleReset = (form) => {
  form.resetFields();
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
const handleClose = (dialogForm) => {
  handleReset(dialogForm);
  showModal.value = false;
}
// 角色提交
const handleSubmit = (dialogForm) => {
  dialogForm.validate(async (valid) => {
    if (valid) {
      let params = toRaw(roleForm)
      params.action = action.value;
      let res = await appContext.config.globalProperties.$api.roleOperate(params);
      if (res) {
        showModal.value = false;
        ElMessage.success("创建成功");
        handleReset(dialogForm);
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
  showPermission.value = true;
}
const handlePermissionSubmit = (tree)=>{
      let nodes = tree.getCheckedNodes();
      let halfKeys = tree.getHalfCheckedNodes();
      console.log(nodes);
      console.log(halfKeys);
      let checkedKeys = [];
      let parentKeys = [];
      nodes.map((node) => {
        if (!node.children) {
          checkedKeys.push(node.value);
        } else {
          parentKeys.push(node.label);
        }
      });
      console.log(checkedKeys,
      parentKeys.concat(halfKeys));
      // let params = {
      //   _id: this.curRoleId,
      //   permissionList: {
      //     checkedKeys,
      //     halfCheckedKeys: parentKeys.concat(halfKeys),
      //   },
      // };
      // await this.$api.updatePermission(params);
      // this.showPermission = false;
      // this.$message.success("设置成功");
      // this.getRoleList();
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
          <el-button @click="handleReset(form)">重置</el-button>
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
          <el-button @click="handleClose(dialogForm)">取 消</el-button>
          <el-button type="primary" @click="handleSubmit(dialogForm)">确 定</el-button>
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
          <el-tree ref="tree" :data="menuList" node-key="value" show-checkbox default-expand-all
            :props="{ label: 'label' }">
          </el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPermission = false">取 消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit(tree)">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>


<style lang="scss">
</style>