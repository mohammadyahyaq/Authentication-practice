// import all the necessary packages
require('dotenv').config()

const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const { Passport } = require('passport');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: 'randomText',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize()); // to start using passport for authintication
app.use(passport.session());

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/UsersDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// adding encryption layer security method
// --------------------------------------------------------------------------------------------
//const encrypt = require('mongoose-encryption');
//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route('/')
    .get(function (req, res) {
        res.render('home');
    });

app.route('/register').get(function (req, res) {
    res.render('register')
}).post(function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    // let password = md5(req.body.password); //hashed password with md5

    // bcrypt.genSalt(saltRounds, function(err, salt) {
    //     bcrypt.hash(password, salt, function(err, hash) {
    //         // Store hash in your password DB.
    //         let newUser = new User({
    //             username: username,
    //             password: hash // this password is bcrybted with hashx10
    //         });

    //         newUser.save();
    //     });
    // });

    User.register({ username: username }, password, function (err, User) {
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, function () {
                res.redirect('/secret')
            })
        }
    })
    // res.render('secrets');
    // console.log(username + ' ' + password);
});

app.route('/login').get(function (req, res) {
    res.render('login');
}).post(function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    // let password = md5(req.body.password); //hashed password with md5
    req.login(user, function(err){
        if(err){
            console.log("haven't logged in!");
            console.log(err);
            res.redirect('/login');
        } else {
            passport.authenticate('local')(req, res, function(){
                res.redirect('/secret');
            });
        }
    });
    // User.find(function (err, usersList) {
    //     if (!err) {
    //         let isFound = false;
    //         usersList.forEach(element => {
    //             bcrypt.compare(password, element.password, function(err, result) {
    //                 if (result == true) {
    //                     isFound = true;
    //                     res.render('secrets');
    //                 }
    //             });
    //         });
    //         if(isFound === false) {
    //             console.log('password not found');
    //         }
    //     } else {
    //         console.log(err);
    //     }
    // })

    // console.log(username + ' ' + password);
});

app.get('/secret', function (req, res) {
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', function(req, res){
    req.logOut();
    res.redirect('/');
})

app.listen(3000, function () {
    console.log('the server is lestening at port 3000');
});