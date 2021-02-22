/*
운영서버에서 실행시 
1. 접속
ssh -i ~/.ssh/OA_ADMIN.pem ubuntu@10.10.50.120

2. 경로 이동
ubuntu@ip-172-31-50-24:~/ico-manage$ cd /home/ubuntu/ico-manage

3. 서버 실행

// 개발모드로 실행
ubuntu@ip-172-31-50-24:~/ico-manage$ pm2 start osbwallet.config.js
// 배포모드로 실행
ubuntu@ip-172-31-50-24:~/ico-manage$ $pm2 start osbwallet.config.js --env production

//실행 내용 확인
ubuntu@ip-172-31-50-24:~/ico-manage$ $pm2 show 0

4. 서버 종료
ubuntu@ip-172-31-50-24:~/ico-manage$ pm2 stop admin.oasisbloc.config.js

*/

module.exports = {
    apps: [
        {
            // pm2로 실행한 프로세스 목록에서 이 애플리케이션의 이름으로 지정될 문자열
            name: "http://wallet.oasisbloc.io",
            // pm2로 실행될 파일 경로
            script: "./bin/www",
            // 개발환경시 적용될 설정 지정
            env: {
                "PORT": 3000,
                "NODE_ENV": "development"
            },
            // 배포환경시 적용될 설정 지정
            env_production: {
                "PORT": 3000,
                "NODE_ENV": "production"
            },
            log_date_format: "YYYY-MM-DD HH:mm:ss.SSS"
        }
    ]
};
