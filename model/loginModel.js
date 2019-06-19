var loginModel = {

    // 계정 등록
    loginCheck: function(params, callback) {
        config.connection.getConnection(function(err, connection) {
            var sql = `SELECT account 
                        FROM wallet_account 
                        WHERE account = ?
                            AND password = ?`;
            connection.query(sql, [params.memAccount, params.memPwd], callback);
            connection.release();
        });
    }
};

module.exports = loginModel;