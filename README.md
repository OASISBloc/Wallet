# OASISBloc Wallet
A simple based OSB wallet

# Development

**Install all it's dependencies.**

$ npm install

**Start server**

MacOS OR Linux

$ DEBUG=myapp:* npm start

Windows

set DEBUG=myapp:* & npm start

**Open in browser.**

http://localhost:3000/



**Directory structure**

```.
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
```
