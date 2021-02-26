var ejs = require('ejs');

var commonController = {
    //aws 메일 발송
    awsMail: async function(params) {
        await ejs.renderFile(__dirname + '/../views/mailForm/' + params.emailFormNm, params, function(err, data) {
            //console.log(err || data);
            if (!err) {
                var nodemailer = require('nodemailer');
                var smtpTransport = require('nodemailer-smtp-transport');
                
                var transport = nodemailer.createTransport(smtpTransport({
                    host: config.awsEmailHost,
                    port: config.awsEmailPort,
                    secure: false,
                    auth: {
                        user: config.awsEmailId,
                        pass: config.awsEmailPw
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                }));
                
                var mailOptions = {
                    from: config.webmasterEmail, // sender address
                    to: params.userEmail, // list of receivers
                    subject: params.emailSubject, // Subject line
                    text: '', // plaintext body
                    html: data // html body
                };
                transport.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log("메일발송 실패 :: " + JSON.stringify(error));
                    } else {
                        console.log('sendMail > awsMail / sendMail sent info.response :: ' + JSON.stringify(info.response));
                    }
                });
            } else {
                console.log('sendMail > awsMail / error :: ' + JSON.stringify(err));
            }
        });
        
    }

}

module.exports = commonController;
