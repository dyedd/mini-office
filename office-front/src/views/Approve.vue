<template>
    <div class="user-manage">
        <div class="query-form">
            <el-form ref="form" :inline="true" :model="queryForm">
                <el-form-item label="审批状态" prop="lstate">
                    <el-select v-model="queryForm.lstate">
                        <el-option value="" label="全部"></el-option>
                        <el-option value="待审批"></el-option>
                        <el-option  value="拒绝"></el-option>
                        <el-option  value="同意"></el-option>
                        <el-option  value="作废"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getApplyList">查询</el-button>
                    <el-button @click="handleReset(form)">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-table">
            <div class="action"></div>
            <el-table :data="applyList">
                <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
                    :width="item.width" :formatter="item.formatter">
                </el-table-column>
                <el-table-column label="操作" width="150">
                    <template #default="scope">
                        <!-- <el-button size="mini" @click="handleDetail(scope.row)" v-if="
                             scope.row.curAuditUserName == userInfo.userName &&
                             [1, 2].includes(scope.row.applyState)
                             ">审核</el-button>  -->
                        <el-button size="mini" @click="handleDetail(scope.row)" v-if="scope.row.lstate=='待审批'">审核</el-button>
                        <el-button size="mini" @click="handleDetail(scope.row)" v-if="!(scope.row.lstate=='待审批')">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total"
                :page-size="pager.pageSize" @current-change="handleCurrentChange" />
        </div>
        <el-dialog title="审核" width="50%" v-model="showDetailModal" destroy-on-close>
            <el-form ref="dialogForm" :model="auditForm" label-width="120px" label-suffix=":" :rules="rules">
                <el-form-item label="申请人ID">
                    <div>{{ detail.applicant }}</div>
                </el-form-item>
                <el-form-item label="休假类型">
                    <div>{{ detail.leavetype }}</div>
                </el-form-item>
                <el-form-item label="休假时间">
                    <div>{{detail.time}}</div>
                </el-form-item>
                <el-form-item label="休假时长">
                    <div>{{ detail.total }} 天</div>
                </el-form-item>
                <el-form-item label="休假原因">
                    <div>{{ detail.reason }}</div>
                </el-form-item>
                <el-form-item label="审批状态">
                    <div>{{ detail.lstate }}</div>
                </el-form-item>
                <el-form-item label="审批人">
                    <div>{{ detail.approver }}</div>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input :disabled="!(detail.lstate=='待审批')" type="textarea" :rows="3" placeholder="请输入审核备注" v-model="auditForm.remark" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <template v-if="detail.lstate == '待审批'">
                    <el-button @click="handleApprove('accept')">审核通过</el-button>
                    <el-button @click="handleApprove('refuse')" type="primary">驳回</el-button>
                    <el-button @click="handleApprove('delete')" type="primary">作废</el-button>
                    </template>
                    <el-button @click="handleClose()">取消</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<script setup>
import { ElMessage } from "element-plus";
import { getCurrentInstance, onMounted, reactive, ref, toRaw } from "vue";
import api from "../api/index";
import store from "../store/index"
import utils from "../utils/utils";
//   获取Composition API 上下文对象
const { ctx } = getCurrentInstance();
const queryForm = reactive({
    lstate: "",
});
const pager = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
});
// 定义动态表格-格式
const columns = reactive([
    {
        label: "单号",
        prop: "leaveid",
    },
    {
        label: "申请人ID",
        prop: "",
        formatter(row) {
            return row.applicant;
        },
    },
    {
        label: "休假时间",
        prop: "",
        formatter(row) {
            return (
                utils.formateDate(new Date(row.lstart), "yyyy-MM-dd") +
                "到" +
                utils.formateDate(new Date(row.lend), "yyyy-MM-dd")
            );
        },
    },
    {
        label: "休假时长",
        prop: "total",
    },
    {
        label: "休假类型",
        prop: "leavetype",
    },
    {
        label: "休假原因",
        prop: "reason",
    },
    {
        label: "申请时间",
        prop: "created_time",
        width: 180,
        formatter: (row, column, value) => {
            return utils.formateDate(new Date(value));
        },
    },
    {
        label: "审批人ID",
        prop: "approver",
        formatter: (row, column, value) => {
            return value || '-';
        }

    },
    {
        label: "审批状态",
        prop: "lstate",
    },
]);
// 申请列表
const applyList = ref([]);
// 创建休假弹框表单
//const leaveForm = reactive({
//    applyType: 1,
//    startTime: "",
//  
//    leaveTime: "0天",
//    reasons: "",
//});

const showDetailModal = ref(false);
// 详情弹框对象
let detail = ref({});

// ref for two forms
const form = ref({});
const dialogForm = ref({});

// 表单规则
const rules = {
    remark: [
        {
            required: true,
            message: "请输入审核备注",
            trigger: "change",
        },
    ],
};
const auditForm = reactive({
    remark: "",
});
// 初始化接口调用
onMounted(() => {
    getApplyList();
});

// 加载申请列表
const getApplyList = async () => {
    let params = { ...queryForm, ...pager, type: "approve" };
    let { list, page } = await api.getApplyList(params);
    applyList.value = list;
    pager.total = page.total;
};
// 重置查询表单
const handleReset = (form) => {
    form.resetFields();
};

// 分页事件处理
const handleCurrentChange = (current) => {
    pager.pageNum = current;
    getUserList();
};
// 弹框关闭
const handleClose = () => {
    showDetailModal.value = false;
    handleReset(dialogForm.value);
};

const handleDetail = (row) => {
    let data = { ...row };
    data.time =
        utils.formateDate(new Date(data.lstart), "yyyy-MM-dd") +
        "到" +
        utils.formateDate(new Date(data.lend), "yyyy-MM-dd");
    data.approver = store.state.userInfo.uname;
    detail.value = data;
    auditForm.remark = data.remark;
    showDetailModal.value = true;
    
};

const handleApprove = (action) => {
    dialogForm.value.validate(async (valid) => {
        if (valid) {
            let params = {
                action,
                remark: auditForm.remark,
                leaveid: detail.value.leaveid,
                approver: store.state.userInfo.userid,
            };
            try {
                await api.leaveApprove(params);
                handleClose();
                ElMessage.success("处理成功");
                getApplyList();
                store.commit(
                    "saveNoticeCount",
                    store.state.noticeCount - 1,
                );
            } catch (error) {ElMessage.error(`操作失败: ${error}`); }
        }
    });
};

</script>
