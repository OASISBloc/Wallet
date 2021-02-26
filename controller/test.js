// import { Api, JsonRpc, RpcError } from 'eosjs';
// import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');
try{
    var sendTo = 'pastdaylove2';
    var amount = '10';
    var memo = 'pastdaylove1 sent to pastdaylove2';
    var prvkey = '5KbA4bCqAsM4hVfdQwBqD7euJTHbYp5iRNwdxzWaByDPNQTaMRN';
    console.log("sendTo:" + sendTo);
    console.log("amount:" + amount);
    console.log("memo:" + memo);
    console.log("prvkey:" + prvkey);

    var returnData = {
        result: '',
        message: ''
    };

    // var locConfig = osbConfig;
    var rpc = new JsonRpc('https://osbcamprpc.doublechain.co.kr:443', { fetch });
    var signatureProvider = new JsSignatureProvider([prvkey]);
    var api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    var Account = 'pastdaylove1';

    (async () => {
        const result = await api.transact({
            actions: [{
                account: 'osbio.token',
                name: 'transfer',
                authorization: [{
                    actor: 'pastdaylove1',
                    permission: 'active',
                }],
                data: {
                    from: 'pastdaylove1',
                    to: 'pastdaylove2',
                    quantity: '10.0000 OSB',
                    memo: '',
                },
            }]
        }, {
            blocksBehind: 3,
            expireSeconds: 30,
        });
        console.dir(result);
    })();

    // (async () => {
    //     var result = null;
    //     if(sendTo !== '' && amount !== '' && prvkey !== '' && Account !== ''){
    //         try{
    //             var amtArray = amount.split('.');
    //             var intAmt = amtArray[0].replace(/[^\d]+/g, '');
    //             var dotAmt = amtArray[1] ? amtArray[1].padEnd(4, '0') : '0000';
    //             amount = intAmt + "." + dotAmt;
    //             console.log("111111111111");
    //             result = await api.transact({
    //                 actions: [{
    //                     account: 'osbio.token',
    //                     name: 'transfer',
    //                     authorization:[{
    //                         actor: Account,
    //                         permission: 'active',
    //                     }],
    //                     data: {
    //                         from: Account,
    //                         to: sendTo,
    //                         quantity: amount + ' OSB',
    //                         memo: memo
    //                     },
    //                 }]
    //             },{
    //                 blocksBehind: 3,
    //                 expireInSeconds: 30,
    //             });
    //             var jStr = JSON.stringify(result);
    //             console.log("result:" + jStr);
    //             if(true){
    //                 returnData.result = true;
    //                 //returnData.message = result.transaction_id;
    //                 //console.dir(result);
    //             }else{
    //                 returnData.result = false;
    //                 returnData.message = "Nothing";
    //             }
    //         }catch(err){
    //             //var jsonErr = JSON.parse(err)
    //             //console.log(jsonErr.error.what);
    //             console.log("transfer error:" + err);
    //             returnData.result = false;
    //             // returnData.message = jsonErr.error.what;
    //             returnData.message = 'Please check the information you entered.';
    //         }
    //     }else{
    //         returnData.result = false;
    //         returnData.message = "Sign in is required to transfer!";
    //     }
    //
    //     //console.log(result);
    //     //res.json(returnData);
    // })();
}catch (e) {
    console.log("transfer error:" + e);
}
