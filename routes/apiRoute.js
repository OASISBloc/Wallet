var express = require('express');
var router = express.Router();
var apiController = require('../controller/outerApiController');

router.post('/getMyTokenBalance', apiController.getMyTokenBalance);

router.post('/getActions', apiController.getActions);

router.post('/generateKey', apiController.generateKey);

router.post('/checkDuplAccount', apiController.checkDuplAccount);

router.post('/createAccount', apiController.createAccount);

router.post('/login', apiController.login);

router.post('/checkPrivateKey', apiController.checkPrivateKey);

router.post('/getAccountInfo', apiController.getAccountInfo);

router.post('/transfer', apiController.transfer);

// 비밀번호 변경 이메일 발송
router.post('/forgotPasswordMail', apiController.forgotPasswordMail);

router.post('/getLockupTransactions', apiController.getLockupTransactions);

router.post('/claimUnlockup', apiController.claimUnlockup);

router.post('/searchTokenList', apiController.searchTokenList);

module.exports = router;
