var mysql = require('mysql');

/**
 * mysql Connection info
 */
var connection = mysql.createPool({
    host    : 'host',
    user    : 'id',
    password: 'pw',
    port    : '3306',
    database: 'oasisdb',
    multipleStatements: true
});

module.exports = {
    'connection' : connection,
    'domain' : 'wallet.oasisbloc.io',
    'blockchain' : 'OSB',
    'protocol' : 'https',
    
    'host' : 'host',    //3.1.224.25
    'port' : 443,
    'chainId' : 'chain.id',
    'osbMoAccount' : 'osb.account',
    'osbMoPrivateKey' : 'osb.mo.private.key',
    'osbMoPublicKey' : 'osb.mo.public.key',
    'osbTransfer' : 'osbio.token',

    'aes256Key' : 'aes.256.key',
    'aes256Iv' : 'aes.256.iv',
    'salt' : '{salt}',
    'homeUrl' : 'https://wallet.oasisbloc.io',
    'awsEmailHost': 'aws.email.host',
    'awsEmailPort': 1234,
    'awsEmailId': 'aws.email.id',
    'awsEmailPw': 'aws.email.pw',
    'webmasterEmail' : 'webmaster@oasisbloc.io',
    'supportEmail' : 'support@oasisbloc.io',
    'explorerUrl' : 'https://explorer.oasisbloc.io',

    'recaptchaSite' : 'recaptcha.site',
    'recaptchaSecret' : 'recaptcha.secret',

    'lockupContract' : 'lockuptokens',
    'checkHost' : 'wallet.oasisbloc.io'
}
