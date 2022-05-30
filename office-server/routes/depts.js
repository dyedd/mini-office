const router = require('koa-router')()
const util = require('./../utils/util')
router.prefix('/dept')

// 部门树形列表
router.get('/list', async (ctx) => {
    let {
        deptname
    } = ctx.request.query;
    let result;
    if (deptname) {
        result = await ctx.db.execute(
            `SELECT * FROM office_bm where bmm = :name`,
            [deptname]);
    } else {
        result = await ctx.db.execute(
            `SELECT * FROM office_bm`
        );
    }

    const rootList = util.merge2Json(result.metaData, result.rows);
    console.log(rootList);
    if (deptname) {
        ctx.body = util.success(rootList);
    } else {
        let tressList = getTreeDept(rootList, null, [])
        ctx.body = util.success(tressList)
    }
})


// 递归拼接树形列表
function getTreeDept(rootList, id, list) {
    for (let i = 0; i < rootList.length; i++) {
        let item = rootList[i]
        if (item.parent == id) {
            list.push(item)
        }
    }
    list.map(item => {
        item.children = []
        getTreeDept(rootList, item.bmid, item.children)
        if (item.children.length == 0) {
            delete item.children;
        }
    })
    return list;
}

// 部门操作：创建、编辑、删除
router.post('/operate', async (ctx) => {
    const {
        action,
        params
    } = ctx.request.body;
    let info;
    try {
        if (action == 'create') {
            console.log(params);
            await ctx.db.execute(
                `INSERT INTO office_bm(bmid,bmm,bmr,parent) VALUES (bm_seq.nextval, :bmm, :bmr, :parent)`,
                [params.bmm, params.bmr, params.parent], {
                    autoCommit: true
                });
            info = "创建成功"
        } else if (action == 'edit') {
            await ctx.db.execute(
                `update office_bm set bmm=:bmm,bmr=:bmr,parent=:parent WHERE bmid =:id`,
                [params.bmm, params.bmr, params.parent, params.bmid], {
                    autoCommit: true
                });
            info = "编辑成功"
        } else if (action == 'delete') {
            await ctx.db.execute(
                `DELETE FROM office_bm WHERE BMID = :id`,
                [params.bmid], {
                    autoCommit: true
                });
            info = "删除成功"
        }
        ctx.body = util.success('', info)
    } catch (error) {
        ctx.body = util.fail(error.stack)
    }
})


module.exports = router;