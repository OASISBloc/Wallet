var mysql = require('mysql');

/**
 * mysql Connection info
 */
var connection = mysql.createPool({
//    host    : 'localhost',
//    user    : 'oasisdev',
//    password: 'db3939!',
//    port    : '3306',
//    database: 'oasisdb',
//    multipleStatements: true
    host    : 'oasiscamp.chqqcd2uotde.ap-southeast-1.rds.amazonaws.com',
    user    : 'oasisdev',
    password: 'db3939!',
    port    : '3306',
    database: 'oasisdb',
    multipleStatements: true
});

module.exports = {
    'connection' : connection,
    'domain' : 'wallet.oasisbloc.io',
    'blockchain' : 'OSB',
    'protocol' : 'https',
    
    'host' : 'ssagajilove.oasisbloc.io',    //3.1.224.25
    'port' : 443,
    'chainId' : '15bede0f6cde49c9b92851606deba1f3a98f95d123d011c815f099375f47e464',
    'osbMoAccount' : 'osb.account',
    'osbMoPrivateKey' : '5JqLHduEEzrx4JYvpN7dicHEFxXdcQ55NHPY2VpSWNcG4h1JdEn',
    'osbMoPublicKey' : 'OSB8btiKZuWU2vAwk9AdwwsYzdCA8HfRhCXkFqAcgDRRrYdr3LVUv',
    'osbTransfer' : 'osbio.token',

    'aes256Key' : '2727be866de80a8d44fd600d9b7192ddadd00b0254dae13135152741c39342d1',
    'aes256Iv' : '5ae5b428e7d39e5f6f34caaecdd6ec21',
    'salt' : '{1357902468}',
    'homeUrl' : 'https://wallet.oasisbloc.io',
    'awsEmailHost': 'email-smtp.us-west-2.amazonaws.com',
    'awsEmailPort': 587,
//    'awsEmailId': 'AKIA4WYX424ZT6467IAV',
//    'awsEmailPw': '5opB5dxQLUuM7fDTDCAZPx4lb8L+3LpE8ewglajR',
    'awsEmailId': 'AKIAJCV72P32E3C7TW2A',
    'awsEmailPw': 'AvtFPG0Riv9WgAZy6eE3OsC6MwTxxHdJnJdIMsvAmZeL',
    'webmasterEmail' : 'webmaster@oasisbloc.io',
    'supportEmail' : 'support@oasisbloc.io',
    'explorerUrl' : 'https://explorer.oasisbloc.io',

    'recaptchaSite' : '6LeSmHcUAAAAAOiGDaEiebhai9svqQq4hpJyE0NJ',
    'recaptchaSecret' : '6LeSmHcUAAAAAIPqikkF9E9eiyF9r8zku_gM_gEa',

    'lockupContract' : 'lockuptokens',
    'checkHost' : 'wallet.oasisbloc.io'
}
