const express = require('express');
const router = express.Router();
const xss = require('../../xss_mitigate');
const csrf = require('csurf');
// Prevent access of CSRF Token via a script & cookies are to be sent in a first-party context. 
var csrfProtection = csrf({ cookie: {httpOnly: true, sameSite: 'strict'} });
const bodyParser = require('body-parser');
const parseForm = bodyParser.urlencoded({ extended: false });

const addCsrf = (req, res, next) => {
    if (req.headers['content-type'] === 'application/json' || req.headers['accept'] === 'application/json') {
        next();
    } else {
        csrfProtection(req, res, next);
    }
}
const authJwt = require("../middleware/auth.Jwt");
//show route
var show = (req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    let query = "SELECT * FROM users";
    req.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            console.log('Something went wrong!')
            return res.status(500).send(err);
        }
        conn.query(query, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            res.render('pages/xss_xxe/show.ejs', {
                title: 'Show all data',
                users: result
            });
        });   
    })
}
router.get('/show', [authJwt.verifyToken], csrfProtection, show);

//add route
var addUserForm = (req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    res.render('pages/xss_xxe/add.ejs', {
        title: 'Add a new user',
        message: '',
        csrfToken: req.csrfToken()
    }); 
}

var addUser = (req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    let name = xss(req.body.name || req.body.user.name[0]);
    let designation = xss(req.body.designation || req.body.user.designation[0]);

    const test = str => /[!@#$%^&()_+\-=\[\]{};':"\\|,.<>\/?]/.test(str);
    
    if(test(name) || test(designation)){
        console.log("XSS/XXE attack detected")
        
        return res.redirect('show');
    }

    let query = "INSERT INTO `users` (name, designation) VALUES (?, ?)";
    if (name === '[object Object]' || designation === '[object Object]') {
        //console.log("XSS/XXE attack detected")
        //res.status(403).json('XSS/XXE Attack Detected!')
        return res.status(403).json('Incorrect URL encountered!')
        //return res.redirect('show');
    }
    req.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        conn.query(query, [name, designation], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            console.log(res)
            res.redirect('show');
        });        
    })
}

router.get('/add', [authJwt.verifyToken], csrfProtection, addUserForm);
router.post('/add', parseForm, addCsrf, addUser);

module.exports = router;