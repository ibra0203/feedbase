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

	//File removed for security reasons
  var serviceAccount = require("./data/serviceAccount.json");

process.env.PWD = process.cwd();

app.use(express.static(process.env.PWD + '/client/build'));
var publicPath = path.join(process.env.PWD, '/client/build');

  const admin = require('firebase-admin');
  
  //Info replaced for security reasons
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "***",
  authDomain: "***",
  storageBucket: "***",
  messagingSenderId: "***"
});

  //Info replaced for security reasons
var config = {
  apiKey: "***",
  authDomain: "***",
  databaseURL: "***",
  storageBucket: "***",
  messagingSenderId: "***"

};
firebase.initializeApp(config);
const database = admin.database();
app.set('port', process.env.PORT || 3000);
app.use(favicon(process.env.PWD  + '/public/images/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '10mb',extended: true, parameterLimit: 1000000}));
app.use(methodOverride('_method'));

if (app.get('env') == 'development') {
  app.locals.pretty = true;
}
require('./server/users.js')(app, firebase, admin,database, io );
require('./server/posts.js')(app, firebase, admin,database, io );


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

app.get(/\/((?![\/_]).*)/g, (req, res) => {
  
  res.sendFile(path.join(process.env.PWD +'/client/build/index.html'));
  console.log('Cookies: ', req.cookies);
});
