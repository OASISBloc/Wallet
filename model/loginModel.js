var loginModel = {

    // 계정 등록
    loginCheck: function(params, callback) {
        config.connection.getConnection(function(err, connection) {
            var sql = `SELECT account
                            , public_key AS publicKey
                        FROM wallet_account 
                        WHERE account = ?
                            AND password = ?`;
            connection.query(sql, [params.memAccount, params.memPwd], callback);
            connection.release();
        });
    }, 
    // 비밀번호 발송 계정, 메일 체크
    checkAccountEmail: function(params, callback) {
        config.connection.getConnection(function(err, connection) {
            var sql = `SELECT count(account) AS cnt
                        FROM wallet_account 
                        WHERE account = ?
                            AND email = ?`;
            connection.query(sql, [params.account, params.email], callback);
            connection.release();
        });
    },
    // 비밀번호 변경 메일 발송 이력 등록
    addWalletRepassword: function(params, callback) {
        config.connection.getConnection(function(err, connection) {
            var sql = `DELETE FROM wallet_repassword
                        WHERE account = ?
                        ;

                        INSERT INTO wallet_repassword (
                            account, email, auth_key, create_dttm
                        ) values (
                            ?, ?, ?, now()
                        );
            `;
            connection.query(sql, [params.account, params.account, params.userEmail, params.authKey], callback);
            connection.release();
        });
    },
    // 비밀번호 변경 파라미터 및 시간 유효성 체크
    selectMailCertify: function(params, callback) {
        config.connection.getConnection(function(err, connection) {
            var sql = `SELECT COUNT(account) AS count
                            , TIMESTAMPDIFF(MINUTE, create_dttm, now()) AS timeDiff
                        FROM wallet_repassword
                        WHERE account = ?
                            AND auth_key = ?`;
            connection.query(sql, [params.account, params.authKey], callback);
            connection.release();
        });
    },
    /** 사용자 비밀번호 변경 */
    updateUserPassword: function(conn, params, callback) {
        var sql = `UPDATE wallet_account
                    SET password = ?
                    WHERE account = ?
                `;
        conn.query(sql, [params.newPwd, params.account], callback);
    },
     /* 메일 인증을 위한 키값 삭제 */
     deleteUserEmailCertification: function(conn, params, callback) {
        var sql = `DELETE FROM wallet_repassword
            WHERE account = ?
                AND auth_key = ?
        `;
        conn.query(sql, [params.account, params.authKey], callback);
    },
    /* publicKey 조회 */
    getPublicKey: function(account, callback) {
        config.connection.getConnection(function(err, connection) {
            var sql = `SELECT account
                            , public_key AS publicKey
                        FROM wallet_account 
                        WHERE account = ?`;
            connection.query(sql, account, callback);
            connection.release();
        });
    }, 
};

module.exports = loginModel;