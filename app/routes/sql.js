const express = require('express');
const router = express.Router();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var jsonParser = bodyParser.json()
const { spawn } = require('child_process');
let { PythonShell } = require('python-shell')
const mysql = require('mysql');
const authJwt = require("../middleware/auth.Jwt");

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Dubaigirl13',
    database: 'mp'
});

var index_get = async (req,res,next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    res.render('pages/sql/index', { data1: " ", data2:" " });
    
}
router.get('/index', [authJwt.verifyToken],  index_get);

var index_post = async (req,res,next) => {
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
    res.render('pages/sql/index', { data1: out1, data2: out2 });
}
router.post('/index', urlencodedParser, index_post);

//machine learning sqli
var sqli_ml_get = async (req,res,next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    res.render('pages/sql/sqli_ml', { data: " " });
}
router.get('/sqli-ml', [authJwt.verifyToken], sqli_ml_get);

var sqli_ml_post = async (req,res,next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
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
        res.render('pages/sql/sqli_ml', { data: out });
    });
}
router.post('/sqli-ml', urlencodedParser, sqli_ml_post);

module.exports = router;

