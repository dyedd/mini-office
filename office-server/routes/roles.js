/**
 * 用户管理模块
 */
const router = require('koa-router')()
const util = require('../utils/util')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
router.prefix('/roles')

// 查询所有角色列表
router.get('/allList', async (ctx) => {
  try {
    const res = await ctx.db.execute(
      `SELECT * FROM office_role`,
    )
    const list = util.merge2Json(res.metaData,res.rows);
    ctx.body = util.success(list);
  } catch (error) {
    ctx.body = util.fail(`查询失败:${error.stack}`)
  }
})

// 按页获取角色列表
router.get('/list', async (ctx) => {
  const { rolename } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query)
  try {
    let params = '';
    let values = [];
    if (rolename){
      params = `INSTR(rolename, :name)>0 `;
      values.push(rolename);
    };
    params.length > 0 ? params += ` AND rownum >= ${skipIndex} AND rownum <= ${skipIndex + page.pageSize - 1}`: params = `rownum >= ${skipIndex} AND rownum <= ${skipIndex + page.pageSize - 1}`;
    const res = await ctx.db.execute(
      `SELECT * FROM office_role WHERE ${params}`, 
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

// 角色操作：创建、编辑和删除
router.post('/operate', async (ctx) => {
  const { roleid, rolename, action } = ctx.request.body;
  let res, info;
  try {
    if (action == 'create') {
      res = await ctx.db.execute(
        `INSERT INTO office_role(roleid,rolename) VALUES (role_seq.nextval, :name)`,
        [rolename], {
            autoCommit: true
        });
      info = "创建成功"
    } else if (action == 'edit') {
      if (roleid) {
        res = await ctx.db.execute(
          `update office_role set rolename=:0 WHERE roleid =:1`,
          [rolename,roleid], {
              autoCommit: true
          });
        info = "编辑成功"
      } else {
        ctx.body = util.fail("缺少参数params: roleid")
        return;
      }
    } else {
      if (roleid) {
        res = await ctx.db.execute(
          `DELETE FROM office_role WHERE roleid = :id`,
          [roleid], {
              autoCommit: true
          });
        info = "删除成功"
      } else {
        ctx.body = util.fail("缺少参数params: roleid")
        return;
      }
    }
    ctx.body = util.success(res, info)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})
// 权限设置
router.post('/update/permission', async (ctx) => {
  const { id, permissionList } = ctx.request.body;
  try {
    res = await ctx.db.execute(
      `update office_role set permission=:0 WHERE roleid =:1`,
      [permissionList,id], {
          autoCommit: true
      });
    ctx.body = util.success('', "权限设置成功")
  } catch (error) {
    ctx.body = util.fail("权限设置失败")
  }
})
module.exports = router;
