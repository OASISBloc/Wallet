var termsModel = {
    // 약관 데이터 조회
    getTermsDatas: function(callback) {
        config.connection.getConnection(function(err, connection) {
            var sql = `SELECT board_id AS boardId
                            , terms_type AS termsType
                            , CASE WHEN terms_type = '3' THEN 'term' ELSE 'privacy' END AS termsTypeName
                            , terms_version AS termsVersion
                            , DATE_FORMAT(create_dttm, '%d.%m.%Y') AS createDate
                            , (SELECT CASE WHEN COUNT(*) > 0 THEN 'Y' ELSE 'N' END
                                FROM ico_board 
                                WHERE board_type =  'CD_TERMS' 
                                    AND terms_type = 3 
                                    AND board_view = 'Y') AS termYN
                            , (SELECT CASE WHEN COUNT(*) > 0 THEN 'Y' ELSE 'N' END
                                FROM ico_board 
                                WHERE board_type =  'CD_TERMS' 
                                    AND terms_type = 4 
                                    AND board_view = 'Y') AS privacyYN
                        FROM ico_board
                        WHERE board_type = 'CD_TERMS'
                            AND terms_type IN (3, 4)
                            AND board_view = 'Y'
                        ORDER BY terms_type, terms_version DESC`;
            connection.query(sql, callback);
            connection.release();
        });
    }, 
    // 약관 조회
    getTerm: function(boardId, callback) {
        config.connection.getConnection(function(err, connection) {
            var sql = `SELECT board_id AS boardId
                            , board_subject AS boardSubject
                            , board_content AS boardContent
                            , terms_type AS termsType
                            , DATE_FORMAT(create_dttm, '%d.%m.%Y') AS createDate
                            , terms_version AS termsVersion
                        FROM ico_board
                        WHERE board_type = 'CD_TERMS'
                            AND board_view = 'Y'
                            AND board_id = ?`;
            connection.query(sql, boardId, callback);
            connection.release();
        });
    }, 
};

module.exports = termsModel;