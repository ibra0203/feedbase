
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , bodyParser = require('body-parser')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , methodOverride = require('method-override')
  , firebase = require('firebase'),
   cookieParser = require('cookie-parser');
;
global.XMLHttpRequest = require("xhr2");
var Storage = require('@google-cloud/storage');
var app = express();
var server = http.createServer(app);

var io = require("socket.io")(server);

//Removed for security reasons
var serviceAccount = require("./data/serviceAccount.json");

process.env.PWD = process.cwd();

//Configure static directory
app.use(express.static(process.env.PWD + '/client/build'));

//Removed for security reasons
//Configure firebase and firebase admin
  const admin = require('firebase-admin');
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3a81bd9dd57cc1828eeec1b23f7422635953fcac
  databaseURL: "*****",
  authDomain: "*****",
  storageBucket: "*****",
  messagingSenderId: "*****"
<<<<<<< HEAD
=======
  databaseURL: "***",
  authDomain: "***",
  storageBucket: "***",
  messagingSenderId: "***"
>>>>>>> 75f366094efe6739160b659f5cb2c4e52a40b7e6
=======
>>>>>>> 3a81bd9dd57cc1828eeec1b23f7422635953fcac
});


var config = {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3a81bd9dd57cc1828eeec1b23f7422635953fcac
  apiKey:"*****",
  authDomain: "*****",
  databaseURL: "*****",
  storageBucket: "*****",
  messagingSenderId: "*****",
<<<<<<< HEAD
=======
  apiKey: "***",
  authDomain: "***",
  databaseURL: "***",
  storageBucket: "***",
  messagingSenderId: "***"
>>>>>>> 75f366094efe6739160b659f5cb2c4e52a40b7e6
=======
>>>>>>> 3a81bd9dd57cc1828eeec1b23f7422635953fcac

};
firebase.initializeApp(config);
const database = admin.database();
//Set port if not found
app.set('port', process.env.PORT || 3000);

//Settings and other middlewares
app.use(favicon(process.env.PWD  + '/public/images/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '10mb',extended: true, parameterLimit: 1000000}));
app.use(methodOverride('_method'));

if (app.get('env') == 'development') {
  app.locals.pretty = true;
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Load controllers and pass the required objects
require('./server/controllers/users.js')(app, firebase, admin,database, io );
require('./server/controllers/posts.js')(app, firebase, admin,database, io );




//Listen to port
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//Any get request that doesn't start with an underscore gets redirected to home
app.get(/\/((?![\/_]).*)/g, (req, res) => {
  
  res.sendFile(path.join(process.env.PWD +'/client/build/index.html'));
  console.log('Cookies: ', req.cookies);
});
