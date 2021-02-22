OASISBloc wallet node.js template server

pull 이후 다음과 같이 종속 항목을 설치하십시오.

$ npm install

MacOS 또는 Linux에서는 다음 명령을 사용하여 앱을 실행하십시오.

$ DEBUG=myapp:* npm start

Windows에서는 다음 명령을 사용하십시오.

> set DEBUG=myapp:* & npm start

이후 브라우저에서 http://localhost:3000/을 로드하여 앱에 액세스하십시오.

* 로그에 Development Mode 출력되어야 개발자모드로 작동함.

Terminal, Shell 창에서 아래 실행
운영서버에서 nodejs 모드 production 
$ export NODE_ENV=production

로컬 및 개발서버에서 nodejs 모드 development 
$ export NODE_ENV=development

디렉토리 구조

.
├── app.js
├── bin
│   └── www
├── package.json
├── public
│   ├── images
│   ├── js
│   └── stylesheets
│       └── style.css
├── routes
│   └── index.js
├── config
│   ├── dev.conf.js
│   └── prod.conf.js
├── controller
│   └── user.controller.js
├── models
│   └── user.js
└── views
    ├── users
    │   └── index.ejs
    ├── error.ejs
    └── index.ejs
