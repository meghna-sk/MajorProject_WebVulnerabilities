const express = require('express');
const router = express.Router();
const authJwt = require("../middleware/auth.Jwt");

router.get('/', [authJwt.verifyToken], (req,res) => {
    res.render('pages/home/index');
});
module.exports = router;
