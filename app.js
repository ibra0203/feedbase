
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
 // require ('./server/helperFunctions.js');
  var app = express();
  var server = http.createServer(app);

  var io = require("socket.io")(server);



   global.ThisUser =null;
  global.userId=null;



  var serviceAccount = require("./data/serviceAccount.json");

process.env.PWD = process.cwd();

// Then
app.use(express.static(process.env.PWD + '/client/build'));
var publicPath = path.join(process.env.PWD, '/client/build');

  const admin = require('firebase-admin');
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://feedbase-1.firebaseio.com/",
  authDomain: "feedbase-1.firebaseapp.com",
  storageBucket: "feedbase-1.appspot.com",
  messagingSenderId: "648197207783"
});


var config = {
  apiKey: "AIzaSyCBPf2A8yVY5egl0omP7k7jBlX4vfAuxh0",
  authDomain: "feedbase-1.firebaseapp.com",
  databaseURL: "https://feedbase-1.firebaseio.com",
  storageBucket: "feedbase-1.appspot.com",
  messagingSenderId: "648197207783"

};
firebase.initializeApp(config);
const database = admin.database();
app.set('port', process.env.PORT || 3000);
app.use(favicon(process.env.PWD  + '/public/images/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ limit: '10mb',extended: true, parameterLimit: 1000000}));
app.use(methodOverride('_method'));
//app.use(cookieParser());

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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.




/*
app.get('/_admin', (req, res, next) => {
    dbRef.child('users/').on('value', function(snaps){
      snaps.forEach(function(snap)
      {
        var _uid = snap.key;
        dbRef.child('users/'+_uid).update({
          profile_desc: "_"
        
        
        })
      }); 
    });

    
  });*/
 




/*function checkOnCurrentUser()
{
  var _user = firebase.auth().currentUser;

if(_user)
{
  
  userID = _user.uid;
  ThisUser = getUserInfo(userID);
  console.log(ThisUser);
  ThisUser.uid = userID;
}
else
{
  console.log('incorrect user');
}
}*


setTimeout(checkOnCurrentUser, 3000);*/
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

app.get(/\/((?![\/_]).*)/g, (req, res) => {
  
  res.sendFile(path.join(process.env.PWD +'/client/build/index.html'));
  console.log('Cookies: ', req.cookies);
});
