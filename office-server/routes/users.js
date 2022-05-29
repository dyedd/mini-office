/**
 * 用户管理模块
 */
const router = require('koa-router')()
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
const oracledb = require('oracledb');
router.prefix('/users')
// 用户登录
router.post('/login', async (ctx) => {
  try {
    const {
      userName,
      userPwd
    } = ctx.request.body;
    const res = await ctx.db.execute(
      `BEGIN
        login(:v_username, :v_password, :v_info);
      END;`, 
      {
        v_username: userName,
        v_password: md5(userPwd),
        v_info: {
          type: oracledb.CURSOR,
          dir: oracledb.BIND_OUT
        }
      }
    )
    const result = res.outBinds.v_info;
    const rows = await result.getRows();  
    const list = util.merge2Json(result.metaData,rows)[0];
    await result.close();
    if (list) {

      const data = list;

      const token = jwt.sign({
        userid:data.userid
      }, 'dyedd', {
        expiresIn: '1h'
      })
      data.token = token;
      ctx.body = util.success(data)
    } else {
      ctx.body = util.fail("账号或密码不正确")
    }
  } catch (error) {
    console.log(error);
    ctx.body = util.fail(error.msg)
  }
})

// 用户列表
router.get('/list', async (ctx) => {
  const { userId, userName, state } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query)
  let params = '';
  let values = [];
  if (userId){
    params = 'userid =:v_userId ';
    values.push(userId);
  };
  if (userName){
      params.length>0 ? params += 'AND uname =:v_userName ' : params = 'uname =:v_userName ';
      values.push(userName)
  }
  if (state && ['在职','离职','实习'].includes(state)){
    params.length > 0 ? params += 'AND ustate =:v_state ' : params = 'ustate =:v_state';
    values.push(state)
  }
  params.length > 0 ? params += ` AND rownum >= ${skipIndex} AND rownum <= ${skipIndex + page.pageSize - 1}`: params = `rownum >= ${skipIndex} AND rownum <= ${skipIndex + page.pageSize - 1}`;
  try {
    // 根据条件查询所有用户列表
    const res = await ctx.db.execute(
      `SELECT * FROM USER_VIEW WHERE ${params}`, 
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
    ctx.body = util.fail(`查询异常:${error.stack}`)
  }
})

// 获取全量用户列表
router.get('/all/list', async (ctx) => {
  try {
    const res = await ctx.db.execute(
      `SELECT * FROM USER_VIEW`,
    )
    const list = util.merge2Json(res.metaData,res.rows);
    ctx.body = util.success(list)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})

// 用户删除/批量删除
router.post('/delete', async (ctx) => {
  // 待删除的用户Id数组
  const { userIds } = ctx.request.body
  const condition = []
  for (const user of userIds) {
    condition.push(user)
  }
  const res = await ctx.db.execute(
    `update office_users set ustate=:ustate WHERE userid = ${condition.join(',')}`,
    ['离职'], 
    { autoCommit: true } // commit once for all DML in the script
  )
  
  if (res.rowsAffected) {
    ctx.body = util.success(res, `成功删除${res.rowsAffected}条`)
    return;
  }
  ctx.body = util.fail('删除失败');
})
// 用户新增/编辑
router.post('/operate', async (ctx) => {
  const { userId, userName, userEmail, mobile, sex, job, state, role, deptId, action } = ctx.request.body;
  if (action == 'add') {
    if (!userName || !userEmail) {
      ctx.body = util.fail('用户名或者邮箱为空', util.CODE.PARAM_ERROR)
      return;
    }
    const res = await ctx.db.execute(
      `SELECT * FROM USER_VIEW WHERE umail =:umail`, 
      [userEmail]
    )
    if (res.rows.length > 0) {
      ctx.body = util.fail(`系统监测到有重复的邮箱，信息如下：${userEmail}`)
    } else {
      try {
        const res = await ctx.db.execute(
          `INSERT INTO office_users(userid,uname,upwd,umail,umobile,usex,ustate,deptid,job,urole) VALUES (user_seq.nextval,:v_username, :v_password, :v_mail,:v_mobile, :v_usex,
               :v_ustate, :v_did, :v_job, :v_role)`, 
          [
            userName,
            md5('123456'),
            userEmail,
            mobile,
            sex,
            state,
            deptId,
            job,
            role
          ],
          { autoCommit: true}
        )
        console.log(res);
        ctx.body = util.success('', '用户创建成功');
      } catch (error) {
        ctx.body = util.fail(error.stack, '用户创建失败');
      }
    }
  } else {
    if (!deptId) {
      ctx.body = util.fail('部门不能为空', util.CODE.PARAM_ERROR)
      return;
    }
    try {
      const res = await ctx.db.execute(
        `update office_users set umobile=:umobile,ustate=:ustate,deptid=:deptid,job=:job,urole=:urole WHERE userid =:id`,
        [mobile,state,deptId,job,role,userId], 
        { autoCommit: true }
      )
      
      if (res.rowsAffected) {
        ctx.body = util.success({}, '更新成功')
        return;
      }
      
    } catch (error) {
      ctx.body = util.fail(error.stack, '更新失败')
    }
  }
})

module.exports = router