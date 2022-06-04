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
    lstate,
    action,
    userid
  } = ctx.request.query;
  const {
    page,
    skipIndex
  } = util.pager(ctx.request.query);
  try {
    if(!userid){
      ctx.body = util.fail('请传入userid参数');
      return;
    }
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
    if(action == 'create'){
      params.length > 0 ? params += 'AND applicant =:applicant ' : params = 'applicant =:applicant ';
    }else if(action == 'accept'){
      params.length > 0 ? params += 'AND approver =:approver ' : params = 'approver =:approver ';
    }else{
      ctx.body = util.fail('请传入action参数');
      return;
    }
    values.push(userid);
    params.length > 0 ? params += ` AND ` : params = ``;
    const res = await ctx.db.execute(
      `SELECT * FROM office_leave WHERE  ${params} 
      rownum >= ${skipIndex} AND rownum <= ${skipIndex + page.pageSize - 1}`,
      values,
      {
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
  let authorization = ctx.request.headers.authorization;
  let {
    userid
  } = util.decoded(authorization)
  try {
    const res = await ctx.db.execute(
      `SELECT count(*) FROM office_leave WHERE approver =:approver and lstate='待审批'`,
      [userid]
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
      VALUES (:0,:1,to_date(:2, 'yyyy/MM/dd'),to_date(:3, 'yyyy/MM/dd'),:4,:5,:6,:7)`,
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

router.get("/who", async (ctx) => {
  const {
    bmid
  } = ctx.request.query;
  try {
    const res = await ctx.db.execute(
      `select * from office_users u left join office_role r on u.urole = r.roleid 
      where r.permission like '%leave%' 
      OR u.userid = (select bmr from office_bm where bmid = :0)`,
      [bmid]
    )
    let list = [];
    for (const row of res.rows) {
      list.push(util.merge2Json(res.metaData,[row]));
    }
    
    ctx.body = util.success(list)
  } catch (error) {
    ctx.body = util.fail(`查询异常：${error.message}`)
  }
})
module.exports = router;
