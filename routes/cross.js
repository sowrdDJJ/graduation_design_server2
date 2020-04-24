const express = require('express')
const router = express.Router()

router.all('*',function(req,res,next){
    //设置请求头
    //允许所有来源访问
    res.header('Access-Control-Allow-Origin', '*')
    //用于判断request来自ajax还是传统请求
    res.header('Access-Control-Allow-Headers', 'X-Requested-With')
    //允许访问的方式
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    //修改程序信息与版本
    res.header('X-Powered-By', ' 3.2.1')
    //内容类型：如果是post请求必须指定这个属性
    res.header('Content-Type', 'application/json;charset=utf-8')
    res.header("Access-Control-Allow-Headers", "Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE")
    res.header("Access-Control-Allow-Origin", "http://192.168.43.102:8080");   //这里要写具体请求地址
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header("Access-Control-Allow-Headers", "Content-Type, authorization, Cache-Control")
    next()
})

module.exports = router