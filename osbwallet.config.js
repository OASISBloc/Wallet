
// dev
ubuntu@:~/ico-manage$ pm2 start osbwallet.config.js
// prod
ubuntu@:~/ico-manage$ $pm2 start osbwallet.config.js --env production

//status
ubuntu@:~/ico-manage$ $pm2 show 0

// server stop
ubuntu@:~/ico-manage$ pm2 stop admin.oasisbloc.config.js

*/

module.exports = {
    apps: [
        {
            // application name
            name: "http://wallet.oasisbloc.io",
            // file path
            script: "./bin/www",
            // dev
            env: {
                "PORT": 3000,
                "NODE_ENV": "development"
            },
            // prod
            env_production: {
                "PORT": 3000,
                "NODE_ENV": "production"
            }
        }
    ]
};