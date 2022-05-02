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
const https = require("https");
const cors = require("cors");

const config = require("./app/config/db.config.js");

const app = express();
app.disable('view cache');

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(myConnection(mysql, {
    host: config.HOST,
    user: config.USER,
    password: config.PASSWORD,
    database: config.DB,
}));

app.set('views', path.join(__dirname, '/app/views'));

var corsOptions = {
    origin: "http://localhost:8081"
  };
  app.use(cors(corsOptions));
  // parse requests of content-type - application/json
  app.use(express.json());
  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: true }));


const db = require("./app/models");
const Role = db.role;
db.sequelize.sync();

function initial() {
  Role.create({
    id: 1,
    name: "user"
  });
 
  Role.create({
    id: 2,
    name: "moderator"
  });
 
  Role.create({
    id: 3,
    name: "admin"
  });
}

  
app.disable('x-powered-by');
app.use(cookieParser())
app.use(enforceSSL);
app.use(xmlparser({ strict: true }));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//appropriate headers allowed
// app.use(helmet({
//     hsts: {
//         preload: true
//     },
//     contentSecurityPolicy: {
//         directives: {
//             "defaultSrc": ["'self'", "'unsafe-inline'"],
//             "styleSrc": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com/" ,"https://maxcdn.bootstrapcdn.com"],
//             "scriptSrc": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com/"],
//         }
//     }
// }));


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
  
//routes
app.use('/', require('./app/routes/pages'));
// app.use('/home', require('./app/routes/home'));
// app.use('/xss-xxe', require('./app/routes/xss_xxe'));
// app.use('/sql', require('./app/routes/sql'));
// app.use('/insecure', require('./app/routes/insecure'));

//port 8000
const PORT = process.env.PORT || 8080

//regular server
app.listen(PORT, () => {
    console.log(`Server is up and running on ${PORT}`);
});

//development purpose ssl certificate added server
// const sslServer = https.createServer({
//     key: fs.readFileSync(path.join(__dirname,'cert','key.pem')),
//     cert: fs.readFileSync(path.join(__dirname,'cert','cert.pem')),
// }, app)

// sslServer.listen(PORT, () => console.log(`Secure server is up and running on ${PORT}`));
