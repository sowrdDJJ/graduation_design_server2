const mysql = require('mysql');
const mysqRouter = require('./config')
module.exports = {
    config: {
        host: mysqRouter.host,
        port: mysqRouter.port,
        database: mysqRouter.database,
        user: mysqRouter.user,
        password: mysqRouter.password,
        useConnectionPooling: true // 使用连接池
    },
    pool: null,
    /**
     * 创建连接池
     */
    create: function () {
        const me = this;
        // 没有pool的才创建
        if (!me.pool) {
            me.pool = mysql.createPool(me.config);
        }
    },
    /**
     * 执行sql
     * @param {Object} config 操作对象
     */
    exec: function (config) {
        const me = this;
        me.create();
        me.pool.getConnection((err, conn) => {
            if (err) {
                console.log('mysql pool getConnections err:' + err);
                throw err;
            } else {
                conn.query(config.sql, config.params, (err, result) => {
                    if (config.success) {
                        config.success(result);
                    }
                    if (config.error) {
                        config.error(err)
                    }
                    // 释放连接到连接池
                    conn.release();
                });
            }
        });
    }
};
