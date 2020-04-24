const express = require('express')
const mysqli = require('../db/comput')
const Result = require('../model/Result')
const router = express.Router()
router.get('/home', async (req, res) => {
    const sql = 'select * from v_Advertisement';
    const resulte = await mysqli(sql)
    if (resulte && resulte.length != 0) {
        console.log(resulte)
        new Result(resulte, '操作成功', {
            ret: true
        }).success(res)
    } else {
        new Result(resulte, '操作失败', {
            ret: false
        }).fail(res)
    }
})

router.get('/getSeach',async (req, res) => {
    console.log(req.query)
    const sql = `select id, commodity_img as imgUrl , commodity_name as title , commodity_per as price , commodity_State as commodityState from v_commodity_data where commodity_Name like ? or commodity_Class like ? or commodity_Presonality like ?`;
    const params = [req.query.key, req.query.key, req.query.key]
    const data = await mysqli(sql, params)
    new Result(data, 'success', {
        code: 200,
        ret: true
    }).success(res)
})

module.exports = router