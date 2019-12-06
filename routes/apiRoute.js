var express = require('express');
var router = express.Router();
var apiController = require('../controller/outerApiController');

router.post('/getCurrencyBalance', apiController.getCurrencyBalance);

router.post('/getActions', apiController.getActions);

router.post('/generateKey', apiController.generateKey);

router.post('/checkDuplAccount', apiController.checkDuplAccount);

router.post('/createAccount', apiController.createAccount);

router.post('/login', apiController.login);

router.post('/checkPrivateKey', apiController.checkPrivateKey);

router.post('/getAccount', apiController.getAccount);

router.post('/transfer', apiController.transfer);

// 비밀번호 변경 이메일 발송
router.post('/forgotPasswordMail', apiController.forgotPasswordMail);

router.post('/getLockupTransactions', apiController.getLockupTransactions);

router.post('/claimUnlockup', apiController.claimUnlockup);

module.exports = router;
