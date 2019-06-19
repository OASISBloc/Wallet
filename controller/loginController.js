const loginModel = require('../model/loginModel');
const cryptoUtil = require('../util/crypto');

var loginController = {
    // 로그인
    login: function(req, res) {

        if (req.session.account) {
            res.redirect('/');
        }

        var params = req.body;
        params.memPwd = cryptoUtil.sha256Crypto(params.memPwd);

        loginModel.loginCheck(params, function(err, loginResult) {
            if (err) {
                res.json({result: false, message: 'Error occurred.'})
            } else {
                if (loginResult.length == 0) {
                    res.json({result: false});
                } else {
                    req.session.account = {
                        account: loginResult[0].account
                    }
                    res.json({result: true, message: 'successed'});
                }
            }
        })
    },

    // 로그아웃
    logout: function(req, res) {
        if (req.session.account) {
            req.session.destroy(function(err) {
                if (err) {
                    res.redirect('/');
                } else {
                    console.log("logouted");
                    res.redirect('/');
                }
            });
        } else {
            res.redirect('/');
        }
    },

    // 로그인 체크
    checkLogin: function(req, res) {
        if (req.session.account) {
            res.json({result: true});
        } else {
            res.json({result: false});
        }
    }
};

module.exports = loginController;
