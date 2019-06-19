const joinModel = require('../model/joinModel');
const ecc = require('eosjs-ecc');
const Eos = require('eosjs');
const cryptoUtil = require('../util/crypto');
const cryptoRandomString = require('crypto-random-string');
const commonController = require('../controller/commonController');
const apiController = require('../controller/apiController');
const logger = require('../util/logger');

var joinController = {
    // key pair 생성
    generateKey: function(req, res) {
        logger.debug(`call generateKey`);

        ecc.randomKey().then(privateKey => {
            var osbPublicKey = ecc.privateToPublic(privateKey, 'OSB');
            var keys = {'privateKey': privateKey, 'publicKey': osbPublicKey};
            ogger.debug(`generateKey Keys :: ${JSON.stringify(keys)}`);
            res.json({result: true, keyPair: keys, message: 'Generated Key!!'});
        })
    },
    
    // 계정 중복 체크
    checkDuplAccount: function(req, res) {
        var account = req.body.account;
        logger.debug(`call checkDuplAccount`);
        apiController.getAccount(account, res);
    },

    // 회원등록
    createAccount: function(req, res) {
        var params = req.body;
        params.agree_1 = params.agree_1 == 'on' ? 'Y' : 'N';
        params.agree_2 = params.agree_2 == 'on' ? 'Y' : 'N';
        params.memPwd = cryptoUtil.sha256Crypto(params.memPwd);
        
        // OSB 계정 등록 
        var eosjsParamPubKey = 'OSB' + params.osbPublicKey.substring(3, params.osbPublicKey.length);
        
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
                    }
                    // 공통 인증관련 메일 발송 처리
                    commonController.awsMail(mailParmas);

                    res.json({result: true, rtnDatas: params, message: 'create accout OK!!'});
                }
            });

        }).catch((error) => {
            res.json({result: false, message: 'create account failed.'});
        });

    },
    transfer: function(req, res) {
        var config = {
            chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
            keyProvider: '5KM8rRd1TyWBtbKsziuWJgPwqtijEsxCa3RD6dHXdvf6erWEvXF',
            httpEndpoint: "http://api.kylin.eosbeijing.one:8880",
            broadcast: true,
            verbose: true,
            sign: true
        };
        
        var eos = Eos(config);

        var result = eos.transaction({
            actions: [{
                account: "osb.token",
                name: "transfer",
                data: {
                    from: "test12341234",
                    to: "test151515",
                    quantity: "1.0000 OSB",
                    memo: "test"
                },
                authorization: [{
                    actor: "test12341234",
                    permission: "active"
                }]
            }]
        }).then(function (resultData) {
            console.log(result.transaction_id);
        });
    }

};

module.exports = joinController;