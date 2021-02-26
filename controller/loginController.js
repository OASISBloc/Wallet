const loginModel = require('../model/loginModel');
const cryptoUtil = require('../util/crypto');
const cryptoRandomString = require('crypto-random-string');
const commonController = require('../controller/commonController');

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
    },

    // 비밀번호변경 인증메일 발송
    forgotPasswordMail: function(req, res) {
        var params = req.body;
        loginModel.checkAccountEmail(params, function(err, result) {
            if (err) {
                res.json({result: false, message: 'Error occurred.'});
            } else {
                if (result[0].cnt == 1) {
                    // 계정 / 메일 / 인증값 처리
                    var certificationKey = cryptoRandomString(16);
                    // 메일 발송
                    var mailParams = {
                        account: params.account
                        , userEmail: params.email
                        , authKey: certificationKey
                        , emailSubject: '[OASISBloc Wallet] Please reset your password.'
                        , emailFormNm: 'mailForgotPassword.html'
                        , url: `${config.homeUrl}/resetPassword?account=${params.account}&authKey=${certificationKey}`
                        , homeUrl: config.homeUrl
                        , supportEmail: config.supportEmail
                    };

                    loginModel.addWalletRepassword(mailParams, function(err, mailResult) {
                        if (err) {
                            res.json({result: false, message: 'create mail failed.'});
                        } else {
                            // 공통 인증관련 메일 발송 처리
                            commonController.awsMail(mailParams);

                            res.json({result: true, rtnDatas: params, message: 'create account OK!!'});
                        }
                    });
                    
                } else {
                    res.json({result: false, message: 'Account name and email address do not match. Please check again.'});
                }
            }
        });
    },

    // 비밀번호 변경 페이지
    resetPassword: function(req, res) {
        var account = req.query.account;
        var authKey = req.query.authKey;

        if (!account || !authKey) {
            res.render('404',{ layout: './layout/single-layout' });
        } else {
            var params = {
                'account': account
                , 'authKey': authKey
            };
            loginModel.selectMailCertify(params, function(err, result) {
                if (err) {
                    throw err;
                } else {
                    var resultCnt = result[0].count;
                    var timeDiff = result[0].timeDiff;
                    if (resultCnt > 0 && timeDiff <= 10) {
                        res.render('./resetPassword', {title: 'change password', result: 'OK', account: params.account, authKey: params.authKey, symbol: ''});
                    } else {
                        if (timeDiff) {
                            res.render('./resetPassword', {title: '비밀변경 유효 시간 만료', result: 'expire', account: params.account, authKey: '', symbol: ''});
                        } else {
                            res.render('./resetPassword', {title: '비밀변경 실패', result: 'fail', account: params.account, authKey: '', symbol: ''});
                        }
                    }
                }
            });
        }
    },

    // 비밀번호 변경 처리
    procResetPassword: function(req, res) {
        var newPwd = req.body.newPwd;
        var account = req.body.account;
        var authKey = req.body.authKey;

        if (!newPwd || !account || !authKey) {
            res.json({"result": false, "message": 'Incorrect access. Please try again through the received email.'});
        } else {
            var params = {
                'newPwd': cryptoUtil.sha256Crypto(newPwd),
                'account': account,
                'authKey': authKey
            };

            loginModel.selectMailCertify(params, function(err, certifyResult) {
                if (err) {
                    throw err;
                } else {
                    if (certifyResult[0].count > 0) {

                        // DB Transaction 처리
                        config.connection.getConnection(function(err, connection) {
                            connection.beginTransaction(function(err) {
                                if (err) {
                                    throw err;
                                } else {
                                    loginModel.updateUserPassword(connection, params, function(err, result) {
                                        if (err) {
                                            connection.rollback(function() {
                                                res.json({'result': false, 'expired': false, 'message': 'Error occurred.'});
                                            });
                                        } else {
                                            loginModel.deleteUserEmailCertification(connection, params, function(err, result) {
                                                if (err) {
                                                    connection.rollback(function() {
                                                        res.json({'result': false, 'expired': false, 'message': 'Error occurred.'});
                                                    });
                                                } else {
                                                    connection.commit(function(err) {
                                                        if (err) {
                                                            connection.rollback(function() {
                                                                res.json({'result': false, 'expired': false, 'message': 'Error occurred.'});
                                                            });
                                                        }
                                                        connection.release();
                                                        res.json({'result': true, 'message': '변경되었습니다.', 'url': `${req.get('host')}/login`});
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    } else {
                        res.json({'result': false, 'expired': true})
                    }
                }
            });
        }
    }

};

module.exports = loginController;
