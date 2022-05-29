/**
 * 数据库连接
 */
const oracledb = require('oracledb');
const config = require('./index');
const log4js = require('./../utils/log4j');
const mypw = 'office123';

const run = async (ctx,next)=>{
    try {
        ctx.db = await oracledb.getConnection({
            user: "office",
            password: mypw,
            connectString: config.URL
        });
        await next();

    } catch (err) {
        console.error('err',err);
        log4js.error(err);
    } finally {
        if (ctx.db) {
            try {
                await ctx.db.close();
            } catch (err) {
                console.error(err);
                log4js.error(err);
            }
        }
    }
}
module.exports = run;