/**
 * Created by choedongho on 2017. 7. 15..
 */
const express = require('express')
const router = express.Router();
const UserModel = require('../models/user')
const ImageModel = require('../models/image')
const MusicModel = require('../models/music')
const loginRequired = require('../libs/loginRequired');
const passwordHash = require('../libs/passwordHash');
const auth = require('../auth/auth')
const fs = require('fs')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer')
//const upload = multer({ dest: 'img/' })
const storage_img = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'img/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload_img = multer({ storage: storage_img })

const storage_music = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'music/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

// passport.use(new LocalStrategy(
//     function(username, password, done) {
//         User.findOne({ userID: username }, function (err, user) {
//             if (err) { return done(err); }
//             if (!user) {
//                 return done(null, false, { message: 'Incorrect username.' });
//             }
//             if (!user.validPassword(password)) {
//                 return done(null, false, { message: 'Incorrect password.' });
//             }
//             return done(null, user);
//         });
//     }
// ));

passport.use(new FacebookStrategy({
        clientID: '450098238686183',
        clientSecret: 'ffef8b3d024efe46ad5d56b645e8f819',
        callbackURL: "/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {

        var authID = 'facebook:' + profile.id;
        UserModel.findOne({ userID : authID }, function(err, user){
            if(!user){  //없으면 회원가입 후 로그인 성공페이지 이동
                var regData = { //DB에 등록 및 세션에 등록될 데이터
                    userID :  authID,
                    userPassword : "facebook_login",
                    displayName : profile.displayName
                };
                var User = new UserModel(regData);
                User.save(function(err){ //DB저장
                    done(null,regData); //세션 등록
                });
            }else{ //있으면 DB에서 가져와서 세션등록
                done(null,user);
            }

        });

        // User.findOrCreate(..., function(err, user) {
        //     if (err) { return done(err); }
        //     done(null, user);
        // });
    }
));

const upload_music = multer({ storage: storage_music })


router.get('/', function(req,res){
        res.render('../views/realmain')
    })
    // .get('/', function(req,res){
    //     if(!req.isAuthenticated()){
    //         res.send('<script>alert("로그인이 필요한 서비스입니다.");location.href="/accounts/login";</script>');
    //     }else{
    //         res.render('/main_music');
    //     }
    // })
    .get('/main_photo', loginRequired ,function(req, res){

        ImageModel.find( function(err,images){ //첫번째 인자는 err, 두번째는 받을 변수명
            res.render( '../views/main' ,
                { images : images } // DB에서 받은 products를 products변수명으로 내보냄
            );
        });

    })
    // .get('/welcome', function(req, res){
    //     res.send(req.session.passport.user.displayName)
    // })


    .get('/main_music', loginRequired,function(req,res){
        MusicModel.find( function(err,musics){ //첫번째 인자는 err, 두번째는 받을 변수명
            res.render( '../views/main(music)' ,
                { musics : musics } // DB에서 받은 products를 products변수명으로 내보냄
            );
        });
    })


    .get('/join', function(req, res){
        res.render('../views/join_form')
    })
    .post('/join', function(req, res){
        const User = new UserModel({
            userID : req.body.userID,
            userPassword : passwordHash(req.body.password),
            displayName : req.body.displayName
        })
        User.save(function(err){
            res.redirect('/welcome')
        })

    })
    .get('/image', function(req, res){
        res.render('../views/upload_image')
    })


    .post('/image', upload_img.single('photo'), function (req, res, next) {
        const Image = new ImageModel({
            imageName : req.file.filename
        })
        Image.save(function(err){

            res.redirect('/main_photo')

        })
    })

    .get('/upload_music', function(req, res){
        res.render('../views/upload_music_form')
    })
    .post('/upload_music', upload_music.single('music'), function (req, res, next) {
        const Music = new MusicModel({
            musicName : req.file.filename
        })
        Music.save(function(err){

            res.redirect('/main_music')

        })
    })
    .get('/main_music', function(req, res){
        res.render('../views/main(music)')
    })
    .get('/delete_image/:_id',function(req, res){
        ImageModel.remove({ _id : req.params._id }, function(err){
            res.redirect('/main_photo');
        });

    })
    .get('/delete_music/:_id',function(req, res){
        MusicModel.remove({ _id : req.params._id }, function(err){
            res.redirect('/main_music');
        });

    })
    .get('/login', function(req, res){
        res.render('login_form')
    })
    .post('/login', function(req, res, next){
        passport.authenticate('local', function(err, user, info){
            if(!user){
                return res.json({ message: info.message });
            }
            req.logIn(user, function(err) {
                return res.json({ message : "success" });
            });
        })

    })
    .get('/auth/facebook', passport.authenticate('facebook'))
    .get('/auth/facebook/callback',
        passport.authenticate('facebook', { successRedirect: '/',
            failureRedirect: '/login' }))
    .get('/logout', function(req, res){
        req.logout();
        res.redirect('/login');
    })
    .get('/welcome', function(req, res){
        res.render('../views/welcome')
    })
    .get('/detail', function(req, res){
        var imageName = req.param('imageName')
        ImageModel.findOne({imageName : imageName}, function(err, images){
            res.render('detail', {images : images})
        })
    })




//로그인 성공시 이동할 주소
router.get('/facebook/success', function(req,res){
    res.send(req.user);
});

router.get('/facebook/fail', function(req,res){
    res.send('facebook login fail');
});


module.exports = router;