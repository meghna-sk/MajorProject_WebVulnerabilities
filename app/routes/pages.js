const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var jsonParser = bodyParser.json()
var CryptoJS = require("crypto-js");
const otpGenerator = require('otp-generator')
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
const authJwt = require("../middleware/auth.Jwt");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
let { PythonShell } = require('python-shell')
const mysql = require('mysql');

const xss = require('../../xss_mitigate');
const csrf = require('csurf');
const isFromServer = require('../../isFromServer');

// Prevent access of CSRF Token via a script & cookies are to be sent in a first-party context. 
var csrfProtection = csrf({ cookie: {httpOnly: true, sameSite: 'strict'} });
const parseForm = bodyParser.urlencoded({ extended: false });

const addCsrf = (req, res, next) => {
    if (req.headers['content-type'] === 'application/json' || req.headers['accept'] === 'application/json') {
        next();
    } else {
        csrfProtection(req, res, next);
    }
}

const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Dubaigirl13',
  database: 'mp'
});

//const controller = require("../controllers/auth.controller");

//verification routes
router.get('/', (req,res) => {
    res.render('pages/otp/otp');
});

var index_get = (req,res,next) => {
    res.header( 
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    res.render('pages/otp/otp_index.ejs', { data: "", data1: "secret key 123", accessToken:token });
}
router.get('/index', [authJwt.verifyToken], index_get);


var index_post = (req, res) => {
    User.findOne({
      where: {
        username: req.body.username
      }
    })
      .then(user => {
        if (!user) {
          return res.status(404).send({ message: "User Not found." });
        }
  
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );
  
        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!"
          });
        }
  
        global.token = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: 86400 // 24 hours
        });
  
        var authorities = [];
        user.getRoles().then(roles => {
          for (let i = 0; i < roles.length; i++) {
            authorities.push("ROLE_" + roles[i].name.toUpperCase());
          }
          res.render('pages/otp/otp_index.ejs', {
            accessToken: token,
            data: ""
          });
        });
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };
router.post("/index", index_post);


var verify_get = (req,res,next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    res.render('pages/otp/otp.ejs', { data: "", data1: "secret key 123", accessToken:token });
}
router.get('/verify', [authJwt.verifyToken], verify_get);


var verify_post = async(req,res,next) =>{
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();

    if(req.body.username.length === 6){
        var result = otp.localeCompare(req.body.username)
        if (result===0) {
            // req.flash('success', 'Succesfully logged in.')
            res.redirect('/home');
            // res.render('pages/home/index.ejs', { data: "", data1: "secret key 123" });
        } else {
            res.render('pages/otp/otp_verification.ejs', {
                accessToken: token,
                data: "Entered wrong OTP, please try again.",
                data1: "secret key 123"
             });
        }
    }
    else{
        otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets:false });
        console.log("OTP sent: " + otp)
        console.log("Input recieved: " + req.body.username)
        var sender_number = "91"+req.body.username
        var url = "https://messages-sandbox.nexmo.com/v1/messages";

        var XMLHttpRequest = require('xhr2');
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Authorization", "Basic MzllMmJkMDY6TGhBSHhrQk9vRFlkTkpPNg==");
        
        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.responseText);
        }};
        otp 
        var data = `{
            "from": "14157386102",
            "to": "${sender_number}",
            "message_type": "text",
            "text": "${otp} is the OTP to login to your account. It is valid for 5 minutes. Please do not share with anyone. Team OWASP Security Project.",
            "channel": "whatsapp"
        }`;
        
        xhr.send(data);
        res.render('pages/otp/otp_verification.ejs', {
            accessToken: token,
            data: "Number to which OTP is sent: " + req.body.username,
            data1: "secret key 123"
         });
    }
}
router.post('/verify', urlencodedParser, verify_post);

//home
var home_get = (req,res,next) => {
  res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();

  res.render('pages/home/index.ejs', {accessToken:token });
}
router.get('/home', home_get);

//sql
var index_sql_get = async (req,res,next) => {
  res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next()

  res.render('pages/sql/index', { data1: " ", data2:" ", accessToken: token });
  
}
router.get('/sql/index',  index_sql_get);

