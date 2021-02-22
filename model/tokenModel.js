var tokenModel = {
    /** 토큰 조회 */
    searchTokens: function(params, callback) {
        try{
            config.connection.getConnection(function(err, connection) {
                var sql = `
                    SELECT *
                    FROM cryptocurrency
                `;
                if (params.searchKeyword != '') {
                    sql += `
                        WHERE
                            symbol like ?
                    `;
                    console.log("sql:" + sql);
                    connection.query(sql, ["%" + params.searchKeyword + "%"], callback);
                    connection.release();
                } else {
                    connection.query(sql, [], callback);
                    connection.release();
                }
            });
        }catch (e) {
            console.log("error:" + e);
        }
    },
    //searchAccountTokens
    showMyTokens: function (params, callback){
        try{
            config.connection.getConnection(function (err, connection){
                var sql = `
                    select 
                       account,
                       symbol,
                       (select logo_img from cryptocurrency where symbol = t.symbol) logo_img
                    from
                        acc_symbol t
                    where
                        account = ?
                    order by
                        create_dttm asc
                `;
                connection.query(sql, [params.account], callback);
                connection.release();
            });
        }catch (e) {
            console.log("error:" + e);
        }
    },

    // insertMyToken
    insertMyToken: function(params, callback) {
        config.connection.getConnection(function(err, connection) {
            var sql = `
                    insert into acc_symbol
                    (
                        account,
                        symbol,
                        create_dttm
                    )
                    values
                    (
                        ?,
                        ?,
                        now()
                    )
                      `;
            connection.query(sql, [params.account, params.symbol, 0], callback);
            connection.release();
        });
    },

    // deleteMyToken
    deleteMyToken: function(params, callback) {
        config.connection.getConnection(function(err, connection) {
            var sql = `
                delete from
                    acc_symbol
                where
                    account = ? and 
                    symbol = ?
            `;
            connection.query(sql, [params.account, params.symbol, 0], callback);
            connection.release();
        });
    },
};
module.exports = tokenModel;
