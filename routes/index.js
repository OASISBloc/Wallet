var express = require('express');
var router = express.Router();
var joinController = require('../controller/joinController');
var apiController = require('../controller/apiController');
var loginController = require('../controller/loginController');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('./index');
});

// router.get('/scatter', function(req, res, next) {
// 	res.render('./scatter', { title: 'Scatter Test' });
// });

// router.get('/eosKeyCreator', function(req, res, next) {
// 	res.render('./eosKeyCreator', { title: 'EOS Key Creator Test' });
// });

router.get('/transfer', function(req, res, next) {
	var type = req.query.type ? req.query.type : ''
	res.render('./transfer', { title: 'Transfer', type: type });
});

router.get('/memJoin', function(req, res, next) {
	if (req.session.account) {
		res.render('./index');
	} else {
		res.render('./memJoin');
	}
});

router.get('/memJoinComplete', function(req, res, next) {
	res.render('./memJoinComplete', { memAccount: req.query.memAccount});
});

router.get('/login', function(req, res, next) {
	if (req.session.account) {
		res.redirect('/');
	} else {
		res.render('./login');
	}
});

router.get('/logout', loginController.logout);

router.get('/account', apiController.getAccount);
router.post('/getBalance', apiController.getCurrencyBalance);
router.post('/getActions', apiController.getActions);

router.post('/generateKeyAjax', joinController.generateKey);

router.post('/checkDuplAccountAjax', joinController.checkDuplAccount);

router.post('/createAccountAjax', joinController.createAccount);

router.post('/loginAjax', loginController.login);

router.post('/transferAjax', apiController.transfer);

router.post('/checkLoginAjax', loginController.checkLogin);

module.exports = router;
