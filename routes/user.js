const express = require('express');
const mysql = require('../db/comput');
const mysqli = require('../db/index');
const { md5, decoded, aesEncryption, aesDecryption} = require('../utils/index');
const { JWT_EXPIRED, PWD_SALT, PRIVATE_KEY, md5Key } = require('../utils/constant');
const fs = require('fs');
const path = require('path');
const boom = require('boom');
const static = require('../staticDataPool');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Result = require('../model/Result');
const area = require('../public/area');
const router = express.Router();
let {USER_FRIENDLIST} = require('../utils/constant')

router.get('/drt', (req, res) => {
    res.cookie('token', 111, { Path: '/' , maxAge: 60 * 60 * 24, httpOnly: true })
    res.send('设置Cookie')
})
router.post('/postUserInformation', async (req, res) => {
    console.log(req.body);
    const userRegisterData = req.body.data
    let request = '',
        actionState = true,  //注册动作是否合格状态
        //判断是登录还是注册
        //如果是注册则从数据池中对比注册的电话号码是否已存在
        params = [userRegisterData.name, md5(userRegisterData.telephone), md5(`${userRegisterData.password}${md5Key}`), md5(`${userRegisterData.passwordPer}${md5Key}`)],
        sql = `insert into t_user_data(user_id,user_name,user_sex,user_age,user_address,user_telephone,user_password,user_perpassword,user_img,user_FriendList) values (null,?,'男',0,'北京市 北京市 朝阳区',?,?,?,'userHeader/defalut.jpg',0)`;
        static.interface_replace_Data_User.forEach(element => {
            if (userRegisterData.telephone == element.user_telephone) {
                return actionState = false;
            } else {
                static.interface_replace_Data_User.push(userRegisterData.telephone)
            }
        })
    if (actionState) {
        let resiter_id = 0
        const resulte = await mysql(sql, params)
        if (resulte && resulte.length != 0) {
            resiter_id = resulte.insertId
            data = 'success';
            new Result(data, 'success', {
                ret: true,
                code: 200
            }).success(res)
            const staticFile = '{"userId": []}'
            existsSync = () => {
                console.log('创建')
                const exists = fs.existsSync(path.join(__dirname, '..', 'public', resiter_id + '.json'));
                if (!exists) {
                    const Establish = fs.writeFile(path.join(__dirname, '..', 'public', resiter_id + '.json'), staticFile, (err) => {
                        if (err) {
                            console.log(err)
                        }
                    })
                }
            }
            existsSync();
        }
    } else {
        request = 'fail';
        new Result(null, 'fail', {
            code: 204,
            ret: false
        }).fail(res)
    }
})
router.get('/getverificationToken', (req, res) => {
  const decode = decoded(req)
  const data = ''
  if (decode) {
    new Result(data, 'success').success(res)
  } else {
    new Result('fail').fail(res)
  }
})
router.post('/getUserInformation', 
[
  body('account').isNumeric().withMessage('账号必须为数字'),
  body('password').isString().withMessage('密码必须为字符')
],
async (req, res, next) => {
    console.log(req.body.account);
    const err = validationResult(req)
    if (!err.isEmpty()) {
      const [{msg}] = err.errors
      next(boom.badRequest(msg))
    } else {
        const { account, password } = req.body
        let sql = 'select user_Id from t_user_data where user_telephone = ? and user_password = ?';
        let params = [account, password]
        const resulte = await mysql(sql, params)
        if (resulte && resulte.length != 0) {
            sql = 'update t_user_data set user_implementation = now() where user_id = ?',
            params = [resulte[0].user_Id]
            mysql(sql, params)
            const currUserId = JSON.stringify(resulte[0].user_Id)
            const token = jwt.sign(
              {currUserId},
              PRIVATE_KEY,
              {expiresIn: JWT_EXPIRED}
            )
            console.log(token)
            res.cookie('token', token, { Path: '/' ,  domain: '47.102.215.151',maxAge: 60 * 60 * 24, httpOnly: true })
            new Result({token}, '登录成功',{
              ret: true
            }).success(res)
        } else {
            new Result('','登录失败',{
                ret: false,
                code: 200
            }).fail(res)
        }
    }
})
router.get('/getUserInformation', async (req, res, next) => {
  const sql = 'select user_Id,user_Name,user_Sex,user_Age,user_Address,user_Telephone,user_Img,role from t_user_data where user_Id = ?'
  const decode = decoded(req)
  if (decode && decode.currUserId) {
    const params = [decode.currUserId]
    const resulte = await mysql(sql, params)
    if (resulte && resulte.length != 0) {
        resulte[0].roles = [ resulte[0].role ]
        new Result(resulte, 'success', {
            ret: true,
            code: 200
        }).success(res)
    } else {
        new Result(resulte, 'fail', {
        ret: false,
        code: 200
        }).fail(res)  
    }
  } else {
    new Result('jwtInvalid').fail(res) 
  }
})
router.post('/postChangePirvateInformation',  async(req, res) => {
    const decode = decoded(req)
    const sql = 'update t_user_data set user_Name = ? , user_Sex = ?, user_Age = ?, user_Address = ?, user_Telephone = ?, user_img = ? where user_Id = ?';
    const params = [req.body.user_Name, req.body.user_Sex, req.body.user_Age, req.body.user_Address, req.body.user_Telephone, `userHeader/` + decode.currUserId + `.jpg`, decode.currUserId]
    if (decode && decode.currUserId) {
        if (req.body.user_Img.indexOf('base64') !== -1) {
            const base64 = req.body.user_Img.replace(/^data:image\/\w+;base64,/, ""); //去掉图片base64码前面部分data:image/png;base64
            const dataBuffer =  Buffer.from(base64, 'base64'); //把base64码转成buffer对象
            fs.writeFile(path.join(__dirname, '../','public', 'userHeader', decode.currUserId+'.jpg'), dataBuffer, function (err) {//用fs写入文件
                if (err) {
                    console.log(err);
                } else {
                    console.log('写入成功！');
                }
            });
        } 
        const resulte = await mysql(sql, params)
        if (resulte && resulte.length != 0) {
            const data = {
                "user_Img": req.body.user_Img,
                "user_Id": req.body.user_Id,
                "user_Name": req.body.user_Name,
                "user_Sex": req.body.user_Sex,
                "user_Age": req.body.user_Age,
                "user_Address": req.body.user_Address,
                "user_Telephone": req.body.user_Telephone
              }
            new Result(data, 'success', {
            ret: true,
            code: 200
            }).success(res)
        } else {
            new Result('', 'fail', {
                ret: false,
                code: 200
            }).fail(res)
        }
    } else {
        new Result('jwtInvalid').fail(res) 
    }
})
router.get('/getFriend', async (req,res) => {
    let sql = 'select user_Id,user_Name,user_Sex,user_Age,user_Address,user_Telephone,user_Img from t_user_data where user_Telephone = ?';
    const decode = decoded(req) 
    if (decode && decode.currUserId) {
      let params = [req.query.selectAccountNumber]
      let resulte = await mysql(sql, params)
      if (resulte && resulte.length != 0) {
        sql = `select user_FriendList from t_user_data where user_id = ?`
        params = [decode.currUserId]
        resulte = await mysql(sql, params)
        if (resulte && resulte.length != 0) {
            resulte = resulte[0].user_FriendList.split(',')
            //true表示已经添加为好友， false表示未添加为好友
            if (resulte.some(e => e == (data[0].user_Id)) || data[0].user_Id == decode.currUserId) {
                data[0].state = true
            } else {
                data[0].state = false                
            }
            data[0].user_Id = aesEncryption(JSON.stringify(data[0].user_Id))
            new Result(data, 'success', {
              ret: true,
              code: 200
            }).success(res)
        } else {
            new Result(null, 'fail', {
                ret: false,
                code: 204
            }).fail(res)
        }
      } else {
        new Result(null, 'fail', {
            ret: false,
            code: 204
        }).fail(res)
      }
    } else {
        new Result('jwtInvalid').fail(res) 
    }
})
router.post('/postFriend', async (req,res) => {
    const decode = decoded(req)
    let sql = 'select * from t_user_data where user_Id = ?';
    if (decode && decode.currUserId) {
      let params = [decode.currUserId]
      let resulte = mysql(sql, params)
      if (resulte && resulte.length != 0) {
        let friendList = resulte[0].user_FriendList.split(',')
        friendList.push(req.body.firendId)
        friendList = friendList.join(',')
        sql = `update t_user_data set user_FriendList = ? where user_id = ?`
        params = [friendList, decode.currUserId]
        resulte = mysql(sql, params)
        if (resulte && resulte.length) {
          new Result(null, 'success', {
              ret: true,
              code: 200
          }).success(res)
        } else {
          new Result(null, 'fail', {
              ret: false,
              code: 204
          }).fail(res)
        }
      } else {
        new Result(null, 'fail', {
            ret: false,
            code: 204
        }).fail(res)
      }
    } else {
        new Result('jwtInvalid').fail(res) 
    }
})
router.get('/getUserColloection', async (req, res) => {
    const decode = decoded(req)
    let params = ''
    let sql = `select c.id , c.commodity_img as 'imgUrl', c.commodity_per as 'price', c.commodity_name as 'title', c.commodity_Class as commodity_Class from t_user_colloection as col, commodity_data as c where col.colloection_userid = ? and c.id = col.colloection_commodity`;
    if (req.query.commodityClass) {
        sql = `select c.id , c.commodity_img as 'imgUrl', c.commodity_per as 'price', c.commodity_name as 'title', c.commodity_Class as commodity_Class from t_user_colloection as col, commodity_data as c where col.colloection_userid = ? and c.commodity_class = ? and c.id = col.colloection_commodity`;
    }
    if (decode && decode.currUserId) {
      if (req.query.commodityClass) {
      	params = [decode.currUserId, req.query.commodityClass]
      } else {
      	params = [decode.currUserId]
      }
      const resulte = await mysql(sql, params)
      if (resulte && resulte.length != 0) {
        new Result(resulte, 'success', {
            ret: true,
            code: 200
        }).success(res)
      } else {
        new Result(resulte, 'fail', {
            ret: false,
            code: 204
        }).fail(res)
      }
    }  else {
        new Result('jwtInvalid').fail(res) 
    }
})
router.post('/postUserColloection', async (req, res) => {
    const decode = decoded(req)
    if (decode && decode.currUserId) {
        if (req.body.actionStyle == 'del') {
            sql = 'delete from t_user_colloection where colloection_userid = ? and colloection_commodity = ?';
            req.body.colloectionList.forEach( async (e, i) => {
              const params = [decode.currUserId, e.id]
              const resulte = await mysql(sql, params)
              if (resulte && resulte.length != 0) {
                if (i == req.body.colloectionList.length - 1) {
                    const data = true
                    new Result(data, 'success', {
                        ret: true,
                        code: 200
                    }).success(res)
                 }
              } else {
                const data = false
                return new Result(data, 'fail', {
                    ret: false,
                    code: 204
                }).fail(res)
              }
            })
        } else {
            let sql = `select * from t_user_colloection where colloection_userid = ? and colloection_commodity = ?`;
            const params = [decode.currUserId, req.body.commodity]
            let data = true
            let resulte = await mysql(sql, params)
            if (resulte && resulte.length) {
                sql = `delete  from t_user_colloection where colloection_userid = ? and colloection_commodity = ?`;
                resulte = await mysql(sql, params)
                if (resulte && resulte.length != 0) {
                    new Result(data, 'success', {
                      ret: true,
                      code: 200
                    }).success(res)
                } else {
                    data = false
                    new Result(data, 'fail', {
                        ret: false,
                        code: 204
                    }).fail(res)
                }
            } else {
                sql = `insert into t_user_colloection(colloection_id,colloection_userid,colloection_commodity,colloection_generateTime) values (null,?,?,now())`
                resulte = await mysql(sql, params)
                if (resulte && resulte.length != 0) {
                    new Result(data, 'success', {
                      ret: true,
                      code: 200
                    }).success(res)
                } else {
                    data = false
                    new Result(data, 'fail', {
                        ret: false,
                        code: 204
                    }).fail(res)
                }
            }
        }
    } else {
        new Result('jwtInvalid').fail(res) 
    }
})
router.get('/getUserShoppingCar', async (req, res) => {
    const sql =  'select c.id, s.shoppingCar_id, c.commodity_Img as imgUrl, c.commodity_Name as title, s.shoppingCar_Size as size, c.commodity_Per as price, s.shoppingCar_Number as number from t_shopping_cart as s, commodity_data as c where s.shoppingCar_UserId = ? and s.shoppingCar_Commodity = c.id';
    const decode = decoded(req)
    if (decode && decode.currUserId) {
      const params = [decode.currUserId]
      const resulte = await mysql(sql, params)
      console.log(resulte)
      if (resulte && resulte.length != 0) {
        const data = resulte
        new Result(data, 'success', {
            ret: true,
            code: 200
        }).success(res)
      } else {
        new Result(null, 'fail', {
            ret: false,
            code: 204
        }).fail(res)
      }
    } else {
      new Result('jwtInvalid').fail(res) 
    }
})
router.post('/postUserShoppingCar', async (req, res) => {
    let sql = '';
    let orderIdlist = []
    let params = []
    const decode = decoded(req)
    if (decode && decode.currUserId) {
        if (req.body.actionStyle == 'check') {
            sql = 'insert into t_order_data(order_Id,order_Commodity,order_Number,order_Size,order_State,order_UserId,order_generateTime) values (null,?,?,?,?,?,now())';
            req.body.data.forEach( async (e, i) => {
                params = [e.id, e.number, e.size, '未支付', decode.currUserId]
                const resulte = await mysql(sql, params)
                if (resulte && resulte.length != 0) {
                    orderIdlist.push(resulte.insertId)
                    if (i == req.body.data.length - 1) {
                        new Result(orderIdlist, 'success', {
                            ret: true,
                            code: 200
                        }).success(res)
                    }
                } else {
                    return new Result(null, 'fail', {
                        ret: false,
                        code: 204
                    }).fail(res)
                }
            });
        } else {
            if (req.body.actionStyle == 'del') {
                sql = 'delete from t_shopping_cart where shoppingCar_userid = ? and shoppingCar_Commodity = ?';
                req.body.data.forEach( async (i,e) => {
                  params = [decode.currUserId, e.id]
                  const resulte = await mysql(sql, params)
                  if (!resulte) {
                    return new Result(null, 'fail', {
                        ret: true,
                        code: 200
                    }).fail(res)
                  }
                })
                new Result(null, 'success', {
                    ret: true,
                    code: 200
                }).success(res)
            } else {
                sql = `select shoppingCar_Number from t_shopping_cart where shoppingCar_Size = ? and shoppingCar_UserId = ? and shoppingCar_Commodity = ?`;
                params = [req.body.informationCommodityData.size, decode.currUserId, req.body.informationCommodityData.commodityId]
                let resulte = await mysql(sql, params)
                if (resulte && resulte.length != 0) {
                    const newNumber = resulte[0].shoppingCar_Number + parseInt(req.body.informationCommodityData.number)
                    let data = true
                    sql = `update t_shopping_cart set  shoppingCar_Number = ? where shoppingCar_Commodity = ? and shoppingCar_Size = ? and shoppingCar_UserId = ?`;
                    params = [newNumber, req.body.informationCommodityData.commodityId, req.body.informationCommodityData.size, decode.currUserId]
                    resulte = await mysql(sql, params)
                    if (resulte && resulte.length != 0) {
                        new Result(data = true, 'success', {
                            ret: true,
                            code: 200
                        }).success(res)
                    } else {
                        data = false
                        new Result(data, 'success', {
                            ret: false,
                            code: 204
                        }).fail(res)
                    }
                } else {
                    sql = `insert into t_shopping_cart(shoppingCar_id,shoppingCar_Commodity,shoppingCar_Number,shoppingCar_size,shoppingCar_UserId,shoppingCar_GenerateTime) values (null,?,?,?,?,now())`;
                    params = [req.body.informationCommodityData.commodityId, req.body.informationCommodityData.number, req.body.informationCommodityData.size, decode.currUserId]
                    resulte = await mysql(sql, params)
                    let data = true
                    if (resulte && resulte.length != 0) {
                        new Result(data, 'success', {
                            ret: true,
                            code: 200
                        }).success(res)
                    } else {
                        data = false
                        new Result(data, 'success', {
                            ret: false,
                            code: 204
                        }).fail(res)
                    }
                }
            }
        }
    } else {
        new Result('jwtInvalid').fail(res) 
    }
})
router.get('/getUserOrderColumn', async (req, res) => {
    let sql = ``
    if (req.query.action == 'pay') {
        sql = `select o.order_id as id ,c.commodity_img as imgUrl ,c.commodity_name as title ,  c.commodity_per as price , o.order_number as number, o.order_size as size from t_order_data as o, commodity_data as c where o.order_userid = ? and o.order_state = '未支付' and o.order_commodity = c.id`;
    } else if (req.query.action == 'Receiv') {
        sql = `select o.order_id as id ,c.commodity_img as imgUrl ,c.commodity_name as title ,  c.commodity_per as price , o.order_number as number, o.order_size as size from t_order_data as o, commodity_data as c where o.order_userid = ? and o.order_state = '待收货' and o.order_commodity = c.id`;
    } else {
        sql = `select o.order_id as id ,c.commodity_img as imgUrl ,c.commodity_name as title ,  c.commodity_per as price , o.order_number as number, o.order_size as size from t_order_data as o, commodity_data as c where o.order_userid = ? and o.order_state = '待评论' and o.order_commodity = c.id`;
    }
    const  decode = decoded(req)
    if (decode && decode.currUserId) {
      const params = [decode.currUserId]
      const resulte = await mysql(sql, params)
      console.log(resulte)
      if (resulte && resulte.length != 0) {
        resulte[0].id = aesEncryption(JSON.stringify(resulte[0].id))
        const data = resulte
        new Result(data, 'success', {
            ret: true,
            code: 200
        }).success(res)
      } else {
        new Result(null, 'fail', {
            ret: fail,
            code: 204
        }).fail(res)    
      }
    } else {
        new Result('jwtInvalid').fail(res) 
    }
})
// //根据id修改,根据不同的返回数据调用不同的sql语句
router.post('/postUserOrderColumn', async (req, res) => {
    let sql = '',
        params = [],
        returnVal = '';
    const decode = decoded(req)
    if (typeof(req.body.orderId) != "String") {
        req.body.orderId = JSON.stringify(req.body.orderId)
    }
    if (decode && decode.currUserId) {
        if (req.body.action == 'delpay') {
            sql = 'delete from t_order_data where order_userid = ? and  order_Id= ?';
            params = [decode.currUserId, aesDecryption(req.body.orderId)];
            returnVal = aesDecryption(req.body.orderId)
            const resulte = await mysql(sql, params)
            if (resulte && resulte.length != 0) {
                const data = {
                    orderNumber: returnVal
                }
                new Result(data, 'success', {
                    ret: true,
                    code: 200
                }).success(res)
            } else {
                new Result(null, 'fail', {
                    ret: false,
                    code: 204
                }).fail(res)
            }
        } else {
            sql = `insert into t_order_data(order_Id,order_Commodity,order_Number,order_Size,order_State,order_UserId,order_generateTime) values (null,?,?,?,'未支付',?,now())`
            params = [req.body.commodity.commodityId, req.body.commodity.number, req.body.commodity.size, decode.currUserId]
            const resulte = await mysql(sql, params)
            if (resulte && resulte.length != 0) {
                resulte.insertId = JSON.stringify(resulte.insertId)
                const data = {
                    orderNumber: resulte.insertId
                }
                new Result(data, 'success', {
                    ret: true,
                    code: 200
                }).success(res)
            } else {
                new Result(null, 'fail', {
                    ret: false,
                    code: 204
                }).fail(res)
            }
        }        
    } else {
        new Result('jwtInvalid').fail(res) 
    }
})
router.get('/getOrderDetalis', async (req, res) =>{
    console.log(req.query)
    const decode = decoded(req)
    if (decode && decode.currUserId) {
      const sql = `select telephonNumber,addressDetalis,contacts,orderDetalisNumber,orderDetalisSize,orderDetalistTitle,orderDetalistImg,orderDetalisPrice  from v_orderDetallis where user_id = ? and order_id = ?`
      const params = [decode.currUserId, aesDecryption(req.query.payId)]
      const resulte = await mysql(sql, params)
      if (resulte && resulte.length != 0) {
        const data =  {
            orderDetalisNumber: resulte[0].orderDetalisNumber,
            orderDetalistImg: resulte[0].orderDetalistImg,
            orderDetalistTitle: resulte[0].orderDetalistTitle,
            orderDetalisPrice: resulte[0].orderDetalisPrice,
            orderDetalisSize: resulte[0].orderDetalisSize,
            orderDetalisPriceSum: resulte[0].orderDetalisNumber * resulte[0].orderDetalisPrice,
            orderDetalisAddress: `[{"addressDetalis": ${'"'+ resulte[0].addressDetalis+ '"'},"contacts": ${'"' + resulte[0].contacts + '"'},"telephonNumber": ${resulte[0].telephonNumber}}]`
          }
          new Result(data, 'success', {
              ret: true,
              code: 200
          }).success(res)
      } else {
        new Result(null, 'fail', {
            ret: false,
            code: 204
        }).fail(res)
      }
    } else {
        new Result('jwtInvalid').fail(res) 
    }
})
router.post('/postOrderDetalis', async (req, res) =>{
    console.log(req.body)
    const decode = decoded(req)
    if (decode && decode.currUserId) {
        sql = `update t_order_data set  order_Number = ${req.body.orderInformation.orderDetalisNumber} , order_Size = '${req.body.orderInformation.orderDetalisSize}'  where order_userid = ${decode.currUserId} and order_id = ${aesDecryption(req.body.orderId)};`
        const resulte = await mysql(sql)
        if (resulte && resulte.length != 0) {
          new Result(null, 'success', {
              ret: true,
              code: 200
          }).success(res)
        } else {
          new Result(null, 'fail', {
            ret: false,
            code: 204
          }).fail(res)
        }
    } else {
        new Result('jwtInvalid').fail(res) 
    }
})
router.get('/getEmitAddress', async (req,res) => {
    
    const sql = `select telephone, addressReceiv, addressReceivDetallis, receiveName from address where user_id = ? and order_id = ?`
    const decode = decoded(req)
    const params = [decode.currUserId, aesDecryption(JSON.stringify(req.query.payId))]
    if (decode && decode.currUserId) {
      const resulte = await mysql(sql, params)
      if (resulte && resulte.length != 0) {
        let areaCode = '',country = '',city = '',county = '';
        if (resulte[0].addressReceiv !== ''){
            for(let i in area.county_list) {
                if (area.county_list[i] == resulte[0].addressReceiv.split(' ')[2]){
                areaCode  = i
                }
            }
            country = resulte[0].addressReceiv.split(' ')[1]
            city = resulte[0].addressReceiv.split(' ')[1]
            county = resulte[0].addressReceiv.split(' ')[1]
        }
        const data = {
            addressDetail: resulte[0].addressReceivDetallis,
            areaCode,
            city,
            country,
            county,
            name: resulte[0].receiveName,
            province: resulte[0].addressReceiv.split(' ')[0],
            tel: resulte[0].telephone,
        }
        new Result(data, 'success', {
            ret: true,
            code: 200
        }).success(res)
      } else {
        new Result(null, 'fail', {
            ret: false,
            code: 204
        }).fail(res)
      }
    } else {
        new Result('jwtInvalid').fail(res) 
    }
  });
