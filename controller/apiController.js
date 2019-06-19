const Eos = require('eosjs');
var async = require('async');
const logger = require('../util/logger');
var dateFormat = require('dateformat');

var apiController = {
    transfer: function(req, res){
        var sendTo = req.body.sendTo ? req.body.sendTo : '';
        var amount = req.body.amount ? req.body.amount : '';
        var memo = req.body.memo ? req.body.memo : '';
        var prvkey = req.body.prvkey ? req.body.prvkey : '';

        var locConfig = osbConfig;
        locConfig.keyProvider = prvkey;
        
        const eos = Eos(locConfig);

        var returnData = {
            result: '',
            message: ''
        };

        var Account = req.session.account ?  req.session.account.account : '';

        (async () => {
            var result = null;
            if(sendTo !== '' && amount !== '' && prvkey !== '' && Account !== ''){
                try{
                    amount = parseFloat(amount).toLocaleString(undefined, {minimumFractionDigits:4,maximumFractionDigits:4});
                    result = await eos.transaction({
                        actions: [{
                            account: 'osb.token',
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
                    },{
                            blocksBehind: 3,
                            expireInSeconds: 30,
                    });
                    if(result){
                        returnData.result = true;
                        returnData.message = result.transaction_id;
                        //console.dir(result);
                    }else{
                        returnData.result = false;
                        returnData.message = "Nothing";
                    }
                }catch(err){
                    returnData.result = false;
                    returnData.message = err;
                }
            }else{
                returnData.result = false;
                returnData.message = "Sign in is required to transfer!";
            }
            
            //console.log(result);
            res.json(returnData);
         })();
    },
    /**Account Info */
    getAccount: function(account, res){
        logger.debug(`Call getAccount account :: ${JSON.stringify(account)}`);
        var locConfig = osbConfig;
        locConfig.keyProvider = config.osbMoPrivateKey;
        logger.debug(`Set locConfig :: ${JSON.stringify(locConfig)}`);

        const eos = Eos(locConfig);
        var Account = account ? account : '';
        
        (async () => {
            var result = null;
            if(Account !==''){
                try{
                    result = await eos.getAccount(Account);
                    if(result){
                        logger.debug(`Result getAccount :: ${JSON.stringify(result)}`);
                        res.json({result: true});
                    }
                }catch(err){
                    logger.warn(`Result getAccount :: ${JSON.stringify(err)}`);
                    res.json({result: false});
                }
            }
        })();
    },
    /** getCurrencyBalance */
    getCurrencyBalance: function(req, res){
        const eos = Eos(osbConfig);
        var Account = req.session.account ?  req.session.account.account : '';

        var returnData = {
            result: '',
            message: '',
            sessionAccount: Account
        };

        (async () => {
            var result = null;
            if(Account !==''){
                try{
                    result = await eos.getCurrencyBalance('osb.token', Account);
                    if(result){
                        if(result.length >0){
                            var balance = result[0];
                            balance = balance.replace('OSB','').replace(' ','');
                            returnData.result = true;
                            returnData.message = balance;
       
                            res.json(returnData);
    
                            //console.log(result[0]);
                        }else{
                            returnData.result = false;
                            returnData.message = 0;
                            res.json(returnData);
                        }
                    }else{
                        returnData.result = false;
                        returnData.message = 0;
                        res.json(returnData);
                    }
                }catch(err){
                    returnData.result = false;
                    returnData.message = 0;
                    res.json(returnData);
                }
            }else{
                returnData.result = false;
                returnData.message = 0;
                res.json(returnData);
            }
        })();
    },
    /** getCurrencyBalance */
    getActions: function(req, res){
        const eos = Eos(osbConfig);
        var Account = req.session.account ?  req.session.account.account : '';

        var returnData = {
            result: '',
            message: ''
        };

        (async () => {
            var result = null;
            if(Account !==''){
                try{
                    var transactions = [];
                    var arrTran = [];
                    result = await eos.getActions(Account , -1, -20);
                    if(result){
                        if(result.actions.length >0){
                            //console.dir(result);
                            var actions = result.actions;
                            actions.forEach(function (el, i){

                                var trx_id = el.action_trace.trx_id;
                                var block_num = el.action_trace.block_num;
                                var block_time = el.action_trace.block_time;

                                var action_trace = el.action_trace.act;

                                //block_time = dateFormat(block_time, "mmm-dd-yyyy, hh:MM:ss TT Z");
                                var timezoneoffset = (new Date().getTimezoneOffset() / 60) * -1;
                                var nodeDate = new Date(block_time);
                                nodeDate.setHours(nodeDate.getHours()+timezoneoffset);
                                var timezonedate = dateFormat(nodeDate, "mmm-dd-yyyy, hh:MM:ss TT");                        

                                //console.log(action_trace);
                                var data = action_trace.data;
                                //var data = action_trace.act.data;
                                // from, to, memo, quantity
                                var from = data.from;
                                var to = data.to;
                                var memo = data.memo;
                                var quantity = data.quantity;
                                var transfer_type = "Sent";
                                if(to === Account){
                                    transfer_type = "Received";
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
                                
                                if(! arrTran.includes(trx_id)){
                                    transactions.push(tran_info);
                                    arrTran.push(trx_id);
                                }
                                
                            })
                            transactions.reverse();

                            //console.dir(data);
                            //console.dir(transactions);

                            returnData.result = true;
                            returnData.message = transactions;
                            res.json(returnData);
                        }else{
                            returnData.result = false;
                            returnData.message = "Nothing"
                            res.json(returnData);
                        }
                    }else{
                        //console.log("No data");
                        returnData.result = false;
                        returnData.message = "Nothing"
                        res.json(returnData);
                    }
                }catch(err){
                    returnData.result = false;
                    returnData.message = err.message;
                }
            }else{
                returnData.result = false;
                returnData.message = "Nothing"
                res.json(returnData);
            }
        })();
    }
}

module.exports = apiController;