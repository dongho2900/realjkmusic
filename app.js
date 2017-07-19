/**
 * Created by choedongho on 2017. 7. 15..
 */
const util = require('util')
const express = require('express')
const app = express();
const router = require('./route/router')
const path = require('path')
const bodyParser = require('body-parser')
const http = require('http')
const fs = require('fs')
const passport = require('passport')
const cookieParser = require('cookie-parser');
const session = require('express-session')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise;
const autoIncrement = require('mongoose-auto-increment');

const db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log('mongodb connect')
});

const connect = mongoose.connect('mongodb://localhost:27017/user', {useMongoClient : true})
autoIncrement.initialize(connect);

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var sessionMiddleWare = session({
    secret: 'fastcampus',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 2000 * 60 * 60 //지속시간 2시간
    }
});
app.use(sessionMiddleWare);

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    app.locals.isLogin = req.isAuthenticated();
    //app.locals.urlparameter = req.url; //현재 url 정보를 보내고 싶으면 이와같이 셋팅
    //app.locals.userData = req.user; //사용 정보를 보내고 싶으면 이와같이 셋팅

    app.locals.userData = req.user
    app.locals.userName = req.body.displayName
    next();
});

app.use('/', router);
app.use(express.static('img'))
app.use(express.static('music'))





app.listen(3000, function(err){
    if(err){
        console.log(err);
    }
    else{
        console.log("server started")
    }
})