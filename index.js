const express = require('express');
const mysql = require('mysql');
const helmet = require('helmet');
const ejs = require('ejs');
const myConnection = require('express-myconnection');
let xmlparser = require('express-xml-bodyparser');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
const enforceSSL = require('./enforceSSL');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
var util = require('util');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });


const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(myConnection(mysql, {
    host: "localhost",
    user: "root",
    password: "",
    database: "mp",
}));

app.disable('x-powered-by');
app.use(cookieParser())
app.use(enforceSSL);
app.use(xmlparser({ strict: true }));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//appropriate headers allowed
app.use(helmet({
    hsts: {
        preload: true
    },
    contentSecurityPolicy: {
        directives: {
            "defaultSrc": ["'self'", "'unsafe-inline'"],
            "styleSrc": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com/" ,"https://maxcdn.bootstrapcdn.com"],
            "scriptSrc": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com/"],
        }
    }
}));


let logstream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags:'a'})
const publicdir = path.join(__dirname, './Web_Vulnerabilities_MP');                        //__dirname gives the path of the current directory of your project
app.use(express.static(publicdir));
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',{stream:logstream}));
app.use(morgan('combined', {
    skip : function(req,res) {return res.statusCode < 400}
}))

var log_stdout = process.stdout;
console.log = function(d) { //
    require('log-timestamp');
    logstream.write(util.format(d) + '\n');
    require('log-timestamp');
    log_stdout.write(util.format(d) + '\n');
  };
  
app.use('/', require('./routes/pages'));
app.use('/xss-xxe', require('./routes/xss_xxe'));
app.use('/sql', require('./routes/sql'));
app.use('/insecure', require('./routes/insecure'));

//port 8000
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server is up and running on ${PORT}`);
});

