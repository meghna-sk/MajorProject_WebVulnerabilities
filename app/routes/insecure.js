const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var jsonParser = bodyParser.json()
var CryptoJS = require("crypto-js");
const authJwt = require("../middleware/auth.Jwt")

var index_get = (req,res) => {
    res.render('pages/insecure/index', { data: "", data1: "secret key 123" });
}
router.get('/index', [authJwt.verifyToken], index_get);

var index_post = async(req,res) =>{
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
    res.render('pages/insecure/index', { data: req.body.username, data1: "secret key 123" });
}
router.post('/index', urlencodedParser, index_post);

module.exports = router;