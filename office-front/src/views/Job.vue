<script setup>
import { ElMessage } from "element-plus";
import { getCurrentInstance, nextTick, onMounted, reactive, toRaw } from "vue";
import utils from "../utils/utils";
const { appContext } = getCurrentInstance();
const queryForm = reactive({
  jobname: "",
})
const columns = reactive([
  {
    label: "角色名称",
    prop: "jobname",
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
  jobname: [
    {
      required: true,
      message: "请输入岗位名称",
    },
  ],
})
const showPermission = ref(false)
const curRoleId = ref("")
const curjobname = ref("")
const menuList = ref([])
// 菜单映射表
const actionMap = ref({})
const dialogForm = ref();
const form = ref();
onMounted(() => {
  getJobList();
})
// 角色列表初始化
const getJobList = async () => {
  try {
    let { list, page } = await appContext.config.globalProperties.$api.getJobList({
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
  nextTick(()=>{
    Object.assign(roleForm, row);
  })
}
// 角色删除
const handleDel = async (jobid) => {
  await appContext.config.globalProperties.$api.jobOperate({ jobid, action: "delete" });
  ElMessage.success("删除成功");
  getJobList();
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
      let res = await appContext.config.globalProperties.$api.jobOperate(params);
      if (res) {
        showModal.value = false;
         ElMessage.success("创建成功");
        handleReset(dialogForm);
        getJobList();
      }
    }
  });
}
const handleCurrentChange = (current) => {
  pager.pageNum = current;
  getJobList();
}
</script>
<template>
  <div class="role-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="岗位名称" prop="jobname">
          <el-input v-model="queryForm.jobname" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getJobList">查询</el-button>
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
            <el-button type="danger" size="mini" @click="handleDel(scope.row.jobid)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total"
        :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>
    <el-dialog title="岗位新增" v-model="showModal">
      <el-form ref="dialogForm" :model="roleForm" label-width="100px" :rules="rules">
        <el-form-item label="岗位名称" prop="jobname">
          <el-input v-model="roleForm.jobname" placeholder="请输入岗位名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose(dialogForm)">取 消</el-button>
          <el-button type="primary" @click="handleSubmit(dialogForm)">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>


<style lang="scss">
</style>