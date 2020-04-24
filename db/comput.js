const mysql = require('./index')
mysqli = (sql, params = '') => {
    console.log(params)
    return new Promise((resolve, reject) => {
        mysql.exec({
            sql,
            params,
            success: resulte => {
              resolve(resulte)
            },
            error: err => {
              reject(err)
            }
        })
    })
}
module.exports = mysqli