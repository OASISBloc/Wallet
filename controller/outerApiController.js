const joinModel = require('../model/joinModel');
const loginModel = require('../model/loginModel');
const ecc = require('eosjs-ecc');
const Eos = require('eosjs');
const cryptoUtil = require('../util/crypto');
const cryptoRandomString = require('crypto-random-string');
const commonController = require('../controller/commonController');
var async = require('async');
var dateFormat = require('dateformat');

var outerApiController = {
    /**
     * 회원 가입
     */
    // key pair 생성 OK
    generateKey: function(req, res) {
        var keys = {};
        ecc.randomKey().then(privateKey => {
            var osbPublicKey = ecc.privateToPublic(privateKey, 'OSB');
            keys.privateKey = privateKey;
            keys.publicKey = osbPublicKey;
            res.json({result: true, message: 'Generated Key!!', data: keys});
        }).catch((error) => {
            res.json({result: false, message: 'failed Generate a Key pair.', data: keys});
        });
    },
    
    // 계정 중복 체크 OK
    checkDuplAccount: function(req, res) {
        var account = req.body.account ? req.body.account : '';
        if (account == '') {
            res.json({result: false, message: 'enter account name.', data: {}});
            return;
        }
        outerApiController.getAccount(req, res);
    },

    // contract 계정 조회
    getAccount: function(req, res){
        var Account = req.body.account ? req.body.account : '';
        var datas = {};
        if (Account == '') {
            res.json({result: false, message: 'Invalid account.', data: datas});
            return;
        }

        var locConfig = osbConfig;
        locConfig.keyProvider = config.osbMoPrivateKey;
        const eos = Eos(locConfig);
        
        (async () => {
            var result = null;
            try {
                result = await eos.getAccount(Account);

                if (result) {
                    // ram stake 계산
                    var eos2 = Eos(osbConfig);
                    eos2.getTableRows({
                        json: true,
                        code: 'eosio',
                        scope: 'eosio',
                        table: 'rammarket',
                    }).then(ramResult => {
                        console.dir(ramResult);

                        var ramData = ramResult.rows[0];
                        var quotaBal = ramData.quote.balance.split(' ')[0];
                        var baseBal = ramData.base.balance.split(' ')[0];
                        var perRamPrice = quotaBal / baseBal;
                        result.ram_stake = (result.ram_quota * perRamPrice).toFixed(4);

                        res.json({result: true, message: 'exist', data: result});

                    }).catch(function(error) {
                        res.json({
                            result: false,
                            message: 'error occurred',
                            data: {}
                        });
                    });
                } else {
                    res.json({result: false, message: 'not exist', data: datas});
                }
            } catch (err) {
                res.json({result: false, message: 'not exist', data: datas});
            }
        })();
    },

    // 회원등록 OK
    createAccount: function(req, res) {
        var params = req.body;
        try {
            // check param
            params.memAccount = params.memAccount ? params.memAccount : '';
            var regAcc = /^[a-z1-5+]{12}$/;
            if (!regAcc.test(params.memAccount)) {
                res.json({result: false, message: 'Invalid account.'});
                return;
            }
            params.memPwd = params.memPwd ? params.memPwd : '';
            var regPwd = /^.*(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
            if (!regPwd.test(params.memPwd)) {
                res.json({result: false, message: 'Invalid password.'});
                return;
            }
            params.osbPublicKey = params.osbPublicKey ? params.osbPublicKey : '';
            if (params.osbPublicKey == '') {
                res.json({result: false, message: 'Invalid publickey'});
                return;
            }
            params.memEmail = params.memEmail ? params.memEmail : '';
            var regEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
            if (!regEmail.test(params.memEmail)) {
                res.json({result: false, message: 'Invalid email'});
                return;
            }
            params.agree_1 = params.agree_1 ? params.agree_1 : 'N';
            params.agree_2 = params.agree_2 ? params.agree_2 : 'N';
            if (params.agree_1 != 'Y' || params.agree_2 != 'Y') {
                res.json({result: false, message: 'Invalid agree'});
                return;
            }

            params.memPwd = cryptoUtil.sha256Crypto(params.memPwd);
            
            // EOS 계정 등록 
            var eosjsParamPubKey = 'EOS' + params.osbPublicKey.substring(3, params.osbPublicKey.length);
            
            var locConfig = osbConfig;
            locConfig.keyProvider = config.osbMoPrivateKey;

            var eos = Eos(locConfig);
            eos.transaction(tr => {
                tr.newaccount({
                    creator: config.osbMoAccount,
                    name: params.memAccount,
                    owner: eosjsParamPubKey,
                    active: eosjsParamPubKey
                });
                /** RAM 대신 사주기 */
                tr.buyrambytes({
                    payer : config.osbMoAccount,
                    receiver : params.memAccount,
                    bytes : 4096
                });
                /** CPU, NET 자원 스테이킹 위임 */
                tr.delegatebw({
                    from : config.osbMoAccount,
                    receiver : params.memAccount,
                    stake_cpu_quantity : '0.0200 OSB',
                    stake_net_quantity : '0.0200 OSB',
                    transfer : 0 // 0 빌려주는 거 1 주는거
                });
            }).then(result => {
                // account / publickey 등록
                joinModel.createAccount(params, function(err, crateAccountResult) {
                    if (err) {
                        res.json({result: false, message: 'create account failed.'});
                    } else {
                        // 메일 인증번호 생성 및 DB등록
                        var certificationKey = cryptoRandomString(16);
                        var mailParmas = {
                            'account' : params.memAccount
                            , 'retryKey' : certificationKey
                            , 'homeUrl' : config.homeUrl
                            , userEmail : params.memEmail
                            , emailSubject : 'Account creation is complete!'
                            , emailFormNm : 'mailCreateAccount.html'
                            , explorerUrl : config.explorerUrl
                        }
                        // 공통 인증관련 메일 발송 처리
                        commonController.awsMail(mailParmas);

                        res.json({result: true, message: 'create account OK!!'});
                    }
                });
            }).catch((error) => {
                var jsonErr = JSON.parse(error)
                res.json({result: false, message: jsonErr.error.what});
            });
        } catch (error) {
            res.json({result: false, message: 'error occurred'});
        }
    },

    /**
     * 로그인
     */
    // 로그인 OK
    login: function(req, res) {
        var params = req.body;
        params.memAccount = params.memAccount ? params.memAccount : '';
        if (params.memAccount == '') {
            res.json({result: false, message: 'Invalid account', data: ''});
            return;
        }
        params.memPwd = params.memPwd ? params.memPwd : '';
        if (params.memPwd == '') {
            res.json({result: false, message: 'Invalid password', data: ''});
            return;
        }

        params.memPwd = cryptoUtil.sha256Crypto(params.memPwd);

        loginModel.loginCheck(params, function(err, loginResult) {
            if (err) {
                res.json({result: false, message: 'Error occurred.', data: ''});
            } else {
                if (loginResult.length == 0) {
                    res.json({result: false, message: 'The account name or password is incorrect. Please check again.', data: ''});
                } else {
                    res.json({result: true, message: 'successed', data: loginResult[0].publicKey});
                }
            }
        });
    },
    // check private key
    checkPrivateKey: function(req, res) {
        var account = req.body.account ? req.body.account : '';
        var prvKey = req.body.prvKey ? req.body.prvKey : '';

        if (account == '') {
            res.json({result: false, message: 'Invalid account.'});
            return;
        }
        if (prvKey == '') {
            res.json({result: false, message: 'Invalid privateKey.'});
            return;
        }

        try {
            loginModel.getPublicKey(account, function(err, pubResult) {
                if (err) {
                    res.json({result: false, message: 'search failed.'});
                } else {
                    if (pubResult.length > 0) {
                        var DBpubkey = 'EOS' + pubResult[0].publicKey.substring(3, pubResult[0].publicKey.length);
                        var {PrivateKey} = ecc;
                        try {
                            var abc = PrivateKey.fromWif(prvKey);
                            var ECCpubKey = abc.toPublic().toString();
                            if (ECCpubKey == DBpubkey) {
                                res.json({result: true, message: 'match.'});
                            } else {
                                res.json({result: false, message: 'The account name or private key is incorrect. Please check again.'});
                            }
                        } catch (chekErr) {
                            res.json({result: false, message: 'The account name or private key is incorrect. Please check again.'});
                        }
                    } else {
                        res.json({result: false, message: 'The account name or private key is incorrect. Please check again.'});
                    }
                }
            })
        } catch (error) {
            res.json({result: false, message: 'Error occurred.'});
        }
    },

    /** 전송 */
    // 전송
    transfer: function(req, res) {
        var Account = req.body.account ?  req.body.account : '';
        var sendTo = req.body.sendTo ? req.body.sendTo : '';
        var amount = req.body.amount ? req.body.amount : '0';
        var memo = req.body.memo ? req.body.memo : '';
        var prvkey = req.body.prvkey ? req.body.prvkey : '';
        var chkPwdYn = req.body.chkPwdYn ? req.body.chkPwdYn : 'Y';
        var pwd = req.body.password ? req.body.password : '';

        // check param
        if (Account == '') {
            res.json({result: false, message: 'Invalid account.'});
            return;
        }
        if (sendTo == '') {
            res.json({result: false, message: 'Invalid receive account.'});
            return;
        }
        if (Number(amount) < 0.001) {
            res.json({result: false, message: 'Invalid amount.'});
            return;
        }
        if (memo.length > 256) {
            res.json({result: false, message: 'Invalid memo.(too long)'});
            return;
        }
        if (prvkey == '') {
            res.json({result: false, message: 'Invalid privatekey.'});
            return;
        }
        if (chkPwdYn == 'Y') {
            var chkParam = {};
            pwd = cryptoUtil.sha256Crypto(pwd);
            chkParam.memAccount = Account;
            chkParam.memPwd = pwd;

            loginModel.loginCheck(chkParam, function(err, chkResult) {
                if (err) {
                    res.json({result: false, message: 'Please check the information you entered.'});
                } else {
                    if (chkResult.length == 0) {
                        res.json({result: false, message: 'Invalid password.'});
                    } else {
                        outerApiController.subTransfer(req, res, Account, sendTo, amount, memo, prvkey);
                    }
                }
            });
        } else {
            outerApiController.subTransfer(req, res, Account, sendTo, amount, memo, prvkey);
        }
    },

    subTransfer: function(req, res, Account, sendTo, amount, memo, prvkey) {
        var returnData = {
            result: '',
            message: ''
        };
        (async () => {
            var locConfig = osbConfig;
            locConfig.keyProvider = prvkey;
            const eos = Eos(locConfig);
        
            var result = null;
            try {
                var amtArray = amount.split('.');
                var intAmt = amtArray[0].replace(/[^\d]+/g, '');
                var dotAmt = amtArray[1] ? amtArray[1].padEnd(4, '0') : '0000';
                amount = intAmt + "." + dotAmt;

                result = await eos.transaction({
                    actions: [{
                        account: config.osbTransfer,
                        name: 'transfer',
                        authorization:[{
                            actor: Account,
                            permission: 'active',
                        }],
                        data: {
                            from: Account,
                            to: sendTo,
                            quantity: amount + ' OSB',
                            memo: memo
                        },
                    }]
                }, {
                    blocksBehind: 3,
                    expireInSeconds: 30,
                });
                if (result) {
                    returnData.result = true;
                    returnData.message = "transfer success";
                } else {
                    returnData.result = false;
                    returnData.message = "transfer Failed";
                }
            } catch (err) {
                returnData.result = false;
                returnData.message = "Please check the information you entered.";
            }
            res.json(returnData);
         })();
    },

    /** 전송 내역 */
    // 잔액 조회 getCurrencyBalance
    getCurrencyBalance: function(req, res) {
        var Account = req.body.account ?  req.body.account : '';
        // check param
        if (Account == '') {
            res.json({result: false, message: 'Invalid account.', data: '0'});
            return;
        }

        var returnData = {
            result: '',
            message: '',
            data: '0'
        };

        const eos = Eos(osbConfig);

        (async () => {
            var result = null;
            try {
                result = await eos.getCurrencyBalance(config.osbTransfer, Account);
                if (result) {
                    if (result.length > 0) {
                        var balance = result[0];
                        balance = balance.replace('OSB','').replace(' ','');
                        returnData.result = true;
                        returnData.message = 'OK!!';
                        returnData.data = balance;
                        res.json(returnData);
                    } else {
                        returnData.result = true;
                        returnData.message = 'no balance';
                        returnData.data = '0';
                        res.json(returnData);
                    }
                } else {
                    returnData.result = false;
                    returnData.message = 'no data.';
                    returnData.data = 0;
                    res.json(returnData);
                }
            } catch (err) {
                returnData.result = false;
                returnData.message = 'Error occurred.';
                returnData.data = 0;
                res.json(returnData);
            }
        })();
    },
    // 내역
    getActions: function(req, res) {
        const eos = Eos(osbConfig);
        var Account = req.body.account ?  req.body.account : '';
        var timezoneoffset = req.body.timezoneoffset ? req.body.timezoneoffset : '';

        // check param
        if (Account == '') {
            res.json({result: false, message: 'Invalid account.', data: []});
            return;
        }
        if (timezoneoffset == '') {
            res.json({result: false, message: 'Invalid timezoneoffset.', data: []});
            return;
        }

        var returnData = {
            result: '',
            message: '',
            data: []
        };

        (async () => {
            var result = null;
            try {
                var transactions = [];
                var arrTran = [];
                result = await eos.getActions(Account, -1, -2000);
                if (result) {
                    if (result.actions.length > 0) {
                        var actions = result.actions;
                        actions.forEach(function (el, i) {

                            var trx_id = el.action_trace.trx_id;
                            var block_num = el.action_trace.block_num;
                            var block_time = el.action_trace.block_time;
                            var action_trace = el.action_trace.act;
                            if (action_trace.name.indexOf('claim') < 0) {
                                var nodeDate = new Date(block_time);
                                nodeDate.setHours(nodeDate.getHours() + parseInt(timezoneoffset));
                                var timezonedate = dateFormat(nodeDate, "mmm-dd-yyyy, h:MM:ss TT");                        
                                var data = action_trace.data;
                                var from = data.from;
                                var to = data.to;
                                var memo = data.memo;
                                // var quantity = data.quantity.replace('OSB','').replace(' ','');;

                                var quantity = "";
                                switch(action_trace.name) {
                                    case 'transfer' : 
                                        quantity = data.quantity.replace('OSB','').replace(' ','');
                                        break;
                                    case 'buyram' :
                                        quantity = data.quant.replace('OSB','').replace(' ','');
                                        break;
                                    case 'delegatebw' :
                                        quantity = data.stake_cpu_quantity.replace('OSB','').replace(' ','');
                                        // quantity += ", stake_cpu_quantity : " + data.stake_cpu_quantity.replace('OSB','').replace(' ','');
                                        break;
                                    default : 
                                        quantity = "0";
                                        break;
                                }

                                var transfer_type = "Sent";
                                if (to === Account) {
                                    if (action_trace.name == 'transfer') {
                                        transfer_type = "Received";
                                    } else {
                                        transfer_type = action_trace.name;
                                    }
                                }

                                var tran_info = [
                                    trx_id,
                                    block_num,
                                    timezonedate,
                                    from,
                                    to,
                                    memo,
                                    quantity,
                                    transfer_type
                                ];
                                
                                if (!arrTran.includes(trx_id)) {
                                    transactions.push(tran_info);
                                    arrTran.push(trx_id);
                                }
                            } else {
                                console.dir(el);
                            }
                        })
                        transactions.reverse();

                        returnData.result = true;
                        returnData.message = 'OK!!';
                        returnData.data = transactions;
                        res.json(returnData);
                    } else {
                        returnData.result = false;
                        returnData.message = "no data";
                        returnData.data = [];
                        res.json(returnData);
                    }
                } else {
                    returnData.result = false;
                    returnData.message = "no data"
                    returnData.data = [];
                    res.json(returnData);
                }
            } catch (err) {
                returnData.result = false;
                returnData.message = "Error occurred.";
                returnData.data = [];
                res.json(returnData);
            }
        })();
    },

    /** 비밀번호 찾기 */
    // 비밀번호변경 인증메일 발송
    forgotPasswordMail: function(req, res) {
        var params = req.body;
        params.account = params.account ? params.account : '';
        params.email = params.email ? params.email : '';
        // check param
        if (params.account == '') {
            res.json({result: false, message: 'Invalid account.'});
            return;
        }
        var regEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        if (!regEmail.test(params.email)) {
            res.json({result: false, message: 'Invalid email'});
            return;
        }

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

                            res.json({result: true, message: 'create account OK!!'});
                        }
                    });
                    
                } else {
                    res.json({result: false, message: 'Account name and email address do not match. Please check again.'});
                }
            }
        });
    },

    /** 락업 */
    // 락업 내역
    getLockupTransactions: function(req, res) {
        var params = req.body;
        var Account = params.account ? params.account : '';
        // check param
        if (Account == '') {
            res.json({result: false, message: 'Invalid account.', data: [], totalToken: '0.0000'});
            return;
        }

        const eos = Eos(osbConfig);
        (async () => {
            eos.getTableRows({
                json: true,
                code: config.lockupContract,
                scope: config.lockupContract,
                table: 'lockup',
                // table_key: "getreceiver",   // secondary index 사용  // 숫자만으로 이루어진 계정인 경우 조회가 되지 않음...
                // lower_bound: Account,       // secondary index 사용
                // upper_bound: Account,       // secondary index 사용
                // key_type: "i64",            // secondary index 사용
                // index_position: 2,           // secondary index 사용
                limit: 40000
            }).then(result => {
                if (!result) {
                    res.json({
                        result: false,
                        message: 'error occurred',
                        data: [],
                        totalToken: '0.0000'
                    });
                } else {
                    var dataList = [];
                    var lockupToken = parseFloat('0');
                    for (var i = 0; i < result.rows.length; i++) {
                        if (Account == result.rows[i].receiver) {
                            var transBeginDate = new Date(result.rows[i].lock_begin * 1000);
                            // transBeginDate.setHours(transBeginDate.getHours() + parseInt('9'));
                            var beginDate = dateFormat(transBeginDate, "mmm-dd-yyyy, h:MM:ss TT")
                            result.rows[i].lock_begin = beginDate;
                            
                            var transEndDate = new Date(result.rows[i].lock_end * 1000);
                            // transEndDate.setHours(transEndDate.getHours() + parseInt('9'));
                            var endDate = dateFormat(transEndDate, "mmm-dd-yyyy, h:MM:ss TT")
                            result.rows[i].lock_end = endDate;

                            var token = result.rows[i].token.replace(' OSB','');
                            result.rows[i].token = token;
                            lockupToken = lockupToken + parseFloat(token);

                            dataList.push(result.rows[i]);
                        }
                    }

                    dataList.sort(function(a, b) {
                        a = new Date(a.lock_end);
                        b = new Date(b.lock_end);
                        return a > b ? 1 : a < b ? -1 : 0;
                    });

                    res.json({
                        result: true,
                        message: 'success',
                        data: dataList,
                        totalToken: lockupToken.toFixed(4)
                    });
                }
            }).catch(function(error) {
                res.json({
                    result: false,
                    message: 'error occurred',
                    data: [],
                    totalToken: '0.0000'
                });
            });
        })();
    },
    // lockup 토큰 unlock 
    claimUnlockup: function(req, res) {
        var params = req.body;
        var Account = params.account ? params.account : '';
        var prvKey = params.prvkey ? params.prvkey : '';
        // check param
        if (Account == '') {
            res.json({result: false, message: 'Invalid account.'});
            return;
        }
        if (prvKey == '') {
            res.json({result: false, message: 'Invalid privateKey.'});
            return;
        }

        const eos = Eos(osbConfig);
        eos.transaction({
            actions: [{
                account: config.lockupContract,
                name: "claimall",  // claim: 개별, claimall: 일괄
                authorization: [{
                    actor: Account,
                    permission: "active"
                }],
                data: {
                    receiver: Account,
                    // 개별 claim인 경우: no 필요
                }
            }]
        }
        , {
            keyProvider: prvKey
        }).then(result => {
            if (result) {
                res.json({result: true, message: 'claim success'});
            } else {
                res.json({result: false, message: 'claim faile'});
            }
        }).catch(function(error) {
            res.json({result: false, message: 'error occurred'});
        });
    },

}

module.exports = outerApiController;