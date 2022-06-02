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
  const {
    leavetype,
    lstate
  } = ctx.request.query;
  const {
    page,
    skipIndex
  } = util.pager(ctx.request.query)
  try {
    let params = '';
    let values = [];
    if (leavetype) {
      params = 'leavetype =:type ';
      values.push(leavetype);
    };
    if (lstate) {
      params.length > 0 ? params += 'AND lstate =:state ' : params = 'lstate =:state ';
      values.push(lstate);
    };
    params.length > 0 ? params += ` AND rownum >= ${skipIndex} AND rownum <= ${skipIndex + page.pageSize - 1}` : params = `rownum >= ${skipIndex} AND rownum <= ${skipIndex + page.pageSize - 1}`;
    const res = await ctx.db.execute(
      `SELECT * FROM office_leave WHERE ${params}`,
      values, {
        maxRows: page.pageSize,
      }
    )

    const list = util.merge2Json(res.metaData, res.rows);
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
      `SELECT count(*) FROM office_leave`,
    )
    ctx.body = util.success(res.rows[0][0])
  } catch (error) {
    ctx.body = util.fail(`查询异常：${error.message}`)
  }
})

router.post("/operate", async (ctx) => {
  const {
    leaveid,
    action,
    params,
  } = ctx.request.body
  params.lstart = new Date(params.lstart);
  params.lend = new Date(params.lend);
  let authorization = ctx.request.headers.authorization;
  let {
    userid
  } = util.decoded(authorization)
  if (action == 'create') {
    let orderNo = "X"
    orderNo += util.formateDate(new Date(), "yyyyMMdd");
    const number = await ctx.db.execute(
      `SELECT count(*) FROM office_leave`,
    )
    orderNo += number.rows[0][0];
    const res = await ctx.db.execute(
      `INSERT INTO office_leave(leaveid,leavetype,lstart,lend,reason,lstate,applicant,approver) 
      VALUES (:0,:1,:2,:3,:4,:5,:6,:7)`,
      [
        orderNo,
        params.leavetype,
        params.lstart,
        params.lend,
        params.reason,
        '待审批',
        userid,
        params.approver
      ], {
        autoCommit: true
      }
    )
    if (res.rowsAffected > 0) {
      ctx.body = util.success('', '创建成功');
    }
  } else {
    await ctx.db.execute(
      `update office_leave set leavetype=:0,lstart=:1,lend-:2,reason=:3,lstate=:4,approver=:5 WHERE leaveid =:6`,
      [params.leavetype,
        params.lstart,
        params.lend,
        params.reason,
        params.lstate,
        params.approver,
        leaveid
      ], {
        autoCommit: true
      });
    ctx.body = util.success('', "操作成功")
  }

})

router.post("/approve", async (ctx) => {
  const {
    action,
    leaveid,
    remark,
    approver,
  } = ctx.request.body;
  let lstate = '';
  try {
    if (action == "refuse") {
      lstate = '拒绝';
    } else if (action == "accept") {
      lstate = '同意';
    } else if (action == "delete") {
      lstate = '作废';
    }
    await ctx.db.execute(
      `update office_leave set lstate=:0,remark = :1,approver = :2 WHERE leaveid =:3`,
      [
        lstate,
        remark,
        approver,
        leaveid
      ], {
        autoCommit: true
      });
    ctx.body = util.success("", "处理成功");
  } catch (error) {
    ctx.body = util.fail(`查询异常：${error.message}`)
  }
})

module.exports = router;
