var mysql = require('mysql');

/**
 * mysql Connection info
 */
var connection = mysql.createPool({
    host    : '220.75.229.133',
    user    : 'oasisdev',
    password: 'mt393939',
    port    : '3306',
    database: 'oasisdb',
    multipleStatements: true
});

module.exports = {
    'connection' : connection,
    'domain' : 'wallet.oasisbloc.io',
    'blockchain' : 'eos',
    'protocol' : 'https',
    'host' : 'osbcamprpc.doublechain.co.kr',
    'port' : 443,
    'chainId' : 'a3b6669034ab27beb95fa9c5b5f6c2d412a1026aee66df89dd8b80ca4f2485a3',
    'osbMoAccount' : 'osb.account',
    'osbMoPrivateKey' : '5JjTCawrjo4jciEXiNKcH4NG5dPRt3TWZ9jGWJoDkjVBwjqbzqT',
    'osbMoPublicKey' : 'OSB6XLr1eU44uzcjwXaFDPvJb5rvAcTct63PrqsZjekn2ULt4fTu7',
    'osbTransfer' : 'osbio.token',

    'aes256Key' : '2727be866de80a8d44fd600d9b7192ddadd00b0254dae13135152741c39342d1',
    'aes256Iv' : '5ae5b428e7d39e5f6f34caaecdd6ec21',
    'salt' : '{1357902468}',
    'homeUrl' : 'http://dev.doublechain.co.kr:3000',
    'awsEmailHost': 'email-smtp.us-west-2.amazonaws.com',
    'awsEmailPort': 587,
    'awsEmailId': 'AKIAJCV72P32E3C7TW2A',
    'awsEmailPw': 'AvtFPG0Riv9WgAZy6eE3OsC6MwTxxHdJnJdIMsvAmZeL',
    'webmasterEmail' : 'webmaster@oasisbloc.io',
    'supportEmail' : 'support@oasisbloc.io',
    'explorerUrl' : 'https://osbcampexplorer.doublechain.co.kr',

    //for localhost
    'recaptchaSite' : '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
    'recaptchaSecret' : '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
    // 'recaptchaSite' : '6LeSmHcUAAAAAOiGDaEiebhai9svqQq4hpJyE0NJ',
    // 'recaptchaSecret' : '6LeSmHcUAAAAAIPqikkF9E9eiyF9r8zku_gM_gEa',

    'lockupContract' : 'lockuptoken1',
    'checkHost' : 'localhost'
}
