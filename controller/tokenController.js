const tokenModel = require("../model/tokenModel");
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig'); // development only
const fetch = require('node-fetch'); // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');
const fs = require('fs');
var tokenController = {
    searchTokens: function(req, res){
        var searchKeyword = req.body.searchKeyword ? req.body.searchKeyword : '';
        var returnData = {
            result: '',
            message: '',
            symbol : '',
            rows: '',
            logo_img: ''
        }
        var params = {
            searchKeyword : searchKeyword
        }
        const result = tokenModel.searchTokens(params, function(err, searchTokensResult){
            try{
                if(searchTokensResult.length == 0){
                    returnData.result = false;
                    returnData.message = "조회된 데이터가 없습니다.";
                    res.json(returnData);
                }else{
                    returnData.result = true;
                    returnData.message = "데이터가 성공적으로 조회되었습니다.";
                    returnData.rows = searchTokensResult;
                    var jsonStr = JSON.stringify(searchTokensResult[0].symbol);
                    console.log("here:" + jsonStr);
                    res.json(returnData);
                }

            }catch (e) {
                console.log("searchTokens err:" + e);
            }
        })
    },
    showMyTokens: function (req, res){
        var account = req.session.account ?  req.session.account.account : '';
        console.log("showMyTokens" + account);
        var params = {
            account : account
        }
        var returnData = {
            result: '',
            message: '',
            accountTokens: ''
        };
        try {
            const result = tokenModel.showMyTokens(params, function(err, showMyTokensResult){
                if(err){
                    console.log("showMyTokens query err:" + err);
                    returnData.result = false;
                    returnData.message = "Error Occured!";
                    res.json(returnData);
                }else{
                    if(showMyTokensResult.length == 0){
                        console.log("조회된 데이터가 없습니다.");
                        returnData.result = false;
                        returnData.message = "No data Searched!";
                        res.json(returnData);
                    }else{
                        var jStr = JSON.stringify(showMyTokensResult);
                        console.log("jStr:" + jStr);
                        returnData.result = true;
                        returnData.accountTokens = showMyTokensResult;
                        returnData.message = "showMyTokens Success!";
                        res.json(returnData);
                    }
                }
            });
        }catch (e) {
            console.log("searchAccountTokens err:" + e);
            returnData.result = false;
            returnData.message = "Error Occured!";
            res.json(returnData);
        }
    },
    getMyTokenBalance: function(req, res){

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
                        var osbBalance = 0.0000;
                        var sOsbBalance = 0.0000;
                        var craBalance = 0.0000;
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
    },
    addMyToken: function (req, res){
        var account = req.session.account ?  req.session.account.account : '';
        var symbol = req.body.symbol ? req.body.symbol : '';
        console.log("addMyToken account" + account);
        console.log("addMyToken symbol" + symbol);
        var params = {
            account : account,
            symbol : symbol
        }
        var returnData = {
            result: '',
            message: ''
        };
        try {
            const result = tokenModel.insertMyToken(params, function(err, insertMyTokenResult){
                if(err){
                    console.log("insertMyToken query err:" + err);
                    returnData.result = false;
                    returnData.message = "Error Occured!";
                    res.json(returnData);
                }else{
                    if(insertMyTokenResult){
                        var jStr = JSON.stringify(insertMyTokenResult);
                        console.log("jStr:" + jStr);
                        returnData.result = true;
                        returnData.message = "Insert My Token Success!";
                        res.json(returnData);
                    }else{
                        console.log("Insert MyToken Fail!");
                        returnData.result = false;
                        returnData.message = "Insert MyToken Fail!";
                        res.json(returnData);
                    }
                }
            });
        }catch (e) {
            console.log("searchAccountTokens err:" + e);
            returnData.result = false;
            returnData.message = "Error Occured!";
            res.json(returnData);
        }
    },
    removeMyToken: function (req, res){
        var account = req.session.account ?  req.session.account.account : '';
        var symbol = req.body.symbol ? req.body.symbol : '';
        console.log("searchAccountTokensAjax account" + account);
        console.log("searchAccountTokensAjax symbol" + symbol);
        var params = {
            account : account,
            symbol : symbol
        }
        var returnData = {
            result: '',
            message: ''
        };
        try {
            const result = tokenModel.deleteMyToken(params, function(err, insertMyTokenResult){
                if(err){
                    console.log("deleteMyToken query err:" + err);
                    returnData.result = false;
                    returnData.message = "Error Occured!";
                    res.json(returnData);
                }else{
                    if(insertMyTokenResult){
                        var jStr = JSON.stringify(insertMyTokenResult);
                        console.log("jStr:" + jStr);
                        returnData.result = true;
                        returnData.message = "Delete My Token Success!";
                        res.json(returnData);
                    }else{
                        console.log("Delete MyToken Fail!");
                        returnData.result = false;
                        returnData.message = "Delete MyToken Fail!";
                        res.json(returnData);
                    }
                }
            });
        }catch (e) {
            console.log("deleteMyToken err:" + e);
            returnData.result = false;
            returnData.message = "Error Occured!";
            res.json(returnData);
        }
    },
}

module.exports = tokenController;
