/**
 * 用户管理模块
 */
const router = require('koa-router')()
const util = require('../utils/util')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
router.prefix('/leave')

// 查询申请列表
router.get('/list', async (ctx) => {
  const { leavetype,lstate } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query)
  try {
    let params = '';
    let values = [];
    if (leavetype){
      params = 'leavetype =:type ';
      values.push(leavetype);
    };
    if (leavetype){
      params.length>0 ? params += 'AND lstate =:state ' : params = 'lstate =:state ';
      values.push(lstate);
    };
    params.length > 0 ? params += ` AND rownum >= ${skipIndex} AND rownum <= ${skipIndex + page.pageSize - 1}`: params = `rownum >= ${skipIndex} AND rownum <= ${skipIndex + page.pageSize - 1}`;
    const res = await ctx.db.execute(
      `SELECT * FROM office_leave WHERE ${params}`, 
      values,
      {
        maxRows: page.pageSize,
      }
    )

    const list = util.merge2Json(res.metaData,res.rows);
    ctx.body = util.success({
      page: {
        ...page,
        total: list.length
      },
      list
    })
  } catch (error) {
    ctx.body = util.fail(`查询失败：${error.stack}`)
  }
})

router.get("/count", async (ctx) => {
  try {
    const res = await ctx.db.execute(
      `SELECT * FROM office_leave WHERE ${params}`, 
      values,
      {
        maxRows: page.pageSize,
      }
    )
    ctx.body = util.success(total)
  } catch (error) {
    ctx.body = util.fail(`查询异常：${error.message}`)
  }
})

router.post("/operate", async (ctx) => {
  const { _id, action, ...params } = ctx.request.body
  let authorization = ctx.request.headers.authorization;
  let { data } = util.decoded(authorization)

  if (action == 'create') {
    // 生成申请单号
    let orderNo = "XJ"
    orderNo += util.formateDate(new Date(), "yyyyMMdd");
    const total = await Leave.countDocuments()
    params.orderNo = orderNo + total;

    // 获取用户当前部门ID
    let id = data.deptId.pop()
    // 查找负责人信息
    let dept = await Dept.findById(id)
    // 获取人事部门和财务部门负责人信息
    let userList = await Dept.find({ deptName: { $in: ['人事部门', '财务部门'] } })

    let auditUsers = dept.userName;
    let auditFlows = [
      { userId: dept.userId, userName: dept.userName, userEmail: dept.userEmail }
    ]
    userList.map(item => {
      auditFlows.push({
        userId: item.userId, userName: item.userName, userEmail: item.userEmail
      })
      auditUsers += ',' + item.userName;
    })

    params.auditUsers = auditUsers;
    params.curAuditUserName = dept.userName;
    params.auditFlows = auditFlows;
    params.auditLogs = []
    params.applyUser = {
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail
    }

    let res = await Leave.create(params)
    ctx.body = util.success("", "创建成功")
  } else {
    let res = await Leave.findByIdAndUpdate(_id, { applyState: 5 })
    ctx.body = util.success('', "操作成功")
  }

})

router.post("/approve", async (ctx) => {
  const { action, remark, _id } = ctx.request.body;
  let authorization = ctx.request.headers.authorization;
  let { data } = util.decoded(authorization);
  let params = {}
  try {
    // 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
    let doc = await Leave.findById(_id)
    let auditLogs = doc.auditLogs || [];
    if (action == "refuse") {
      params.applyState = 3;
    } else {
      // 审核通过
      if (doc.auditFlows.length == doc.auditLogs.length) {
        ctx.body = util.success('当前申请单已处理，请勿重复提交')
        return;
      } else if (doc.auditFlows.length == doc.auditLogs.length + 1) {
        params.applyState = 4;
      } else if (doc.auditFlows.length > doc.auditLogs.length) {
        params.applyState = 2;
        params.curAuditUserName = doc.auditFlows[doc.auditLogs.length + 1].userName;
      }
    }
    auditLogs.push({
      userId: data.userId,
      userName: data.userName,
      createTime: new Date(),
      remark,
      action: action == 'refuse' ? "审核拒绝" : "审核通过"
    })
    params.auditLogs = auditLogs;
    let res = await Leave.findByIdAndUpdate(_id, params);
    ctx.body = util.success("", "处理成功");
  } catch (error) {
    ctx.body = util.fail(`查询异常：${error.message}`)
  }
})

module.exports = router;
