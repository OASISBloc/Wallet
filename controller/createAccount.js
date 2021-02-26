const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');
const ecc = require('eosjs-ecc');
const cryptoUtil = require('../util/crypto');

var osbMoPrivateKey = '5JjTCawrjo4jciEXiNKcH4NG5dPRt3TWZ9jGWJoDkjVBwjqbzqT';

var rpc = new JsonRpc('https://osbcamprpc.doublechain.co.kr:443', { fetch });
var signatureProvider = new JsSignatureProvider([osbMoPrivateKey]);
var api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

try{
    (async () => {
        await api.transact({
            actions: [{
                account: 'eosio',
                name: 'newaccount',
                authorization: [{
                    actor: 'osb.account',
                    permission: 'active',
                }],
                data: {
                    creator: 'osb.account',
                    name: 'pastdaylove3',
                    owner: {
                        threshold: 1,
                        keys: [{
                            key: 'OSB77txNzm4mN7ZznTnFK9DqJgMRsHrGsnxPVPJYFLHbM4Dtz1dsU',
                            weight: 1
                        }],
                        accounts: [],
                        waits: []
                    },
                    active: {
                        threshold: 1,
                        keys: [{
                            key: 'OSB77txNzm4mN7ZznTnFK9DqJgMRsHrGsnxPVPJYFLHbM4Dtz1dsU',
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
                        actor: 'osb.account',
                        permission: 'active',
                    }],
                    data: {
                        payer: 'osb.account',
                        receiver: 'pastdaylove3',
                        bytes: 4096,
                    },
                },
                {
                    account: 'eosio',
                    name: 'delegatebw',
                    authorization: [{
                        actor: 'osb.account',
                        permission: 'active',
                    }],
                    data: {
                        from: 'osb.account',
                        receiver: 'pastdaylove3',
                        stake_net_quantity: '0.0020 OSB',
                        stake_cpu_quantity: '0.0020 OSB',
                        transfer: false,
                    }
                }]
        }, {
            blocksBehind: 3,
            expireSeconds: 30,
        })
    })();
}catch(e){
    console.log("newaccount error:" + e);
}