router.post('/postEmitAddress' , async (req, res) =>{
    const decode = decoded(req)
    if (decode && decode.currUserId) {
        const sql = `update address set  receiveName = ?, telephone = ? , addressReceiv = ? , addressReceivDetallis = ? where user_id = ?  and order_id = ?;`
        const  addressReceivInformation = req.body.emitAddressInformation.province + ' ' + req.body.emitAddressInformation.city + ' ' + req.body.emitAddressInformation.county
        const params = [req.body.emitAddressInformation.name, req.body.emitAddressInformation.tel, addressReceivInformation, req.body.emitAddressInformation.addressDetail, decode.currUserId, aesDecryption(req.body.payId)]
        const resulte = await mysql(sql, params)
        if (resulte && resulte.length != 0) {
            new Result(true,'success', {
                ret: true,
                code: 200
            }).success(res)
        } else {
            new Result(false,'fail', {
                ret: false,
                code: 204
            }).fail(res)
        }
    } else {
        new Result('jwtInvalid').fail(res) 
    }
})
// //下面这个是将用户传输过来的支付密码进行判定
router.post('/postUserBillPay', async (req, res) => {
    let sql = 'select user_perpassword from t_user_data where user_id = ?'
    req.body.orderId = aesDecryption(req.body.orderId)
    const decode = decoded(req)
    if (decode && decode.currUserId) {
      let params = [decode.currUserId]
      let resulte = await mysql(sql, params)
      let data = true
      if (resulte && resulte.length != 0) {
        if (resulte[0].user_perpassword == req.body.value) {
            if (req.body.action == 'ShoppingCar' || req.body.action == 'pay') {
                sql = `update t_order_data set order_State = '待收货' where order_id = ? and order_UserId = ?`;
            } else {
                sql = `update t_order_data set order_State = '待评论' where order_id = ? and order_UserId = ?`;
            }
            if (typeof(req.body.orderId) == Array) {
                req.body.orderId.forEach( async (e, i) => {
                  params = [e, decode.currUserId]
                  const resulte = await mysql(sql, params)
                  if (resulte && resulte.length != 0) {
                    if (i == req.body.orderId.length - 1) {
                        new Result(data, 'success', {
                            ret: true,
                            code: 200
                        }).success(res)
                    }
                  } else {
                    data = false
                    return new Result(data, 'fail', {
                        ret: false,
                        code: 204
                    }).fail(res)
                  }
                })
            } else {
              params = [req.body.orderId, decode.currUserId]
              const resulte = await mysql(sql, params)
              if (resulte && resulte.length != 0) {
                  new Result(data, 'success', {
                      ret: true,
                      code: 200
                  }).success(res)
              } else {
                data = false
                new Result(data, 'fail', {
                    ret: false,
                    code: 204
                }).fail(res)
              }
            }
        } else {
            new Result(null, 'fail', {
                ret: false,
                code: 204
            }).fail(res)
        }
      } else {
        new Result(null, 'fail', {
            ret: false,
            code: 204
        }).fail(res)
      }
    } else {
        new Result('jwtInvalid').fail(res) 
    }
})
router.get('/getCommodity', async (req, res) => {
    let sql = 'select id, commodity_img as imgUrl , commodity_name as title , commodity_per as price , commodity_img_hover as imgUrl1, commodity_Presonality, commodity_State as commodityState from commodity_data where id = ?';
    const decode = decoded(req)
    let params = [req.query.commodityId]
    let resulte = await mysql(sql, params)
    if (resulte && resulte.length != 0) {
        let commodityInformation = resulte[0]
            console.log(commodityInformation)
        if (decode && decode.currUserId) {
          sql = `select * from t_user_colloection where colloection_userid = ? and colloection_commodity = ?`;
          params = [decode.currUserId, commodityInformation.id]
          resulte = await mysql(sql, params)
          if (resulte && resulte.length != 0) {
            commodityInformation.newParam = 'conllectionState'
            if (resulte && resulte.length != 0) {
                commodityInformation.conllectionState = true
            } else {
                commodityInformation.conllectionState = false
            }
            const data = commodityInformation
            new Result(data, 'success', {
                ret: true,
                code: 200
            }).success(res)
          }
        } else {
            const data = commodityInformation
            new Result(data, 'success', {
                ret: true,
                code: 200
            }).success(res)
        }
    } else {
        new Result(null, 'fail', {
            ret: false,
            code: 204
        }).fail(res)
    }
})
router.get('/getUserDialogues', async (req, res) => {
    let user_FriendListObject = [];
    let sql = 'select user_FriendList from t_user_data where user_id = ?';
    const decode = decoded(req);
    let params = [decode.currUserId];
    if (decode && decode.currUserId) {
      let resulte = await mysql(sql, params)
      if (resulte && resulte.length != 0) {
        const user_FriendListId = resulte[0].user_FriendList.split(',');
        user_FriendListId.forEach(e => {
            USER_FRIENDLIST.push({
                id: e,
                socket: ''
            })
            user_FriendListObject.push({
                id: e
            })
        })
        sql = 'select user_Id as id,user_Name as userName,user_Img as userRelationHeadImg from t_user_data where user_id = ?';
        let dialogueContentAll = []
        if (user_FriendListObject.length != 0) {
            user_FriendListObject.forEach(async (e, i) => {
              params = [e.id]
              resulte = await mysql(sql, params)
              if (resulte && resulte.length !== 0) {
                resulte[0].id = aesEncryption(JSON.stringify(resulte[0].id))
                dialogueContentAll.push(resulte[0])
                if (i == user_FriendListObject.length - 1) {
                    const data = dialogueContentAll
                    console.log(data)
                    new Result(data, 'success', {
                        ret: true,
                        code: 200
                    }).success(res)
                }
              } else {
                return new Result(null, 'fail', {
                    ret: false,
                    code: 204
                }).fail(res)
              }
            })
        }
      } else {
        new Result(null, 'fail', {
            ret: false,
            code: 204
        }).fail(res)
      }
    } else {
        new Result('jwtInvalid').fail(res) 
    }
})
router.get('/dialogueBox', async (req, res) => {
    req.query.objectUserId = aesDecryption(req.query.objectUserId)
    let userDialogues = [],
        returnDialoguesInformation = [],
        bulleList = [];
    const staticFile = '{"userId": []}', decode = decoded(req);
    if (decode && decode.currUserId) {
        existsSync = () => {
            const exists = fs.existsSync(path.join(__dirname, '..', 'public', decode.currUserId + '.json'));
            if (!exists) {
                console.log('创建')
                const Establish = fs.writeFile(path.join(__dirname, '..','public', JSON.parse(decode.currUserId) + '.json'), staticFile, (err) => {
                    if (err) {
                        console.log(err)
                    }
                })
                Establish()
            }
        }
        existsSync();
        userDialogues = fs.readFileSync(path.join(__dirname, '..', 'public', decode.currUserId + '.json'), 'utf-8', (err, data) => {
            if (err) {
                return err
            }
            return data
        })
        JSON.parse(userDialogues).userId.forEach((e, i) => {
            if (e.relationShipId == req.query.objectUserId) {
                returnDialoguesInformation = e.dialogueContent
            }
        })
        const sql = 'select user_Name,user_Img from t_user_data where user_Id = ?';
        if (returnDialoguesInformation.length !== 0) {
            returnDialoguesInformation.forEach( async (e, i) => {
                const resulte = await mysql(sql, [e.userId])
                if (resulte && resulte.length != 0) {
                    let data =  {
                        "id": e.dialogueId,
                        "userName": resulte[0].user_Name,
                        "userHeadImg": resulte[0].user_Img,
                        "userDialogueContent": e.dialogueContent
                    }
                    if (e.userId == decode.currUserId) {
                        data.idntity = 'self'
                    } else {
                        data.idntity = 'others'
                    }
                    bulleList.push(data)
                    if (i == returnDialoguesInformation.length - 1) {
                        const data = bulleList 
                        new Result(data ,'success', {
                            ret: true,
                            code: 200
                        }).success(res)
                    }
                } else {
                    return new Result(null, 'fail', {
                        ret: false,
                        code: 204
                    }).fail(res)
                }
            });
        } else {
          const resulte = await mysql(sql, [req.query.objectUserId])
          if (resulte && resulte.length != 0) {
            bulleList.push({
                "id": null,
                "userId": req.query.objectUserId,
                "userName": resulte[0].user_Name,
                "userHeadImg": resulte[0].user_Img,
                "userDialogueContent": null
            })
            const data = bulleList 
            new Result(data ,'success', {
                ret: true,
                code: 200
            }).success(res)
          } else {
            new Result(data ,'fail', {
                ret: false,
                code: 204
            }).fail(res)
          }
        }        
    }
})

module.exports = router 