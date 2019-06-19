var joinModel = {

    // 계정 등록
    createAccount: function(params, callback) {
        config.connection.getConnection(function(err, connection) {
            var sql = `INSERT INTO wallet_account (
                account, password, public_key, email, agree_term_1, agree_term_2, create_dttm
            ) values (
                ?, ?, ?, ?, ?, ?, now()
            )`;
            connection.query(sql, [params.memAccount, params.memPwd, params.osbPublicKey, params.memEmail, params.agree_1, params.agree_2], callback);
            connection.release();
        });
    }
};

module.exports = joinModel;