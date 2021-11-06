const express = require('express');
const router = express.Router();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var jsonParser = bodyParser.json()
const { spawn } = require('child_process');
let { PythonShell } = require('python-shell')
const mysql = require('mysql');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mp'
});

var index_get = async (req,res) => {
    res.render('pages/index', { data: req.body });
}
router.get('/sql/index', index_get);

var index_post = async (req,res) => {
    console.log("Username entered: " + req.body.username)
    var out1
    connection.query("SELECT * from Persons where username='" + req.body.username + "'", function (err, rows, fields) {
        if (!err) {
            console.log("Unmitigated SQLi Query Output - ")
            console.log(rows)
            out1 = rows
        } else
            console.log('Error Occured.', err);
    });
    connection.query('SELECT * from Persons where username=?', [req.body.username], function (err, rows, fields) {
        if (!err){
            console.log("Mitigated SQLi Query Output - ")
            console.log(rows);
        }
        else
            console.log('Error Occured.', err);
    });

    res.render('pages/sql/index', { data: out1 });
}
router.post('/index', urlencodedParser, index_post);

//machine learning sqli
var sqli_ml_get = async (req,res) => {
    res.render('pages/sql/sqli_ml', { data: req.body });
}
router.get('/sql/sqli-ml', sqli_ml_get);

var sqli_ml_post = async (req,res) => {
    let options = {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time 
        //scriptPath: 'path/to/my/scripts', //If you are having python_test.py script in same folder, then it's optional. 
        args: [req.body.username] //An argument which can be accessed in the script using sys.argv[1] 
    };
    //let pyshell = new PythonShell('script1.py');
    // await PythonShell.run('ml_detect_sqli.py', null, function (err) {
    //     if (err) throw err;
    //     console.log('finished');
    // });

    var out
    await PythonShell.run('/home/meghna/Desktop/SEM_7/MP/MajorProject_WebVulnerabilities/ml/ml_detect_sqli.py', options, function (result, err) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(result);
        console.log(err);
        out = err[4]
        res.render('pages/sql/sqli_ml', { data: out });
    });
}
router.post('/sqli-ml', urlencodedParser, sqli_ml_post);

//sql routes
router.get('/index', (req,res)=> {
    res.render('pages/sql/index');
})

router.get('/sqli-ml', (req,res)=> {
    res.render('pages/sql/sqli_ml');
})

module.exports = router;