var index_sql_post = async (req,res,next) => {
  res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
    
  console.log("Username entered: " + req.body.username)
  let out1
  let out2
  connection.query("SELECT * from Persons where username='" + req.body.username + "'", function (err, rows, fields) {
      if (!err) {
          console.log("Unmitigated SQLi Query Output - ")
          console.log(rows)
          out1=rows[0]
      } else{
          console.log('Error Occured.' + err);
          out1=err
      }
  });
  connection.query('SELECT * from Persons where username=?', [req.body.username], function (err, rows, fields) {
      if (!err){
          console.log("Mitigated SQLi Query Output - ")
          console.log(rows);
          out2=rows[0]
      }
      else{
          console.log('Error Occured.' + err);
          out2=err
      }
          
  });
  res.render('pages/sql/index', { data1: out1, data2: out2, accessToken:token });
}
router.post('/sql/index', urlencodedParser, index_sql_post);

//machine learning sqli
var sqli_ml_get = async (req,res) => {
  res.render('pages/sql/sqli_ml', { data: " ", accessToken:token });
}
router.get('/sql/sqli-ml', sqli_ml_get);

var sqli_ml_post = async (req,res) => {

  let options = {
      mode: 'text',
      pythonOptions: ['-u'], // get print results in real-time 
      //scriptPath: 'path/to/my/scripts', //If you are having python_test.py script in same folder, then it's optional. 
      args: [req.body.username] //An argument which can be accessed in the script using sys.argv[1] 
  };

  var out
  await PythonShell.run('/home/meghna/Desktop/SEM_8/MP/MajorProject_WebVulnerabilities/ml/ml_detect_sqli.py', options, function (result, err) {
      // received a message sent from the Python script (a simple "print" statement)
      console.log(result);
      console.log(err);
      out = err[4]
      res.render('pages/sql/sqli_ml', { data: out, accessToken:token });
  });
}
router.post('/sql/sqli-ml', urlencodedParser, sqli_ml_post);

//insecure
var index_insecure_get = (req,res) => {
  res.render('pages/insecure/index', { data: "", data1: "secret key 123", accessToken:token });
}
router.get('/insecure/index', index_insecure_get);


var index_insecure_post = async(req,res) =>{
  console.log("Input from frontend: " + req.body.username)
  var input = req.body.username.split(" ")
  console.log("Encrypted Input: "+input)
  var bytes = CryptoJS.AES.decrypt(input[0], 'secret key 123');
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  var hash = CryptoJS.SHA256(input[1])
  hash = hash.toString()
  console.log("Hash: " + hash)
  if(hash === originalText)
  {
      console.log('Verified.')
  }
  else
  {  
      console.log("Hash: " + hash)
      console.log(originalText)
  }   
  res.render('pages/insecure/index', { data: req.body.username, data1: "secret key 123", accessToken:token });
}
router.post('/insecure/index', urlencodedParser, index_insecure_post);

//xxe-xss
var show = (req, res) => {
  let query = "SELECT * FROM employee";
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
router.get('/xss-xxe/show', csrfProtection, show)

//add route
var addUserForm = (req, res) => {

  res.render('pages/xss_xxe/add.ejs', {
      title: 'Add a new user',
      message: '',
      csrfToken: req.csrfToken()
  }); 
}

var addUser = (req, res) => {

  let name = xss(req.body.name || req.body.user.name[0]);
  let designation = xss(req.body.designation || req.body.user.designation[0]);

  const test = str => /[!@#$%^&()_+\-=\[\]{};':"\\|,.<>\/?]/.test(str);
  
  if(test(name) || test(designation)){
      console.log("XSS/XXE attack detected")
      
      return res.redirect('show');
  }

  let query = "INSERT INTO `employee` (name, designation) VALUES (?, ?)";
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


router.get('/xss-xxe/add', csrfProtection, addUserForm);
router.post('/xss-xxe/add', parseForm, addCsrf, addUser);

module.exports = router;