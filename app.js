var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser')
var cors = require('cors');
var helmet = require('helmet')

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/apiRoute');
// var usersRouter = require('./routes/users');

/* =======================
    LOAD THE CONFIG
==========================*/
process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

// 전역변수 선언
if (process.env.NODE_ENV == 'production') {
	console.log("Production Mode");
	global.config = require('./config/prod.conf')
} else if (process.env.NODE_ENV == 'development') {
	console.log("Development Mode");
	global.config = require('./config/dev.conf')
}

global.osbConfig = {
    chainId: config.chainId,
    httpEndpoint: `${config.protocol}://${config.host}:${config.port}`,
    broadcast: true,
    verbose: false,
	sign: true,
	expireInSeconds: 60
};

var app = express();
app.use(helmet());	// 보안 설정(http 헤더 보안)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret: config.domain,
	resave: false,
	saveUninitialized: true,
	store: new FileStore()
}));

//set the layouts
const expressLayouts = require('express-ejs-layouts');
// ejs-layouts setting
app.set('layout', './layout/layout');
app.set("layout extractScripts", true);
app.use(expressLayouts);

app.use('/', indexRouter);
app.use('/api', apiRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	res.render('error', { layout: './layout/single-layout' });
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error', { layout: './layout/single-layout' });
});

module.exports = app;