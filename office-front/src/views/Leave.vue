<template>
    <div class="user-manage">
        <div class="query-form">
            <el-form ref="queryFormRef" :inline="true" :model="queryForm">
                <el-form-item label="审批状态" prop="lstate">
                    <el-select v-model="queryForm.lstate">
                        <el-option value="" label="全部"></el-option>
                        <el-option value="待审批" label="待审批"></el-option>
                        <el-option value="审批中" label="审批中"></el-option>
                        <el-option value="审批拒绝" label="审批拒绝"></el-option>
                        <el-option value="审批通过" label="审批通过"></el-option>
                        <el-option value="作废" label="作废"></el-option>
                    </el-select>
                </el-form-item
>
                <el-form-item>
                    <el-button type="primary" @click="getApplyList">查询</el-button>
                    <el-button @click="handleReset(queryFormRef)">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-table">
            <div class="action">
                <el-button type="primary" @click="handleApply">申请休假</el-button>
            </div>
            <el-table :data="applyList">
                <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
                    :width="item.width" :formatter="item.formatter">
                </el-table-column>
                <el-table-column label="操作" width="150">
                    <template #default="scope">
                        <el-button size="mini" @click="handleDetail(scope.row)">查看</el-button>
                        <el-button type="danger" size="mini" @click="handleDelete(scope.row._id)"
                            v-if="[1, 2].includes(scope.row.lstate)">作废</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total"
                :page-size="pager.pageSize" @current-change="handleCurrentChange" />
        </div>
        <el-dialog title="申请休假" v-model="showModal" width="70%">
            <el-form ref="dialogForm" :model="leaveForm" label-width="120px" :rules="rules">
                <el-form-item label="休假类型" prop="leavetype" required>
                    <el-select v-model="leaveForm.leavetype">
                        <el-option label="事假" value="事假"></el-option>
                        <el-option label="调休" value="年假"></el-option>
                        <el-option label="年假" value="调休"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="休假时间" required>
                    <el-row>
                        <el-col :span="8">
                            <el-form-item prop="lstart" required>
                                <el-date-picker v-model="leaveForm.lstart" type="date" placeholder="选择开始日期"
                                    @change="(val) => handleDateChange('lstart', val)" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="1">-</el-col>
                        <el-col :span="8">
                            <el-form-item prop="lend" required>
                                <el-date-picker v-model="leaveForm.lend" type="date" placeholder="选择结束日期"
                                    @change="(val) => handleDateChange('lend', val)" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="休假时长" required>
                    {{ leaveForm.total }} 天
                </el-form-item>
                <el-form-item label="休假原因" prop="reason" required>
                    <el-input type="textarea" :row="3" placeholder="请输入休假原因" v-model="leaveForm.reason" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleClose">取 消</el-button>
                    <el-button type="primary" @click="handleSubmit">确 定</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog title="申请休假详情" width="50%" v-model="showDetailModal" destroy-on-close>
            <el-steps :active="detail.lstate > 2 ? 3 : detail.lstate" align-center>
                <el-step title="待审批"></el-step>
                <el-step title="审批中"></el-step>
                <el-step title="审批通过/审批拒绝"></el-step>
            </el-steps>
            <el-form label-width="120px" label-suffix=":">
                <el-form-item label="休假类型">
                    <div>{{ detail.leavetype }}</div>
                </el-form-item>
                <el-form-item label="休假时间">
                    <div>{{ detail.time }}</div>
                </el-form-item>
                <el-form-item label="休假时长">
                    <div>{{ detail.total }}天</div>
                </el-form-item>
                <el-form-item label="休假原因">
                    <div>{{ detail.reason }}</div>
                </el-form-item>
                <el-form-item label="审批状态">
                    <div>{{ detail.lstate}}</div>
                </el-form-item>
                <el-form-item label="审批人">
                    <div>{{ detail.approver }}</div>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>
<script setup>
import { ElMessage } from "element-plus";
import { getCurrentInstance, onMounted, reactive, ref, toRaw } from "vue";
import api from "../api/index";
import utils from "../utils/utils";
import { useStore } from 'vuex'
const store = useStore()
const queryForm = reactive({
    lstate: "待审批",
});
const pager = reactive({
    pageNum: 1,
    pageSize: 99,
    total: 0,
});
// 定义动态表格-格式
const columns = reactive([
    {
        label: "单号",
        prop: "leaveid",
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
        label: "审批人",
        prop: "approver",
    },
    {
        label: "当前审批人",
        prop: "approver",
    },
    {
        label: "审批状态",
        prop: "lstate",
    },
]);
// 申请列表
const applyList = ref([]);
// 创建休假弹框表单
const leaveForm = reactive({
    leavetype: "事假",
    lstart: "",
    lend: "",
    total: 0,
    reason: "",
});
const queryFormRef = ref();
const dialogForm = ref();
//create:创建 delete:作废
const action = ref("create");
const showModal = ref(false);
const showDetailModal = ref(false);
let detail = ref({});
// 表单规则
const rules = {
    lstart: [
        {
            type: "date",
            required: true,
            message: "请输入开始日期",
            trigger: "change",
        },
    ],
    lend: [
        {
            type: "date",
            required: true,
            message: "请输入结束日期",
            trigger: "change",
        },
    ],
    reason: [
        {
            required: true,
            message: "请输入休假原因",
            trigger: ["change", "blur"],
        },
    ],
};
// 初始化接口调用
onMounted(() => {
    getApplyList();
});

// 加载申请列表
const getApplyList = async () => {
    let params = { ...queryForm, ...pager, action:'create',userid: store.state.userInfo.userid};
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

// 点击申请休假-展示弹框
const handleApply = () => {
    showModal.value = true;
    action.value = "create";
};
// 弹框关闭
const handleClose = () => {
    showModal.value = false;
    handleReset(dialogForm.value);
};
// 获取休假时长
const handleDateChange = (key, val) => {
    let { lstart, lend } = leaveForm;
    if (!lstart || !lend) return;
    if (lstart > lend) {
        ElMessage.success("开始日期不能晚于结束日期");
        leaveForm.total = 0;
        setTimeout(() => {
            leaveForm[key] = "";
        }, 0);
    } else {
        leaveForm.total =
            (lend - lstart) / (24 * 60 * 60 * 1000) + 1 + "";
    }
};
// 申请提交
const handleSubmit = () => {
    dialogForm.value.validate(async (valid) => {
        if (valid) {
            try {
                leaveForm.lstart = utils.formateDate(new Date(leaveForm.lstart), "yyyy/MM/dd")
                leaveForm.lend = utils.formateDate(new Date(leaveForm.lend), "yyyy/MM/dd")
                let params = { params: leaveForm, action: action.value };
                let res = await api.leaveOperate(params);
                ElMessage.success("创建成功");
                handleClose();
                getApplyList();
            } catch (error) {
                ElMessage.error("失败: ", error);
            }
        }
    });
};

const handleDetail = (row) => {
    let data = { ...row };
    data.time =
        utils.formateDate(new Date(data.lstart), "yyyy-MM-dd") +
        "到" +
        utils.formateDate(new Date(data.lend), "yyyy-MM-dd");
    // 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
    detail.value = data;
    showDetailModal.value = true;
};

const handleDelete = async (_id) => {
    try {
        let params = { _id, action: "delete" };
        let res = await api.leaveOperate(params);
        ElMessage.success("删除成功");
        getApplyList();
    } catch (error) { }
};

</script>
