const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const { TextEncoder, TextDecoder } = require('util');
const joinModel = require('../model/joinModel');
const loginModel = require('../model/loginModel');
const tokenModel = require("../model/tokenModel");
const ecc = require('eosjs-ecc');
const Eos = require('eosjs');
const fetch = require('node-fetch');      
const cryptoUtil = require('../util/crypto');
const cryptoRandomString = require('crypto-random-string');
const commonController = require('../controller/commonController');
var async = require('async');
var dateFormat = require('dateformat');
const fs = require('fs');
const cryptoJS = require("crypto-js");

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
        outerApiController.getAccountInfo(req, res);
    },

    // contract 계정 조회
    getAccountInfo: function(req, res){
        try{
            var locConfig = osbConfig;
            locConfig.keyProvider = config.osbMoPrivateKey;

            var rpc = new JsonRpc(locConfig.httpEndpoint, { fetch });
//          const eos = Eos(locConfig);
            var account = req.body.account ? req.body.account : '';
            (async () => {
                var result = null;
                if(account !==''){
                    try{
                        result = await rpc.get_account(account);
                        if(result){
                            res.json({result: true, data: result});
                        }
                    }catch(err){
                        res.json({result: false});
                    }
                }
            })();
        }catch (e) {
            console.log("getAccount error:" + e);
        }
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
    // createAccount: function(req, res) {
    //     var params = req.body;
    //     try {
    //         // check param
    //         params.memAccount = params.memAccount ? params.memAccount : '';
    //         var regAcc = /^[a-z1-5+]{12}$/;
    //         if (!regAcc.test(params.memAccount)) {
    //             res.json({result: false, message: 'Invalid account.'});
    //             return;
    //         }
    //         params.memPwd = params.memPwd ? params.memPwd : '';
    //         var regPwd = /^.*(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
    //         if (!regPwd.test(params.memPwd)) {
    //             res.json({result: false, message: 'Invalid password.'});
    //             return;
    //         }
    //         params.osbPublicKey = params.osbPublicKey ? params.osbPublicKey : '';
    //         if (params.osbPublicKey == '') {
    //             res.json({result: false, message: 'Invalid publickey'});
    //             return;
    //         }
    //         params.memEmail = params.memEmail ? params.memEmail : '';
    //         var regEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    //         if (!regEmail.test(params.memEmail)) {
    //             res.json({result: false, message: 'Invalid email'});
    //             return;
    //         }
    //         params.agree_1 = params.agree_1 ? params.agree_1 : 'N';
    //         params.agree_2 = params.agree_2 ? params.agree_2 : 'N';
    //         if (params.agree_1 != 'Y' || params.agree_2 != 'Y') {
    //             res.json({result: false, message: 'Invalid agree'});
    //             return;
    //         }

    //         params.memPwd = cryptoUtil.sha256Crypto(params.memPwd);
            
    //         // EOS 계정 등록 
    //         var eosjsParamPubKey = 'EOS' + params.osbPublicKey.substring(3, params.osbPublicKey.length);
            
    //         var locConfig = osbConfig;
    //         locConfig.keyProvider = config.osbMoPrivateKey;

    //         var eos = Eos(locConfig);
            
    //         eos.transaction(tr => {
    //             tr.newaccount({
    //                 creator: config.osbMoAccount,
    //                 name: params.memAccount,
    //                 owner: eosjsParamPubKey,
    //                 active: eosjsParamPubKey
    //             });
    //             /** RAM 대신 사주기 */
    //             tr.buyrambytes({
    //                 payer : config.osbMoAccount,
    //                 receiver : params.memAccount,
    //                 bytes : 3400//4096
    //             });
    //             /** CPU, NET 자원 스테이킹 위임 */
    //             tr.delegatebw({
    //                 from : config.osbMoAccount,
    //                 receiver : params.memAccount,
    //                 stake_cpu_quantity : '0.0020 OSB',
    //                 stake_net_quantity : '0.0020 OSB',
    //                 transfer : 0 // 0 빌려주는 거 1 주는거
    //             });
    //         }).then(result => {

    //             (async () => {
    //                 var result = null;
    //                 try {
    //                     result = await eos.getAccountInfo(params.memAccount);
    //                     if(result) {
    //                         // account / publickey 등록
    //                         joinModel.createAccount(params, function(err, crateAccountResult) {
    //                             if (err) {
    //                                 res.json({result: false, message: 'create account failed.'});
    //                             } else {
    //                                 // 메일 인증번호 생성 및 DB등록
    //                                 var certificationKey = cryptoRandomString(16);
    //                                 var mailParmas = {
    //                                     'account' : params.memAccount
    //                                     , 'retryKey' : certificationKey
    //                                     , 'homeUrl' : config.homeUrl
    //                                     , userEmail : params.memEmail
    //                                     , emailSubject : 'Account creation is complete!'
    //                                     , emailFormNm : 'mailCreateAccount.html'
    //                                     , explorerUrl : config.explorerUrl
    //                                 }
    //                                 // 공통 인증관련 메일 발송 처리
    //                                 commonController.awsMail(mailParmas);
        
    //                                 res.json({result: true, message: 'create account OK!!'});
    //                             }
    //                         });
    //                     }
    //                 } catch(err) {
    //                     eos.transaction(tr => {
    //                         tr.newaccount({
    //                             creator: config.osbMoAccount,
    //                             name: params.memAccount,
    //                             owner: eosjsParamPubKey,
    //                             active: eosjsParamPubKey
    //                         });
    //                         /** RAM 대신 사주기 */
    //                         tr.buyrambytes({
    //                             payer : config.osbMoAccount,
    //                             receiver : params.memAccount,
    //                             bytes : 3400//4096
    //                         });
    //                         /** CPU, NET 자원 스테이킹 위임 */
    //                         tr.delegatebw({
    //                             from : config.osbMoAccount,
    //                             receiver : params.memAccount,
    //                             stake_cpu_quantity : '0.0020 OSB',
    //                             stake_net_quantity : '0.0020 OSB',
    //                             transfer : 0 // 0 빌려주는 거 1 주는거
    //                         });
    //                     }).then(result => {
    //                         // account / publickey 등록
    //                         joinModel.createAccount(params, function(err, crateAccountResult) {
    //                             if (err) {
    //                                 res.json({result: false, message: 'create account failed.'});
    //                             } else {
    //                                 // 메일 인증번호 생성 및 DB등록
    //                                 var certificationKey = cryptoRandomString(16);
    //                                 var mailParmas = {
    //                                     'account' : params.memAccount
    //                                     , 'retryKey' : certificationKey
    //                                     , 'homeUrl' : config.homeUrl
    //                                     , userEmail : params.memEmail
    //                                     , emailSubject : 'Account creation is complete!'
    //                                     , emailFormNm : 'mailCreateAccount.html'
    //                                     , explorerUrl : config.explorerUrl
    //                                 }
    //                                 // 공통 인증관련 메일 발송 처리
    //                                 commonController.awsMail(mailParmas);
        
    //                                 res.json({result: true, message: 'create account OK!!'});
    //                             }
    //                         });
    //                     }).catch((error) => {
    //                         var jsonErr = JSON.parse(error)
    //                         res.json({result: false, message: jsonErr.error.what});
    //                     });
    //                 }
    //             })();
                
    //         }).catch((error) => {
    //             var jsonErr = JSON.parse(error)
    //             res.json({result: false, message: jsonErr.error.what});
    //         });
    //     } catch (error) {
    //         res.json({result: false, message: 'error occurred'});
    //     }
    // },

    createAccount: function(req, res) {
        var params = req.body;
        // check param
        params.memAccount = params.memAccount ? params.memAccount : '';
        params.agree_1 = params.agree_1 == 'on' ? 'Y' : 'N';
        params.agree_2 = params.agree_2 == 'on' ? 'Y' : 'N';
        params.memPwd = cryptoUtil.sha256Crypto(params.memPwd);

        var locConfig = osbConfig;
        locConfig.keyProvider = config.osbMoPrivateKey;
        var rpc = new JsonRpc(locConfig.httpEndpoint, { fetch });
        var signatureProvider = new JsSignatureProvider([config.osbMoPrivateKey]);
        var api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

        console.log("params.osbPublicKey:" + params.osbPublicKey);
        console.log("config.osbMoAccount:" + config.osbMoAccount);
        try{
            (async () => {
                await api.transact({
                    actions: [{
                        account: 'eosio',
                        name: 'newaccount',
                        authorization: [{
                            actor: config.osbMoAccount,
                            permission: 'active',
                        }],
                        data: {
                            creator: config.osbMoAccount,
                            name: params.memAccount,
                            owner: {
                                threshold: 1,
                                keys: [{
                                    key: params.osbPublicKey,
                                    weight: 1
                                }],
                                accounts: [],
                                waits: []
                            },
                            active: {
                                threshold: 1,
                                keys: [{
                                    key: params.osbPublicKey,
                                    weight: 1
                                }],
                                accounts: [],
                                waits: []
                            },
                        },
                    },
                        {
                            account: 'eosio',
                            name: 'buyrambytes',
                            authorization: [{
                                actor: config.osbMoAccount,
                                permission: 'active',
                            }],
                            data: {
                                payer: config.osbMoAccount,
                                receiver: params.memAccount,
                                bytes: 4096,
                            },
                        },
                        {
                            account: 'eosio',
                            name: 'delegatebw',
                            authorization: [{
                                actor: config.osbMoAccount,
                                permission: 'active',
                            }],
                            data: {
                                from: config.osbMoAccount,
                                receiver: params.memAccount,
                                stake_net_quantity: '0.0020 OSB',
                                stake_cpu_quantity: '0.0020 OSB',
                                transfer: false,
                            }
                        }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 30,
                }).then(result => {
                    (async () => {
                        var result = null;

                        // Added by wschoi
                        // await sleep(2000);

                        try {
                            result = await rpc.get_account(params.memAccount);
                            console.log("result=>" + result);
                            if(result) {
                                // account / publickey 등록
                                joinModel.createAccount(params, function(err, crateAccountResult) {
                                    if (err) {
                                        console.log("error=>" + err);
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
                                        console.log("after awsmail send===");
                                        res.json({result: true, rtnDatas: params, message: 'create account OK!!'});
                                    }
                                });
                            }
                        } catch(err) {

                            console.log("err1===" +err);
                            res.json({result: false, message: 'create account failed.'});

                        }
                    })();
                });
            })();
        }catch(e){
            console.log("newaccount error:" + e);
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
    transfer: function(req, res){
        try{
            var Account = req.body.account ?  req.body.account : '';
            var sendTo = req.body.sendTo ? req.body.sendTo : '';
            var amount = req.body.amount ? req.body.amount : '';
            var memo = req.body.memo ? req.body.memo : '';
            var key = req.body.prvkey ? req.body.prvkey : '';
            //var key = "U2FsdGVkX1/DjjMDHuufsBJ71l56c3BkXbRlQrhYR3rPG90NfCx0C69mhq+/l4ipCPPHiOy95lyThvMKJKhytgiikWppluSpv6usgoR8eyQ=";
            var symbol = req.body.symbol ? req.body.symbol : '';
            console.log("sendTo:" + sendTo);
            console.log("amount:" + amount);
            console.log("memo:" + memo);
            console.log("key:" + key);
            console.log("symbol:" + symbol);

            var returnData = {
                result: ''
            };

            // var contents = fs.readFileSync('/Users/dc/.tmp/pastday/mealworm/loveheart', 'utf8');
            // // var contents = fs.readFileSync('/home/dc-server1/.tmp/pastday/mealworm/loveheart', 'utf8');
            // var iv = contents
            
            // iv = Buffer.from(iv, 'base64').toString();
            // console.log('iv' + iv);
            // // iv = cryptoJS.enc.Base64.parse(iv);

            // // console.log('key' + key);
            // var prvkey = cryptoJS.AES.decrypt(key, cryptoJS.enc.Base64.parse(iv), {
            //     mode: cryptoJS.mode.CBC,
            //     padding: cryptoJS.pad.Pkcs7
            // });
            
            var tmp = key.split("*");
            
            var salt = cryptoJS.enc.Utf8.parse("20140401");
            // var password = fs.readFileSync('/Users/dc/.tmp/pastday/mealworm/loveheart', 'utf8').toString();
            var password = fs.readFileSync('/home/dc-server1/.tmp/pastday/mealworm/loveheart', 'utf8').toString();
            password = password.replace('\n', '');
            var keyBits = cryptoJS.PBKDF2(password, salt, {
                hasher: cryptoJS.algo.SHA1,
                keySize: 8,
                iterations: 2048
            });

            var iv = cryptoJS.enc.Base64.parse(tmp[0]); // password를 encrypt secret
            var decrypted = cryptoJS.AES.decrypt(tmp[1], keyBits, {
                iv: iv,
                padding: cryptoJS.pad.Pkcs7,
                mode: cryptoJS.mode.CBC
            });

            var prvkey = decrypted.toString(cryptoJS.enc.Utf8);
            console.log("prvkey decrypt = " + prvkey);

            var locConfig = osbConfig;
            var rpc = new JsonRpc(locConfig.httpEndpoint, { fetch });
            var signatureProvider = new JsSignatureProvider([prvkey]);
            var api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

            (async () => {
                if(sendTo !== '' && amount !== '' && prvkey !== '' && Account !== ''){
                    try{
                        var amtArray = amount.split('.');
                        var intAmt = amtArray[0].replace(/[^\d]+/g, '');
                        var dotAmt = amtArray[1] ? amtArray[1].padEnd(4, '0') : '0000';
                        amount = intAmt + "." + dotAmt;
                        amount = amount + " " + symbol;
                        const result = await api.transact({
                            actions: [{
                                account: config.osbTransfer,
                                name: 'transfer',
                                authorization: [{
                                    actor: Account,
                                    permission: 'active',
                                }],
                                data: {
                                    from: Account,
                                    to: sendTo,
                                    quantity: amount,
                                    memo: memo,
                                },
                            }]
                        }, {
                            blocksBehind: 3,
                            expireSeconds: 30,
                        });
                        //console.dir(result);
                        if(result){
                            returnData.result = true;
                            console.dir(result);
                        }else{
                            returnData.result = false;
                        }
                    }catch(err){
                        console.log("transfer error:" + err);
                        returnData.result = false;
                    }
                }else{
                    returnData.result = false;
                }
                //console.log(result);
                res.json(returnData);
            })();
        }catch (e) {
            console.log("transfer error:" + e);
        }
    },

    /** 전송 내역 */
    // 잔액 조회 getMyTokenBalance
    getMyTokenBalance: function(req, res) {
        var Account = req.body.account ? req.body.account : '';
        var returnData = {
            result: '',
            message: '',
            data: '',
            sessionAccount: Account
        };
        
        var locConfig = osbConfig;
        var rpc = new JsonRpc(locConfig.httpEndpoint, { fetch });
        (async () => {
            var result = null;
            if(Account !==''){
                try{
                    result = await rpc.get_table_rows({
                        json: true,               // Get the response as json
                        code: 'osbio.token',      // Contract that we target
                        scope: Account,         // Account that owns the data
                        table: 'accounts',        // Table name
                        limit: 10,                // Maximum number of rows that we want to get
                        reverse: false,           // Optional: Get reversed data
                        show_payer: false          // Optional: Show ram payer
                    });
                    var balanceData = {
                        osbBalance: 0.0000,
                        sOsbBalance: 0.0000,
                        craBalance: 0.0000
                    };
                    if(result){
                        var osbBalance = 0.0000;
                        var sOsbBalance = 0.0000;
                        var craBalance = 0.0000;
                        if(result.rows.length == 0){
                            returnData.result = true;
                            returnData.data = balanceData;
                            returnData.message = "잔액조회 데이터가 없습니다.";
                            res.json(returnData);
                        }else{
                            result.rows.forEach(function(el, i){
                                var balances = [];
                                balances = el.balance.split(' ');
                                console.log("balances============" + balances[0] + balances[1]);
                                if(balances[1] == 'OSB'){
                                    osbBalance = el.balance;
                                    balanceData.osbBalance = osbBalance.replace('OSB','').replace(' ','');
                                }else if(balances[1] == 'SOSB'){
                                    sOsbBalance = el.balance;
                                    balanceData.sOsbBalance = sOsbBalance.replace('SOSB','').replace(' ','');
                                }else if(balances[1] == 'CRA'){
                                    craBalance = el.balance;
                                    balanceData.craBalance = craBalance.replace('CRA','').replace(' ','');
                                }
                            })
                            returnData.result = true;
                            returnData.data = balanceData;
                            returnData.message = "잔액조회가 정상적으로 실행되었습니다.";
                            res.json(returnData);
                        }
                        console.log("osbBalance= " + balanceData.osbBalance);
                        console.log("sObBalance= " + balanceData.sOsbBalance);
                        console.log("craBalance= " + balanceData.craBalance);
                    }else{
                        returnData.result = false;
                        returnData.message = "잔액조회에 실패하였습니다.";
                        res.json(returnData);
                    }
                }catch(err){
                    console.log("err in cont ==>" + err);
                    returnData.result = false;
                    returnData.message = "잔액조회에 실패하였습니다.";
                    res.json(returnData);
                }
            }else{
                returnData.result = false;
                returnData.message = "잔액조회에 실패하였습니다.";
                res.json(returnData);
            }
        })();
    },
    // 내역
    getActions: function(req, res) {
        try{
            var locConfig = osbConfig;
            var rpc = new JsonRpc(locConfig.httpEndpoint, { fetch });
            var Account = req.body.account ?  req.body.account : '';
            var timezoneoffset = req.body.timezoneoffset;
            var pos = req.body.pos ? req.body.pos : 0;
            console.log("received pos:" + pos);
            var symbol = req.body.symbol ? req.body.symbol : '';

            var returnData = {
                result: '',
                data: '',
                pos: ''
            };

            (async () => {
                var result = null;
                var preResult = null;
                if(Account !==''){
                    try{
                        var transactions = [];
                        var arrTran = [];
                        preResult = await rpc.history_get_actions(Account, -1, -1);
                        if (preResult.actions.length == 0 ) { 
                            returnData.result = true;
                            returnData.data = "no data"
                            returnData.pos = pos;
                            res.json(returnData);
                            return;
                        }
                        var maxNum = preResult.actions[0].account_action_seq;
                        pos = (pos == 0) ? maxNum : pos;
                        var transactions = [];
                        var arrTran = [];
                        //pos = maxNum + 1;
                        var limit = 0;
                        result = await rpc.history_get_actions(Account, pos, -100);
                        if(result){
                            //console.log("result.actions.length" + result.actions.length);
                            if(result.actions.length >0) {
                                result.actions.forEach(function(el, i){
                                    //console.log("account_action_seq==>" + el.account_action_seq);
                                    var jStr = JSON.stringify(result.actions);
                                    var trx_id = el.action_trace.trx_id;
                                    var block_num = el.action_trace.block_num;
                                    var block_time = el.action_trace.block_time;

                                    var action_trace = el.action_trace.act;
                                    var symbols = [];
                                    if (action_trace.data.quantity != null) {
                                        symbols = action_trace.data.quantity.split(' ');
                                    }
                                    var resultSymbol = symbols[1];
                                    
                                    if (el.action_trace.act.name == 'transfer' && resultSymbol == symbol && symbol != '') {
                                        console.log("action_trace.name:" + action_trace.name);
                                        console.log("resultSymbol=" + resultSymbol);
                                        console.log("symbol=" + symbol);
                                        block_time = dateFormat(block_time, "mmm-dd-yyyy, hh:MM:ss TT Z");
                                        var nodeDate = new Date(block_time);
                                        nodeDate.setHours(nodeDate.getHours() + parseInt(timezoneoffset));
                                        var timezonedate = dateFormat(nodeDate, "mmm-dd-yyyy, h:MM:ss TT");

                                        var data = action_trace.data;
                                        // from, to, memo, quantity
                                        var from = data.from;
                                        var to = data.to;
                                        var memo = data.memo;
                                        var quantity = data.quantity.replace(resultSymbol, '').replace(' ', '');
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
                                            transfer_type,
                                            symbol,
                                        ];

                                        if (!arrTran.includes(trx_id)) {
                                            transactions.push(tran_info);
                                            arrTran.push(trx_id);
                                            limit++;
                                        }
                                    } else if (el.action_trace.act.name == 'transfer' && symbol == ''){
                                        console.log("action_trace.name:" + action_trace.name);
                                        console.log("resultSymbol=" + resultSymbol);
                                        console.log("symbol=" + symbol);
                                        block_time = dateFormat(block_time, "mmm-dd-yyyy, hh:MM:ss TT Z");
                                        var nodeDate = new Date(block_time);
                                        nodeDate.setHours(nodeDate.getHours() + parseInt(timezoneoffset));
                                        var timezonedate = dateFormat(nodeDate, "mmm-dd-yyyy, h:MM:ss TT");

                                        var data = action_trace.data;
                                        // from, to, memo, quantity
                                        var from = data.from;
                                        var to = data.to;
                                        var memo = data.memo;
                                        var quantity = data.quantity.replace(resultSymbol, '').replace(' ', '');

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
                                            transfer_type,
                                            resultSymbol
                                        ];

                                        if (!arrTran.includes(trx_id)) {
                                            transactions.push(tran_info);
                                            arrTran.push(trx_id);
                                            limit++;
                                        }
                                    }
                                    pos -= 1;
                                });
                            }else{
                                returnData.result = false;
                                returnData.data = "no data"
                                returnData.pos = pos;
                                res.json(returnData);
                            }
                        }
                        transactions.reverse();

                        returnData.result = true;
                        returnData.data = transactions;
                        returnData.pos = pos;
                        //console.log("returnData.pos" + returnData.pos);
                        res.json(returnData);

                    }catch(err){
                        console.log("error=>" + err);
                        returnData.result = false;
                        returnData.data = err.message;
                        res.json(returnData);
                    }
                }else{
                    returnData.result = false;
                    returnData.data = "Nothing"
                    res.json(returnData);
                }
            })();
        }catch (e) {
            console.log("getActions error:" + e);
        }
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
    // 토큰 리스트 출력
    searchTokenList: function(req, res){
        var returnData = {
            result: '',
            data : '',
        }
        var params = {
            searchKeyword : ''
        }
        const result = tokenModel.searchTokens(params, function(err, searchTokensResult){
            try{
                if(searchTokensResult.length == 0){
                    returnData.result = false;
                    res.json(returnData);
                }else{
                    returnData.result = true;
                    var symbols = [];
                    searchTokensResult.forEach(function(el, i){
                        symbols.push(el.symbol);
                    });
                    returnData.data = symbols;
                    res.json(returnData);
                }
            }catch (e) {
                console.log("searchTokens err:" + e);
            }
        })
    },
}

module.exports = outerApiController;