const constants = require('../constants');
var cookie = require('cookie');
const Multer = require('multer');
const uuidv1 = require('uuid/v1');


module.exports = function(app, firebase, admin, database, io) {

    require('../helperFunctions')(app, firebase, admin, database, io);

    const multer = Multer({
        storage: Multer.memoryStorage(),
        limits: {
            fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
        }
    });
    //Reference to database
    const dbRef = database.ref();
    //Counting the number of sockets
    var socketNumber = 1;
    //Cookie-Socket map
    let cookieSocket = new Map();
    //Cookie-User ID map
    let cookieAndUid = new Map();
    //Cookie-User Info map
    let cookieAndUser = new Map();

    //When a new socket connects
    //Callback function is async to allow delaying when cookie isn't set yet
    io.on('connection', async (client) => {
        console.log("connected sockets: " + socketNumber);
        //Increase socket number
        socketNumber++;
        var socket = client;
        //If cookie not set yet (issue with Edge), then wait for half a second
        if (typeof client.request.headers.cookie != 'string')
            await delay(500);
        //Get the whole cookie
        var _cookie = client.request.headers.cookie;
        console.log(client.request.headers.cookie);
        //Parse then extract the part of interest
        var newCookie = cookie.parse(_cookie).user_id;

        if (newCookie != null) {
            //This segment checks if the user's cookie is already stored. If it is, the session is resumed. 
            //Otherwise, a new session is started
            if (cookieSocket.get(newCookie) == null) {
                cookieSocket.set(newCookie, socket);
                socket.emit('session start');
                socketNumber++;

            } else {
                //If cookie already exists, set its value in the cookie-socket map to the new socket
                cookieSocket.set(newCookie, socket);
                //   socket = cookieSocket.get(newCookie);
            }
        }
        console.info(`Client connected [id=${newCookie}]`);

        //Listener for when a new page loads with a PostGroup component (containers for posts)
        socket.on('PostGroup', (_location) => {
            var sendNewChild = false;
            //Listener for when a new post is added
            var onChildAdded = function(snap) {
                if (sendNewChild) {
                    let val = snap.val();
                    let _date = new Date(val.date_created);
                    var secondsSinceAdded = (new Date() - _date) / 1000;
                    if (secondsSinceAdded < 5)
                        socket.emit('new post', val);
                    console.log('on child added called - ' + secondsSinceAdded);

                }
                sendNewChild = true;
            };
            database.ref('posts/' + _location + '/').orderByChild('date_created').limitToLast(1).on('child_added', onChildAdded);
            //Emit the last 10 posts from the post group
            let storedRef = database.ref('/posts/' + _location + '/').orderByChild('date_created');
            storedRef.limitToLast(10).once('value', function(snaps) {

                socket.emit('initial posts', snaps.val());
            });
            //Listen to when the PostGroup is unloaded, removes listener 
            socket.once('PostGroup off', () => {
                database.ref('posts/' + _location + '/').orderByChild('date_created').limitToLast(1).off('child_added', onChildAdded);
            });

        });


        socket.on("disconnect", () => {
            socketNumber--;
            console.info(`Client gone [id=${client.id}]`);
            let _cookie = getKeyFromValue(cookieSocket, socket);
            cookieSocket.set(_cookie, {});
        });




    });

    //Create new user
    app.post('/user/create', (req, res, next) => {
        const data = req.body;

        verifyUserNotDuplicate(data.Username, data.Email).then(function(dataChecker) {
            if (dataChecker)
                if (dataChecker.userExists || dataChecker.emailExists) {
                    console.log("Duplicate found");

                    console.log(JSON.stringify(dataChecker));
                    res.json({
                        userExists: dataChecker.userExists,
                        emailExists: dataChecker.emailExists
                    });

                }
            else {
                try {
                    console.log("No duplicates");
                    var uid;
                    var creationDate = getTimeNow();
                    console.log(creationDate);

                    firebase.auth().createUserWithEmailAndPassword(data.Email, data.Password).then(function(usr) {
                        uid = usr.user.uid;

                        dbRef.child('users/' + uid).set({
                            username: data.Username,
                            age: data.Age,
                            uid: uid,
                            country: data.Country,
                            email: data.Email,
                            profile_img: 'default.png',
                            profile_desc: "",
                            creation_date: creationDate,
                            last_activity: creationDate


                        }).then(function() {
                            dbRef.child('users/' + uid).once('value', function(snap) {
                                var user = snap.val();
                                user.uid = uid;

                                res.json({
                                    userExists: dataChecker.userExists,
                                    emailExists: dataChecker.emailExists,
                                    User: user
                                });

                            });
                        });
                    });
                } catch (e) {
                    console.log(e)
                }
            };
        })

    });

    //Login new user
    app.post('/user/login', (req, res) => {
        const data = req.body;
        firebase.auth().signInWithEmailAndPassword(data.Email, data.Password)
            .then(function(nUser) {
                var uid = nUser.user.uid;
                var userID = uid;
                dbRef.child('users/' + uid).once('value').then(function(snap) {
                    var UserInfo = snap.val();
                    UserInfo.uid = uid;
                    var resp = {
                        Success: true,
                        User: UserInfo
                    };
                    updateUserLastActivityDate(userID);
                    if (data.Cookie) {
                        cookieAndUser.set(data.Cookie, UserInfo);


                        var socket = cookieSocket.get(data.Cookie);
                        if (socket) {
                            cookieAndUid.set(data.Cookie, uid);

                            socket.emit('login', UserInfo);

                        }
                        setTimeout(function() {
                            cookieAndUser.delete(data.Cookie);
                            cookieAndUid.delete(data.Cookie);

                        }, 3600000);
                    }
                    firebase.auth().signOut();
                    res.json(resp);
                })
            }).catch(function(err) {
                var resp = {
                    Success: false
                };

                res.json(resp);
            });

    });

    //Get public filename
    app.get('/_public/:filename', (req, res, next) => {
        const filename = req.params.filename;
        var pathName = path.join(publicPath, filename);
        var resp = {
            file: pathName
        };
        console.log(resp.file);
        res.json(resp);
    });

    //Get users from query
    app.get('/_searchusers/:query/:uname*?', (req, res, next) => {
        var query = req.params.query;
        var startUsername = req.params.uname;
        query = query.toLowerCase();
        let qRef = dbRef.child('users').orderByChild('username');
        if (startUsername) {
            console.log("startUsername: " + startUsername);
            qRef = dbRef.child('users/').orderByChild('username').startAt(startUsername);
        }
        var results = [];
        var maxResults = 10;
        dbRef.child('users/').orderByChild('username').limitToFirst(maxResults + 1).once('value').then(function(snaps) {

            snaps.forEach(function(snap) {
                snap = snap.val();
                var username = snap.username;
                username = username.toLowerCase();
                if (username.includes(query)) {
                    results.push(filterObjectKeys(snap, ['username', 'profile_img', 'uid']));
                }

            });
            Promise.all(results.map(function(r) {
                return getProfileImageHTMLUrl(r.profile_img).then(function(url) {
                        r.imgurl = url;
                        return r.imgurl;
                    })
                    .catch(function(e) {
                        console.log(e);
                    });
            })).then(function(e) {

                let resultsObj = {};
                let c = 0;
                for (var i = 0; i < results.length; i++) {
                    if (results[i] !== undefined) {
                        resultsObj['n' + c] = results[i];
                        c++;
                    }
                }

                res.json(resultsObj);
            });

        });


    });


    //Get the profile info of the user with the specific ID
    app.get('/_profileinfo/:id', (req, res, next) => {
        const id = req.params.id;
        getUserInfo(id, [], ['email']).then(function(resp) {
            console.log(resp);
            res.json(resp);
        });

    });

    //Get user from cookie
    app.get('/_getuser/:cookies', (req, res, next) => {
        var _cookie = req.params.cookies;
        var currentUser;
        if (_cookie)
            currentUser = cookieAndUser(_cookie);
        if (currentUser) {
            var uid = currentUser.uid;
            dbRef.child('users/' + uid).once('value').then(function(snap) {
                userData = snap.val();
                userData.uid = uid;
                var resp = {
                    Success: true,
                    User: userData
                };

                res.json(resp);
            });
        } else {
            res.json({
                Success: false
            });
        }


    });

    //Logout user by cookie
    app.get('/_logout/:cookie', (req, res, next) => {
        let cookie = req.params.cookie;
        if (cookie)
            if (!cookieAndUser.get(cookie))
                res.json({
                    Success: true
                });



        var _uid = cookieAndUser.get(cookie).uid;


        let socket = cookieSocket.get(cookie);
        if (socket) {
            socket.emit('logout');
            cookieAndUid.delete(cookie);
            cookieAndUser.delete(cookie);
        }
        res.json({
            Success: true
        });


    });

    //Set user profile image
    app.post('/_profile_image_update/:uid', multer.single('file'), (req, res) => {
        let file = req.file;
        let uid = req.params.uid;
        if (file) {
            let oldFileName = file.originalname;
            let extension = oldFileName.split('.').slice(-1)[0];
            let newFileName = uuidv1() + '.' + extension;
            uploadImageToStorage(file, 'images/profile/', newFileName).then((success) => {
                dbRef.child('users/' + uid).update({
                    profile_img: newFileName
                }).then(() => {
                    getProfileImageHTMLUrl(newFileName).then((_url) => {
                        res.json({
                            url: _url
                        });
                    });
                });
            });
        } else {
            console.log("No file");
        }
    });
    firebase.auth().onAuthStateChanged(function(user) {

        if (user) {
            console.log("User is logged in");
            var uid = user.uid;
            dbRef.child('users/' + uid).once('value').then(function(snap) {

                var _user = snap.val();
                _user.uid = uid;


            });
        } else {


        }
    });
}