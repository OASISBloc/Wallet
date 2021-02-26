const termsModel = require('../model/termsModel');

var termsController = {
    // 약관 전체 데이터들
    getTermsDatas: function(req, res) {
        var params = req.body;

        termsModel.getTermsDatas(function(err, result) {
            if (err) {
                res.json({result: false, message: 'Error occurred.'});
            } else {
                if (result.length == 0) {
                    res.json({result: false});
                } else {
                    var data = result[0];
                    res.json({result: true, datas: result, termYN: data.termYN, privacyYN: data.privacyYN});
                }
            }
        })
    },
    // 약관 조회
    getTerm: function(req, res) {
        var boardId = req.body.boardId ? req.body.boardId : '';
        termsModel.getTerm(boardId, function(err, result) {
            if (err) {
                res.json({result: false, message: 'Error occurred.'});
            } else {
                if (result.length == 0) {
                    res.json({result: false});
                } else {
                    var data = result[0];
                    res.json({result: true, data: data});
                }
            }
        })
    }
};

module.exports = termsController;
