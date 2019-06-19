var mysql = require('mysql');

/**
 * mysql Connection info
 */
var connection = mysql.createPool({
    host    : 'host ip',
    user    : 'user',
    password: 'password',
    port    : 'port',
    database: 'oasisbloc',
    multipleStatements: true
});

module.exports = {
    'connection' : connection,
    'domain' : 'oasisbloc.io',
    'blockchain' : 'osb',
    'protocol' : 'http',
    'host' : '0.0.0.1',
    'port' : 6666,
    'chainId' : 'chainId',
    'osbMoAccount' : 'osb.account',
    'osbMoPrivateKey' : 'PrivateKey',
    'osbMoPublicKey' : 'PublicKey',
    'aes256Key' : 'aes256key',
    'aes256Iv' : 'aes256Iv',
    'homeUrl' : 'http://oasisbloc.io',
    'awsEmailHost': 'email-host',
    'awsEmailPort': 587,
    'awsEmailId': 'developer',
    'awsEmailPw': 'password',
    'webmasterEmail' : 'webmaster@oasisbloc.io',
}
