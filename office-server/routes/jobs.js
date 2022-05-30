/**
 * 用户管理模块
 */
const router = require('koa-router')()
const util = require('../utils/util')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
router.prefix('/jobs')

// 查询所有角色列表
router.get('/allList', async (ctx) => {
  try {
    const res = await ctx.db.execute(
      `SELECT * FROM office_job`,
    )
    const list = util.merge2Json(res.metaData,res.rows);
    ctx.body = util.success(list);
  } catch (error) {
    ctx.body = util.fail(`查询失败:${error.stack}`)
  }
})

// 按页获取角色列表
router.get('/list', async (ctx) => {
  const { jobname } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query)
  try {
    let params = '';
    let values = [];
    if (jobname){
      params = 'jobname =:name ';
      values.push(jobname);
    };
    params.jobname = jobname;
    params.length > 0 ? params += ` AND rownum >= ${skipIndex} AND rownum <= ${skipIndex + page.pageSize - 1}`: params = `rownum >= ${skipIndex} AND rownum <= ${skipIndex + page.pageSize - 1}`;
    const res = await ctx.db.execute(
      `SELECT * FROM office_job WHERE ${params}`, 
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
  const { jobid, jobname, action } = ctx.request.body;
  let res, info;
  try {
    if (action == 'create') {
      res = await ctx.db.execute(
        `INSERT INTO office_job(jobid,jobname) VALUES (job_seq.nextval, :name)`,
        [jobname], {
            autoCommit: true
        });
      info = "创建成功"
    } else if (action == 'edit') {
      if (jobid) {
        res = await ctx.db.execute(
          `update office_job set jobname:=name WHERE jobid =:id`,
          [jobname,jobid], {
              autoCommit: true
          });
        info = "编辑成功"
      } else {
        ctx.body = util.fail("缺少参数params: jobid")
        return;
      }
    } else {
      if (jobid) {
        res = await ctx.db.execute(
          `DELETE FROM office_job WHERE BMID = :id`,
          [jobid], {
              autoCommit: true
          });
        info = "删除成功"
      } else {
        ctx.body = util.fail("缺少参数params: jobid")
        return;
      }
    }
    ctx.body = util.success(res, info)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})

module.exports = router;
