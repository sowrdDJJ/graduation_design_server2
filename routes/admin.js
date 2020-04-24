const express = require('express')
const mysqli = require('../db/index')
const router = express.Router()

router.post('/postAdLogin', (req,res) => {
    console.log(req.body)
    const sql = 'select id from t_Adminstrantion where ad_telephone = ? and ad_password = ?'
    mysqli.exec({
      sql:sql,
      params: [req.body.account, req.body.password],
      success: resulte => {
        console.log(resulte)
        if (resulte.length !== 0) {
            res.json({
                code: 202,
                data: resulte[0].id
            })
        } else {
            res.json({
                code: 204,
                data: 'undefind'
              })
        }
      }
    })
})
router.get('/getAdInformation', (req, res) => {
    console.log(req.query)
    const sql = 'select ad_name as user_Name, ad_sex as user_Sex, ad_telephone as user_Telephone, ad_age as user_Age, ad_address as user_Address, ad_email  as user_email, ad_headerImg as user_Img from v_adminstrantion where id = ?';
    mysqli.exec({
        sql: sql,
        params: [req.query.id],
        success: resulte => {
            if (resulte) {
                res.json({
                    code: 202,
                    data: resulte
                })
            } else {
                res.json({
                    code: 204,
                    data: 'undefind'
                })
            }
        }
    })
})
router.post('/postAdInformaton', (req, res) => {
    console.log(req.body)
  const sql = 'update t_adminstrantion set ad_name = ?, ad_sex = ?, ad_telephone = ?, ad_age = ?, ad_address = ?, ad_email = ?, ad_headerImg = ? where id = ?'
  mysqli.exec({
      sql: sql,
      params:[req.body.data.user_Name,
              req.body.data.user_Sex,
              req.body.data.user_Telephone,
              req.body.data.user_Age,
              req.body.data.user_Address,
              req.body.data.user_email,
              req.body.data.user_Img,
              req.body.userId],
      success: resulte => {
          res.json({
             code: 202
          })
      },
      error: err => {
          console.log(err)
      }
  })
})
router.get('/getAdCommodityPage', (req, res) => {
  console.log(req.query)
  const sql =  req.query.action === 'total' || req.query.key === '%undefined%' ? 'select max(id) as max from v_commodity_data' : 'select count(*) as max from v_commodity_data where commodity_Name like ? or commodity_Class like ?' 
  mysqli.exec({
    sql: sql,
    params: req.query.action === 'total' || req.query.key === '%undefined%' ? null : [req.query.key, req.query.key],
    success: resulte => {
      let pageArray = [];
      let pageNum = 1 
      if (req.query.action !== 'total' || req.query.key != '%undefined%') {
        console.log(1)
        for(let i = 1; i <= resulte[0].max; i+=8) {
            pageArray.push(pageNum)
            pageNum+=1
        }   
      } else {
        for(let i = 16; i <= resulte[0].max; i+=8) {
            pageArray.push(pageNum)
            pageNum+=1
        }          
      }
       res.json({
           code: 202,
           data: pageArray
       })
    },
    error: err => {
        if(err) {
          console.log(err)
        }
    }
  })
})
router.get('/getAdCommodityData', (req, res) => {
  const sql =  req.query.action === 'seach' || req.query.key ? 'select id, commodity_Name, commodity_Number, commodity_Per, commodity_State from v_commodity_data where commodity_Name like ? or commodity_Class like ?' : 'select id, commodity_Name, commodity_Number, commodity_Per, commodity_State from v_commodity_data where id >= ? and id < ?';
  const getNumTwo =   req.query.jumpNumber * 8 + 10 || 0;
  const getNumOne = getNumTwo - 8;
  const params = req.query.action === 'seach'|| req.query.key ? [req.query.key, req.query.key] : [getNumOne, getNumTwo]
  mysqli.exec({
    sql: sql,
    params: params,
    success: resulte => {
        resulte = resulte.map(e => {
          e.commodity_State = JSON.parse(e.commodity_State)
          return e
        })
        if (resulte) {
          if (req.query.action === 'seach' || req.query.key ) {
            const getNumTwoSeach =   req.query.jumpNumber * 8 ;
            const getNumOneSeach = getNumTwoSeach - 8;
            resulte = resulte.filter((e,i) => {
              if (getNumTwoSeach > i && i  >= getNumOneSeach) {
                  return e
              }
            })

          }
          res.json({
              code: 202,
              data: resulte
          })
        } else {
          res.json({
              code: 204,
              data: resulte
          })
        }
    },
    error: err => {
        if (err) {
          console.log(err)
        }
    }
  })    
})
router.post('/postAdCommodityData', (req,res) => {
  console.log(req.body)
  const sql = req.body.action === 'commodityData' ? 'update commodity_data set commodity_Per = ? , commodity_Number = ? where id = ?' : 'update commodity_data set commodity_State = ? where id = ?';
  const params = req.body.action === 'commodityData' ? [req.body.per, req.body.stock, req.body.id] : [JSON.stringify(req.body.state), req.body.id]
  console.log(params, sql)
  mysqli.exec({
    sql:sql,
    params: params,
    success: resulte => {
        res.json({
          code: 202
        })
    },
    error: err => {
        if (err) {
            console.log(err)
        }
    }
  })
})
router.get('/getDataAnalysis', (req, res) => {
    let sql = ''
    if (req.query.action == 'total') {
      sql = 'select  *  from  v_tatolTurnover '
    } else if (req.query.action == 'turnover') {
        sql = 'select * from v_turnover where id = 2'
    } else {
        sql = 'select user_implementation  from t_user_data'
    }
    mysqli.exec({
        sql: sql,
        success: resulte => {
            if(resulte.length != 0) {
                res.json({
                    code: 202,
                    data: resulte
                })
            } else {
                res.json({
                    code: 204,
                    data: 'undefind'
                })
            }
        },
        error: err => {
            if (err) {
                console.log(err)
            }
        }
    })
})

module.exports = router