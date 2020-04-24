const mysql_Route = require('./db/config.js'),
    mysql = require('mysql'),
    async = require('async'),
    connection = mysql.createConnection({
        host: mysql_Route.host,
        post: mysql_Route.post,
        user: mysql_Route.user,
        password: mysql_Route.password,
        database: mysql_Route.database
    });

selection_User = () => {
    return new Promise(resolve => {
        let oData_Sql = '', sqls = { table_User: 'SELECT * FROM  t_user_data ' };
        async.map(sqls, (item, callback) => {
            connection.query(item, (err, results) => {
                callback(err, results);
            });
        }, (err, results) => {
            if (err) {
                console.error(err.message);
            } else {
                oData_Sql = results[0];
            }
        });
        setTimeout(() => {
            resolve(oData_Sql);
        }, 2000);
    })
}
exports.transmission = async function () {
    let oData_Sql_User = await selection_User();
    exports.interface_replace_Data_User = oData_Sql_User;
}