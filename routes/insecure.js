const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var jsonParser = bodyParser.json()
var CryptoJS = require("crypto-js");


var index_get = (req,res) => {
    res.render('pages/insecure/index', { data: req.body });
}
router.get('/index',index_get);

var index_post = async(req,res) =>{
    console.log(req.body)
    var input = req.body.username.split(" ")
    console.log(input)
    var bytes = CryptoJS.AES.decrypt(input[0], 'secret key 123');
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    var hash = CryptoJS.SHA256(input[1])
    hash = hash.toString()
    console.log(hash)
    if(hash === originalText)
    {
        console.log('Verified.')
    }
    else
    {  
        console.log(hash)
        console.log(originalText)
    }
    res.render('pages/insecure/index', { data: req.body.username });
}
router.post('/index', urlencodedParser, index_post);

module.exports = router;