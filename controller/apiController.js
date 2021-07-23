const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');
const dateFormat = require('dateformat');
const cryptoJS = require("crypto-js");
const tokenModel = require("../model/tokenModel");
const fs = require('fs');
var apiController = {
    /** getActions */
    // getActions: function(req, res){
    //     try{
    //         console.log("33333333");
    //         //var Account = req.session.account ?  req.session.account.account : '';
    //         var Account = 'pastdaylove1';
    //         var timezoneoffset = req.body.timezoneoffset ? req.body.timezoneoffset : '';
    //         //var pageNo = req.body.pageNo;
    //         var pageNo = 1;
    //         var wdPubkey = req.session.account ? req.session.account.publicKey : '';
    //         //console.log("Account:" + Account);
    //         // console.log("wdPrikey:" + wdPrikey);
    //         //console.log("wdPubkey:" + wdPubkey);
    //         // console.log("wdAmount:" + wdAmount);
    //
    //         var locConfig = osbConfig;
    //         var rpc = new JsonRpc(locConfig.httpEndpoint, { fetch });
    //         //console.log("locConfig.httpEndpoint" + locConfig.httpEndpoint);
    //         // var signatureProvider = new JsSignatureProvider([wdPrikey]);
    //         // var api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    //         var returnData = {
    //             result: '',
    //             message: '',
    //             totalCount: '',
    //             sessionAccount: Account
    //         };
    //
    //         (async () => {
    //             var result = null;
    //             var preResult = null;
    //
    //             if(Account !==''){
    //                 try{
    //                     var transactions = [];
    //                     var arrTran = [];
    //                     preResult = await rpc.history_get_actions(Account, -1, -1);
    //                     //console.log("maxNum===>" + preResult.actions[0].account_action_seq);
    //                     var maxNum = preResult.actions[0].account_action_seq;
    //                     var pos = maxNum - (pageNo - 1) * 20;
    //
    //                     result = await rpc.history_get_actions(Account, pos,-19);
    //                     //console.log("result.actions.account_action_seq=>" + result.actions[0].account_action_seq);
    //                     if(result){
    //                         if(result.actions.length >0){
    //                             var actions = result.actions;
    //                             actions.forEach(function (el, i){
    //                                 var trx_id = el.action_trace.trx_id;
    //                                 //console.log("trx_id:" + trx_id);ss
    //                                 var block_num = el.action_trace.block_num;
    //                                 //console.log("block_num:" + block_num);
    //                                 var block_time = el.action_trace.block_time;
    //                                 //console.log("block_time:" + block_time);
    //
    //                                 var action_trace = el.action_trace.act;
    //                                 if (action_trace.name == 'transfer') {
    //                                     //console.log("i==" + i);
    //                                     //block_time = dateFormat(block_time, "mmm-dd-yyyy, hh:MM:ss TT Z");
    //                                     var nodeDate = new Date(block_time);
    //                                     nodeDate.setHours(nodeDate.getHours()+parseInt(timezoneoffset));
    //                                     var timezonedate = dateFormat(nodeDate, "mmm-dd-yyyy, h:MM:ss TT");
    //                                     var data = action_trace.data;
    //                                     //var data = action_trace.act.data;
    //                                     // from, to, memo, quantity
    //                                     var from = data.from;
    //                                     var to = data.to;
    //                                     //console.log("to======" + to);
    //                                     //console.log("Account======"+ Account);
    //                                     var memo = data.memo;
    //                                     var quantityAll = new Array();
    //                                     quantityAll = data.quantity.split(" ");
    //                                     //console.log("data.quantity=>" + data.quantity);
    //                                     //var quantity = data.quantity.replace('OSB','').replace(' ','');;
    //                                     var quantity = quantityAll[0];
    //                                     var coin = quantityAll[1];
    //                                     var transfer_type="";
    //                                     if (to == Account) {
    //                                         transfer_type = "입금";
    //                                     }else{
    //                                         transfer_type = "출금";
    //                                     }
    //                                     var transfer_status = "승인완료";
    //
    //                                     var tran_info = [
    //                                         timezonedate,
    //                                         quantity,
    //                                         coin,
    //                                         transfer_type,
    //                                         transfer_status,
    //                                         trx_id
    //                                     ];
    //
    //                                     // if(!arrTran.includes(trx_id)){
    //                                     transactions.push(tran_info);
    //                                     // arrTran.push(trx_id);
    //                                     // }
    //                                 }
    //
    //                             })
    //                             transactions.reverse();
    //
    //                             //console.dir(data);
    //                             //console.dir(transactions);
    //
    //                             returnData.result = true;
    //                             returnData.message = transactions;
    //                             returnData.totalCount = maxNum + 1;
    //                             //console.log("returnData.message=" + transactions);
    //                             res.json(returnData);
    //                         }else{
    //                             returnData.result = false;
    //                             returnData.message = "Nothing"
    //                             res.json(returnData);
    //                         }
    //                     }else{
    //                         //console.log("No data");
    //                         returnData.result = false;
    //                         returnData.message = "Nothing"
    //                         res.json(returnData);
    //                     }
    //                 }catch(err){
    //                     returnData.result = false;
    //                     returnData.message = err.message;
    //                     //console.log("returnData.message" + returnData.message);
    //                 }
    //             }else{
    //                 returnData.result = false;
    //                 returnData.message = "Nothing"
    //                 res.json(returnData);
    //             }
    //         })();
    //     }catch (e) {
    //         console.log("getActions error:" + e);
    //     }
    // },
    getActions: function(req, res){
        try{
            var locConfig = osbConfig;
            var rpc = new JsonRpc(locConfig.httpEndpoint, { fetch });
            //var eos = Eos(osbCnfig);
            var Account = req.session.account ?  req.session.account.account : '';
            var timezoneoffset = req.body.timezoneoffset;
            console.log("received timezoneoffset:" + timezoneoffset);
            var pos = req.body.pos ? req.body.pos : 0;
            console.log("received pos:" + pos);
            var symbol = req.body.symbol;

            var returnData = {
                result: '',
                message: '',
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
                        var maxNum = preResult.actions[0].account_action_seq;
                        pos = (pos == 0) ? maxNum : pos;
                        //console.log('maxNum =' + maxNum);
                        //pos = pos == 0 ? maxNum + 1 : pos;
                        //console.log("pos==========>" + pos);
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
                                    //console.log("jStr:" + jStr);
                                    var trx_id = el.action_trace.trx_id;
                                    var block_num = el.action_trace.block_num;
                                    var block_time = el.action_trace.block_time;

                                    var action_trace = el.action_trace.act;
                                    var symbols = [];
                                    if (action_trace.data.quantity != null) {
                                        symbols = action_trace.data.quantity.split(' ');
                                    }
                                    var resultSymbol = symbols[1];
                                    if (el.action_trace.act.name == 'transfer' && resultSymbol == symbol) {
                                        console.log("action_trace.name:" + action_trace.name);
                                        console.log("resultSymbol=" + resultSymbol);
                                        console.log("symbol=" + symbol);
                                        block_time = dateFormat(block_time, "mmm-dd-yyyy, hh:MM:ss TT Z");
                                        var nodeDate = new Date(block_time);
                                        nodeDate.setHours(nodeDate.getHours() + parseInt(timezoneoffset));
                                        var timezonedate = dateFormat(nodeDate, "mmm-dd-yyyy, h:MM:ss TT");

                                        //console.log(action_trace);
                                        var data = action_trace.data;
                                        //var data = action_trace.act.data;
                                        // from, to, memo, quantity
                                        var from = data.from;
                                        var to = data.to;
                                        var memo = data.memo;
                                        //console.log("data.quantity==>" + data.quantity);
                                        var quantity = data.quantity.replace(resultSymbol, '').replace(' ', '');
                                        ;
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
                                            limit++;
                                        }
                                    }
                                    pos -= 1;
                                    //console.log("===========pos========" + pos);
                                });
                            }else{
                                returnData.result = false;
                                returnData.message = "Nothing"
                                res.json(returnData);
                            }
                        }
                        transactions.reverse();

                        //console.dir(data);
                        //console.dir(transactions);

                        returnData.result = true;
                        returnData.message = transactions;
                        returnData.pos = pos;
                        //console.log("returnData.pos" + returnData.pos);
                        res.json(returnData);


                        //console.log("limit:" + limit);
                        //console.log("pos:" + pos);
                        // if(result){
                        //     if(result.actions.length >0){
                        //         //console.dir(result);
                        //         var actions = result.actions;
                        //         actions.forEach(function (el, i){
                        //
                        //             var trx_id = el.action_trace.trx_id;
                        //             var block_num = el.action_trace.block_num;
                        //             var block_time = el.action_trace.block_time;
                        //
                        //             var action_trace = el.action_trace.act;
                        //             var symbols = [];
                        //             if(action_trace.data.quantity != null){
                        //                 symbols = action_trace.data.quantity.split(' ');
                        //             }
                        //             var resultSymbol = symbols[1];
                        //             //console.log("action_trace.name:" + action_trace.name);
                        //
                        //             if (symbols.length != 0 && action_trace.name == "transfer" && resultSymbol == symbol) {
                        //                 //console.dir(result);
                        //                 console.log("resultSymbol=" + resultSymbol);
                        //                 console.log("symbol=" + symbol);
                        //                 block_time = dateFormat(block_time, "mmm-dd-yyyy, hh:MM:ss TT Z");
                        //                 var nodeDate = new Date(block_time);
                        //                 nodeDate.setHours(nodeDate.getHours()+parseInt(timezoneoffset));
                        //                 var timezonedate = dateFormat(nodeDate, "mmm-dd-yyyy, h:MM:ss TT");
                        //
                        //                 console.log(action_trace);
                        //                 var data = action_trace.data;
                        //                 //var data = action_trace.act.data;
                        //                 // from, to, memo, quantity
                        //                 var from = data.from;
                        //                 var to = data.to;
                        //                 var memo = data.memo;
                        //                 //console.log("data.quantity==>" + data.quantity);
                        //                 var quantity = data.quantity.replace('OSB','').replace(' ','');;
                        //                 var transfer_type = "Sent";
                        //                 if (to === Account) {
                        //                     if (action_trace.name == 'transfer') {
                        //                         transfer_type = "Received";
                        //                     } else {
                        //                         transfer_type = action_trace.name;
                        //                     }
                        //                 }
                        //
                        //                 var tran_info = [
                        //                     trx_id,
                        //                     block_num,
                        //                     timezonedate,
                        //                     from,
                        //                     to,
                        //                     memo,
                        //                     quantity,
                        //                     transfer_type
                        //                 ];
                        //
                        //                 if(! arrTran.includes(trx_id)){
                        //                     transactions.push(tran_info);
                        //                     arrTran.push(trx_id);
                        //                 }
                        //             }
                        //
                        //         })
                        //         transactions.reverse();
                        //
                        //         //console.dir(data);
                        //         //console.dir(transactions);
                        //
                        //         returnData.result = true;
                        //         returnData.message = transactions;
                        //         returnData.totalCount = maxNum + 1;
                        //         res.json(returnData);
                        //     }else{
                        //         returnData.result = false;
                        //         returnData.message = "Nothing"
                        //         res.json(returnData);
                        //     }
                        // }else{
                        //     //console.log("No data");
                        //     returnData.result = false;
                        //     returnData.message = "Nothing"
                        //     res.json(returnData);
                        // }
                    }catch(err){
                        console.log("error=>" + err);
                        returnData.result = false;
                        returnData.message = err.message;
                    }
                }else{
                    returnData.result = false;
                    returnData.message = "Nothing"
                    res.json(returnData);
                }
            })();
        }catch (e) {
            console.log("getActions error:" + e);
        }
    },

    transfer: function(req, res){
        try{
            var sendTo = req.body.sendTo ? req.body.sendTo : '';
            var amount = req.body.amount ? req.body.amount : '';
            var memo = req.body.memo ? req.body.memo : '';
            var key = req.body.prvkey ? req.body.prvkey : '';
            var symbol = req.body.symbol ? req.body.symbol : '';
            console.log("sendTo:" + sendTo);
            console.log("amount:" + amount);
            console.log("memo:" + memo);
            console.log("key:" + key);
            console.log("symbol:" + symbol);
            
            var contents = fs.readFileSync(path, 'utf8');
            let prvkey = contents;
            console.log("prvkey = " + contents);
            prvkey = cryptoJS.AES.decrypt(key, prvkey).toString(cryptoJS.enc.Utf8);
            console.log("prvkey decrypt = " + prvkey);
            var returnData = {
                result: '',
                message: ''
            };

            var locConfig = osbConfig;
            var rpc = new JsonRpc(locConfig.httpEndpoint, { fetch });
            var signatureProvider = new JsSignatureProvider([prvkey]);
            var api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
            var Account = req.session.account ?  req.session.account.account : '';

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
                            returnData.message = result.transaction_id;
                            console.dir(result);
                        }else{
                            returnData.result = false;
                            returnData.message = "Nothing";
                        }
                    }catch(err){
                        //var jsonErr = JSON.parse(err)
                         //console.log(jsonErr.error.what);
                        console.log("transfer error:" + err);
                        returnData.result = false;
                        // returnData.message = jsonErr.error.what;
                        returnData.message = 'Please check the information you entered.';
                    }
                }else{
                    returnData.result = false;
                    returnData.message = "Sign in is required to transfer!";
                }

                //console.log(result);
                res.json(returnData);
            })();
        }catch (e) {
            console.log("transfer error:" + e);
        }
    },
    /**Account Info */
    getAccountInfo: function(account, res){
        try{
            var locConfig = osbConfig;
            locConfig.keyProvider = config.osbMoPrivateKey;

            var rpc = new JsonRpc(locConfig.httpEndpoint, { fetch });
//        const eos = Eos(locConfig);
            var Account = account ? account : '';
            console.log("Account:" + Account);
            (async () => {
                var result = null;
                if(Account !==''){
                    try{
                        result = await rpc.get_account(Account);
                        if(result){
                            res.json({result: true});
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
    /** getCurrencyBalance */
    getCurrencyBalance: function(req, res){
        console.log("getCurrencyBalance>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        var Account = req.session.account ?  req.session.account.account : '';
        var returnData = {
            result: '',
            message: '',
            osbBalance: 0,
            sOsbBalance: 0,
            craBalance: 0,
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
                    if(result){
                        var osbBalance;
                        var sOsbBalance;
                        var craBalance;
                        console.log(result)
                        if(result.rows.length == 0){
                            osbBalance = 0.0000;
                            sOsbBalance = 0.0000;
                            craBalance = 0.0000;
                            returnData.result = false;
                            returnData.craBalance = craBalance;
                            returnData.osbBalance = osbBalance;
                            returnData.sOsbBalance = sOsbBalance;
                            returnData.message = "잔액조회 데이터가 없습니다.";
                            res.json(returnData);
                        }else{
                            result.rows.forEach(function(el, i){
                                var balances = [];
                                balances = el.balance.split(' ');
                                console.log("balances============" + balances[0] + balances[1]);
                                if(balances[1] == 'OSB'){
                                    osbBalance = el.balance;
                                    osbBalance = osbBalance.replace('OSB','').replace(' ','');
                                }else if(balances[1] == 'SOSB'){
                                    sOsbBalance = el.balance;
                                    sOsbBalance = sOsbBalance.replace('SOSB','').replace(' ','');
                                }else if(balances[1] == 'CRA'){
                                    craBalance = el.balance;
                                    craBalance = craBalance.replace('CRA','').replace(' ','');
                                }
                            })
                            returnData.result = true;
                            returnData.craBalance = craBalance;
                            returnData.osbBalance = osbBalance;
                            returnData.sOsbBalance = sOsbBalance;
                            returnData.message = "잔액조회가 정상적으로 실행되었습니다.";
                            res.json(returnData);
                        }
                        console.log("osbBalance= " + osbBalance);
                        console.log("sObBalance= " + sOsbBalance);
                        console.log("craBalance= " + craBalance);
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
        // try{
        //     const eos = Eos(osbConfig);
        //     var Account = req.session.account ?  req.session.account.account : '';
        //
        //     var returnData = {
        //         result: '',
        //         message: '',
        //         sessionAccount: Account
        //     };
        //
        //     (async () => {
        //         var result = null;
        //         if(Account !==''){
        //             try{
        //                 result = await eos.getCurrencyBalance(config.osbTransfer, Account);
        //                 if(result){
        //                     var jStr = JSON.stringify(result);
        //                     console.log("jStr:" + jStr);
        //                     if(result.length >0){
        //                         var balance = result[0];
        //                         balance = balance.replace('OSB','').replace(' ','');
        //                         returnData.result = true;
        //                         returnData.message = balance;
        //
        //                         res.json(returnData);
        //
        //                         //console.log(result[0]);
        //                     }else{
        //                         returnData.result = false;
        //                         returnData.message = 0;
        //                         res.json(returnData);
        //                     }
        //                 }else{
        //                     returnData.result = false;
        //                     returnData.message = 0;
        //                     res.json(returnData);
        //                 }
        //             }catch(err){
        //                 returnData.result = false;
        //                 returnData.message = 0;
        //                 res.json(returnData);
        //             }
        //         }else{
        //             returnData.result = false;
        //             returnData.message = 0;
        //             res.json(returnData);
        //         }
        //     })();
        //
        // }catch (e) {
        //     console.log("getCurrencyBalance error:" + e);
        // }
    },

    getRandom: function(req, res) {
        try {
            var contents = fs.readFileSync(path, 'utf8');
            console.log("random =" + contents);
            res.json({result: true, data: contents});
        }catch (e) {
             res.json({result: false});
        }
    },
}

module.exports = apiController;
