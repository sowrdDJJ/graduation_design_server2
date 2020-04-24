const express = require('express')
const boom = require('boom')
const Result = require('../model/Result') 
const homeRouter = require('./home')
const userRouter = require('./user')
const adminRouter = require('./admin')
const cross = require('./cross')
const router = express.Router()
const jwtAuth = require('./jwt')

router.use(jwtAuth)
router.use(cross)
router.use(homeRouter)
router.use(userRouter)
router.use(adminRouter)

router.use((req, res, next) => {
    next(boom.notFound('接口不存在'))
})

router.use((err, req, res, next) => {
    console.log(err)
    if (err.name &&  err.name === 'UnauthorizedError' || err.name === 'TokenExpiredError') {
        const {status = 401, errorMsg} = err
        new Result(null, '登录过期',{
            error: status,
            errorMsg
        }).tokenError(res.status(status))        
    } else {
      const msg = (err && err.message) || '系统错误'
      const statusCode = (err.output && err.output.statusCode) || 500
      const errorMsg = (err.output && err.output.payload && err.output.payload.error) || err.message
      new Result(null, msg,{
          error: statusCode,
          errorMsg
      }).fail(res.status(statusCode))
    }

})

module.exports = router