var crypto = require('crypto')

var cryptoUtil = {
	// sha256
	sha256Crypto: function(cryptoVal) {
		return crypto.createHash('SHA256').update(cryptoVal + config.salt).digest('base64');
	},
}

module.exports = cryptoUtil;