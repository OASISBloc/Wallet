const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');
const joinModel = require('../model/joinModel');
const cryptoUtil = require('../util/crypto');
const ecc = require('eosjs-ecc');
const request = require('request');
const cryptoRandomString = require('crypto-random-string');
const dateFormat = require('dateformat');
const apiController = require('../controller/apiController');
const commonController = require('../controller/commonController');

// Added by wschoi
function sleep(t) {

    return new Promise(resolve=>setTimeout(resolve,t));

}

var joinController = {
    realCreateAccount: function (req, res){
        var params = req.body;
        params.agree_1 = params.agree_1 == 'on' ? 'Y' : 'N';
        params.agree_2 = params.agree_2 == 'on' ? 'Y' : 'N';
        params.memPwd = cryptoUtil.sha256Crypto(params.memPwd);

        var locConfig = osbConfig;
        locConfig.keyProvider = config.osbMoPrivateKey;
        var rpc = new JsonRpc(locConfig.httpEndpoint, { fetch });
        var signatureProvider = new JsSignatureProvider([config.osbMoPrivateKey]);
        var api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
        var Account = req.session.account ?  req.session.account.account : '';

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
                        res.json({result: true, rtnDatas: params});
                        setTimeout(function(){  
                            try {
                                result = rpc.get_account(params.memAccount);
                                console.log("result=>" + result);
                                if(result) {
                                    // account / publickey 등록
                                    joinModel.createAccount(params, function(err, crateAccountResult) {
                                        if (err) {
                                            console.log("error=>" + err);
                                            // res.json({result: false, message: 'create account failed.'});
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
                                            // res.json({result: true, rtnDatas: params, message: 'create account OK!!'});
                                        }
                                    });
                                }
                            } catch(err) {
                                console.log("err1===" +err);
                                // res.json({result: false, message: 'create account failed.'});
                            }
                        },60000);
                    })();
                });
            })();
        }catch(e){
            console.log("newaccount error:" + e);
        }
    },

//     realCreateAccount: function(req, res) {
//         var params = req.body;
//         params.agree_1 = params.agree_1 == 'on' ? 'Y' : 'N';
//         params.agree_2 = params.agree_2 == 'on' ? 'Y' : 'N';
//         params.memPwd = cryptoUtil.sha256Crypto(params.memPwd);
//
//         // EOS 계정 등록
//         var eosjsParamPubKey = 'EOS' + params.osbPublicKey.substring(3, params.osbPublicKey.length);
//
//         var locConfig = osbConfig;
//         locConfig.keyProvider = config.osbMoPrivateKey;
//
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
//                 bytes : 4096 //4096
//             });
//             /** CPU, NET 자원 스테이킹 위임 */
//             tr.delegatebw({
//                 from: config.osbMoAccount,
//                 receiver: params.memAccount,
//                 stake_cpu_quantity: '0.0020 OSB',
//                 stake_net_quantity: '0.0020 OSB',
//                 transfer: 0 // 0 빌려주는 거 1 주는거
//             });
//         }).then(result =>{
//
//             (async () => {
//                 var result = null;
//
//                 // Added by wschoi
//                 await sleep(2000);
//
//                 try {
//                     result = await eos.getAccount(params.memAccount);
// console.log("result=>" + result);
//                     if(result) {
//                         // account / publickey 등록
//                         joinModel.createAccount(params, function(err, crateAccountResult) {
//                             if (err) {
// console.log("error=>" + err);
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
// console.log("after awsmail send===");
//                                 res.json({result: true, rtnDatas: params, message: 'create account OK!!'});
//                             }
//                         });
//                     }
//                 } catch(err) {
//
//                     console.log("err1===" +err);
//                     res.json({result: false, message: 'create account failed.'});
//
//                 }
//             })();
//
//         }).catch((error) => {
//             console.log("error2=" + error);
//             res.json({result: false, message: 'create account failed.'});
//         });
//     },
    // key pair 생성
    generateKey: function(req, res) {
        ecc.randomKey().then(privateKey => {
            var osbPublicKey = ecc.privateToPublic(privateKey, 'OSB');
            var keys = {'privateKey': privateKey, 'publicKey': osbPublicKey};
            res.json({result: true, keyPair: keys, message: 'Generated Key!!'});
        })
    },

    // 계정 중복 체크
    checkDuplAccount: function(req, res) {
        console.log("checkDuplAccount in..");
        try{
            var account = req.body.account;
            apiController.getAccountInfo(account, res);
        }catch (e) {
            console.log("checkDuplAccount error:" + e);
        }
    },

    // 회원등록
    createAccount: function(req, res) {
        var body = req.body;

        // 서비스 페이지 외에서 접근 방지
        var oriUrl = req.originalUrl;
        var reqHost = req.get('host');
        var referer = req.get('Referer') ? req.get('Referer') : '';

        // console.log("url ::" + oriUrl);
        // console.log("reqHost ::" + reqHost);
        // console.log("referer ::" + referer);

        if (oriUrl != "/createAccountAjax" || reqHost.indexOf(config.checkHost) < 0 || referer == '') {
            res.json({"result": false, "type": 'host', "message": "Invalid host"});
            return;
        }

        if (body.captchakind == 're') {
            var verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${config.recaptchaSecret}&response=${body.recaptcha}`;

            request(verificationURL, function(err, response, result) {
                result = JSON.parse(result);
                if (result.success !== undefined && !result.success) {
                    res.json({"result" : false, "type": "reCaptcha", "message" : "Check the box for reCAPTCHA."});
                } else {
                    joinController.realCreateAccount(req, res);
                }
            });
        } else if (body.captchakind == 'slider') {
            joinController.realCreateAccount(req, res);
        } else {
            res.json({"result" : false, "type": "captchaKind", "message" : "Invalid captcha."});
        }

    },

    // 스캐터 계정등록
    createScatterAccount: function(req, res) {
        try {
            var moParams = req.body;
            // console.log("============== jsonParam :: " + JSON.stringify(moParams));
            var jsonParam = JSON.stringify(moParams);
            var subParam = jsonParam.substring(2, jsonParam.length - 5);
            // console.log("============== subParam :: " + subParam.replace(/\\/g,''));
            var params = JSON.parse(subParam.replace(/\\/g,''));

            console.log("============== createScatterAccount osbPublicKey :: " + params.osbPublicKey);
            console.log("============== createScatterAccount memAccount :: " + params.memAccount);

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
                 })
             }).then(result => {
                res.json(result);

             }).catch((error) => {
                 console.log(error);
                 res.json({result: false, message: 'create account failed.'});
             });
        } catch(err) {
            console.log(err);
            res.json({result: false, message: 'parameter is invalid.'})
        }

    }

};

module.exports = joinController;
