var express = require('express');
var router = express.Router();
var joinController = require('../controller/joinController');
var apiController = require('../controller/apiController');
var loginController = require('../controller/loginController');
var termsController = require('../controller/termsController');
var tokenController = require('../controller/tokenController');
const fs = require('fs');
const cryptoJS = require("crypto-js");

/* GET home page. */
router.get('/', function(req, res, next) {
	var sess = req.session.account ? req.session.account : '';
	var type = req.query.type ? req.query.type : '';
	var symbol = req.query.symbol ? req.query.symbol : '';
	res.render('./index', { title: 'index', account: sess.account, type: type, symbol: symbol });
});

// router.get('/scatter', function(req, res, next) {
// 	res.render('./scatter', { title: 'Scatter Test' });
// });

// router.get('/eosKeyCreator', function(req, res, next) {
// 	res.render('./eosKeyCreator', { title: 'EOS Key Creator Test' });
// });

router.get('/tokens', function(req, res, next) {
	//res.render('./tokens', { memAccount: req.query.memAccount});
	var sess = req.session.account ? req.session.account : '';
	var type = req.query.type ? req.query.type : '';
	var symbol = req.query.symbol ? req.query.symbol : '';
	console.log("sess.account=" + sess);
	res.render('./tokens', { title: 'Tokens', account: sess.account, type: type, symbol: symbol });
});

router.get('/transfer', function(req, res, next) {
	var sess = req.session.account ? req.session.account : '';
	var type = req.query.type ? req.query.type : '';
	var symbol = req.query.symbol ? req.query.symbol : '';
	console.log("type:" + type);
	console.log("symbol:" + symbol);
	res.render('./transfer', { title: 'Transfer', account: sess.account, type: type, symbol: symbol });
});

router.get('/memJoin', function(req, res, next) {
	var sess = req.session.account ? req.session.account : '';
	var type = req.query.type ? req.query.type : '';
	var symbol = req.query.symbol ? req.query.symbol : '';
	if (req.session.account) {
		res.render('./index');
	} else {
		res.render('./memJoin', { title: 'MemJoin', account: sess.account, type: type, symbol: symbol });
	}
});

router.get('/memJoinComplete', function(req, res, next) {
	var sess = req.session.account ? req.session.account : '';
	var type = req.query.type ? req.query.type : '';
	var symbol = req.query.symbol ? req.query.symbol : '';
	res.render('./memJoinComplete', { title: 'memJoinComplete', memAccount: req.query.memAccount, account: sess.account, type: type, symbol: symbol});
});

router.get('/login', function(req, res, next) {
	var sess = req.session.account ? req.session.account : '';
	var type = req.query.type ? req.query.type : '';
	var symbol = req.query.symbol ? req.query.symbol : '';
	if (req.session.account) {
		res.redirect('/');
	} else {
		res.render('./login', { title: 'login', account: sess.account, type: type, symbol: symbol });
	}
});

router.get('/logout', loginController.logout);

router.get('/account', apiController.getAccountInfo);
router.post('/getBalance', apiController.getCurrencyBalance);
router.post('/getActions', apiController.getActions);
router.post('/generateKeyAjax', joinController.generateKey);
router.post('/checkDuplAccountAjax', joinController.checkDuplAccount);
router.post('/createAccountAjax', joinController.createAccount);
router.post('/loginAjax', loginController.login);
router.post('/transferAjax', apiController.transfer);
router.post('/checkLoginAjax', loginController.checkLogin);
router.post('/showMyTokensAjax', tokenController.showMyTokens);
router.post('/searchTokensAjax', tokenController.searchTokens);
//router.post('/searchAccountTokensAjax', tokenController.searchAccountTokens);
router.post('/getMyTokenBalanceAjax', tokenController.getMyTokenBalance);
router.post('/addMyTokenAjax', tokenController.addMyToken);
router.post('/removeMyTokenAjax', tokenController.removeMyToken);
router.post('/getRandomAjax', apiController.getRandom);
// router.post('/api/createAccount', joinController.createScatterAccount);
//
// 비밀번호 변경 입력 페이지
router.get('/forgotPassword', function(req, res, next) {
	try{
		var sess = req.session.account ? req.session.account : '';
		var type = req.query.type ? req.query.type : '';
		var symbol = req.query.symbol ? req.query.symbol : '';
		var termType = req.query.termType ? req.query.termType : '';
		if (req.session.account) {
			res.redirect('/');
		} else {
			res.render('./forgotPassword', {termType: termType, account: sess.account, type: type, symbol: symbol});
		}
	}catch (e){
		console.log("forgotPassword e:" + e);
	}
});

// 비밀번호 변경 이메일 발송
router.post('/forgotPasswordMailAjax', loginController.forgotPasswordMail);

// 비밀번호 변경 페이지
router.get('/resetPassword', function(req, res, next) {
	if (req.session.account) {
		res.redirect('/');
	} else {
		loginController.resetPassword(req, res);
	}
});

// // 비밀번호 변경 처리
router.post('/procResetPasswordAjax', loginController.procResetPassword);

// // 약관
router.get('/termNpolicy', function(req, res) {
	try{
		var sess = req.session.account ? req.session.account : '';
		var type = req.query.type ? req.query.type : '';
		var symbol = req.query.symbol ? req.query.symbol : '';
		var termType = req.query.termType ? req.query.termType : '';
		res.render('./termNpolicy', {termType: termType, account: sess.account, type: type, symbol: symbol});
	}catch (e) {
		console.log("termNpolicy error:" + e);
	}
});

router.post('/getTermNpolicyAjax', termsController.getTermsDatas);

router.post('/getTermAjax', termsController.getTerm);

module.exports = router;
