<script setup>
import { getCurrentInstance, nextTick, onMounted, reactive, ref, toRaw } from "vue";
import utils from "./../utils/utils";
//   获取Composition API 上下文对象
const { appContext } = getCurrentInstance();
// 初始化用户表单对象
const user = reactive({
  ustate: '在职',
});
// 初始化用户列表数据
const userList = ref([]);
// 初始化分页对象
const pager = reactive({
  pageNum: 1,
  pageSize: 10,
});
// 选中用户列表对象
const checkedUserIds = ref([]);
// 弹框显示对象
const showModal = ref(false);
// 新增用户Form对象
const userForm = reactive({
  ustate: '',
});
// 所有角色列表
const roleList = ref([]);
// 所有部门列表
const deptList = ref([]);
// 定义用户操作行为
const action = ref("add");
// 定义表单校验规则
const rules = reactive({
  uname: [
    {
      required: true,
      message: "请输入用户名称",
      trigger: "blur",
    },
  ],
  umail: [
    { required: true, message: "请输入用户邮箱", trigger: "blur" },
  ],
  mobile: [
    {
      pattern: /1[3-9]\d{9}/,
      message: "请输入正确的手机号格式",
      trigger: "blur",
    },
  ],
});
// 定义动态表格-格式
const columns = reactive([
  {
    label: "用户ID",
    prop: "userid",
  },
  {
    label: "用户名",
    prop: "uname",
  },
  {
    label: "用户邮箱",
    prop: "umail",
    formatter(row, column, value) {
        return `${value}@tust.edu.cn`;
    },
  },
  {
    label: "用户角色",
    prop: "urole",
    formatter(row, column, value) {
      console.log(roleList.value.find(v=>v.roleid == row.urole));
      return roleList.value.find(v=>v.roleid == row.urole)?.rolename || ''
    },
  },
  {
    label: "用户状态",
    prop: "ustate",
  },
  {
    label: "注册时间",
    prop: "created_time",
    width: 180,
    formatter: (row, column, value) => {
      return utils.formateDate(new Date(value));
    },
  },
  {
    label: "更新时间",
    prop: "update_time",
    width: 180,
    formatter: (row, column, value) => {
      return utils.formateDate(new Date(value));
    },
  },
]);
const dialogForm = ref();
const form = ref();
// 初始化接口调用
onMounted(() => {
  getUserList();
  getDeptList();
  getRoleAllList();
});
// 获取用户列表
const getUserList = async () => {
  let params = { ...user, ...pager };
  try {
    const { list, page } = await appContext.config.globalProperties.$api.getUserList(params);
    userList.value = list;
    pager.total = page.total;
  } catch (error) { }
};
//  查询事件，获取用户列表
const handleQuery = () => {
  getUserList();
};
// 重置查询表单
const handleReset = () => {
  form.value.resetFields();
};
// 分页事件处理
const handleCurrentChange = (current) => {
  pager.pageNum = current;
  getUserList();
};
// 用户单个删除
const handleDel = async (row) => {
  await appContext.config.globalProperties.$api.userDel({
    userids: [row.userid], //可单个删除，也可批量删除
  });
  ElMessage.success("删除成功");
  getUserList();
};
// 批量删除
const handlePatchDel = async () => {
  if (checkedUserIds.value.length == 0) {
    ElMessage.error("请选择要删除的用户");
    return;
  }
  const res = await appContext.config.globalProperties.$api.userDel({
    userids: checkedUserIds.value, //可单个删除，也可批量删除
  });
  if (res.nModified > 0 || res.rowsAffected > 0) {
    ElMessage.success("删除成功");
    getUserList();
  } else {
    ElMessage.success("修改失败");
  }
};

// 表格多选
const handleSelectionChange = (list) => {
  let arr = [];
  list.map((item) => {
    arr.push(item.userid);
  });
  checkedUserIds.value = arr;
};
// 用户新增
const handleCreate = () => {
  action.value = "add";
  showModal.value = true;
};

const getDeptList = async () => {
  let list = await appContext.config.globalProperties.$api.getDeptList();
  deptList.value = list;
};

// 角色列表查询
const getRoleAllList = async () => {
  let list = await appContext.config.globalProperties.$api.getRoleAllList();
  roleList.value = list;
};
// 用户弹窗关闭
const handleClose = () => {
  showModal.value = false;
  handleReset(dialogForm.value);
};
// 用户提交
const handleSubmit = () => {
  dialogForm.value.validate(async (valid) => {
    if (valid) {
      let params = toRaw(userForm);
      params.userEmail += "@edu.tust.cn";
      params.action = action.value;
      let res = await appContext.config.globalProperties.$api.userSubmit(params);
      showModal.value = false;
      if(action.value == "edit"){
        ElMessage.success("用户编辑成功");
      }else{
        ElMessage.success("用户创建成功");
      }
      handleReset(dialogForm.value);
      getUserList();
    }
  });
};
// 用户编辑
const handleEdit = (row) => {
  action.value = "edit";
  showModal.value = true;
  nextTick(() => {
    Object.assign(userForm, row);
  })
};

</script>
<template>
  <div class="user-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="user">
        <el-form-item label="用户ID" prop="userid">
          <el-input v-model="user.userid" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="用户名称" prop="uname">
          <el-input v-model="user.uname" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="状态" prop="ustate">
          <el-select v-model="user.ustate">
            <el-option value="0" label="所有"></el-option>
            <el-option value="在职" label="在职"></el-option>
            <el-option value="离职" label="离职"></el-option>
            <el-option value="实习" label="实习"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">新增</el-button>
        <el-button type="danger" @click="handlePatchDel">批量删除</el-button>
      </div>
      <el-table :data="userList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width" :formatter="item.formatter">
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button @click="handleEdit(scope.row)" size="mini">编辑</el-button>
            <el-button type="danger" size="mini" @click="handleDel(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total"
        :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>
    <el-dialog :title="action == 'add' ? '用户新增' : '用户编辑'" v-model="showModal">
      <el-form ref="dialogForm" :model="userForm" label-width="100px" :rules="rules">
        <el-form-item label="用户名" prop="uname">
          <el-input v-model="userForm.uname" :disabled="action == 'edit'" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="umail">
          <el-input v-model="userForm.umail" :disabled="action == 'edit'" placeholder="请输入用户邮箱">
            <template #append>@edu.tust.cn</template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="userForm.umobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="岗位">
          <el-input v-model="userForm.job" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="userForm.ustate">
            <el-option value="在职" label="在职"></el-option>
            <el-option value="离职" label="离职"></el-option>
            <el-option value="实习" label="实习"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleList">
          <el-select v-model="userForm.urole" placeholder="请选择用户角色" style="width: 100%">
            <el-option v-for="role in roleList" :key="role.roleid" :label="role.rolename" :value="role.roleid"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-cascader v-model="userForm.deptid" placeholder="请选择所属部门" :options="deptList"
            :props="{ emitPath: false, value: 'bmid', label: 'bmm' }" clearable style="width: 100%">
          </el-cascader>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>


<style lang="scss">
</style>