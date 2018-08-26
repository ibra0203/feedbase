const constants = require('../constants');

module.exports = function(app, firebase, admin, database, io){
    const bucket = admin.storage().bucket();
    const dbRef = database.ref();
    require('../helperFunctions')(app, firebase, admin,database, io);
   
    //Create New Post
    app.post('/post/create', (req, res,next) => {
        var postData = req.body;
        console.log('posting new post');
        console.log(postData);
        var postKey = dbRef.child('posts/'+postData.toId+'/').push().key;
        postData.postId = postKey;
        postData.date_created = getTimeNow();
        dbRef.child('posts/'+postData.toId+'/'+postKey+'/').update(postData).then(function(err){
            updateUserLastActivityDate(postData.userId);
            dbRef.child('posts/LatestPosts/').child(postData.postId).set(postData).then(function(err2){
                res.json(postData);
            });
            
        });
    });

    //Get the posts of a specific poster
    app.get('/_getposts/:poster', (req, res,next) => {
        const posterId = req.params.poster ;
        let storedRef = database.ref('/posts/'+posterId+'/').orderByChild('date_created');
        storedRef.limitToLast(10).once('value', function(snaps){
            console.log(snaps.val());
            res.json(snaps.val());
        });
    });

    //Deletes a post from a specific user
    app.get('/_deletepost/:userId/:postId', (req, res,next) => {

        var postId = req.params.postId;;
        var userId = req.params.userId;
        database.ref('/posts/'+userId+'/'+postId).remove().then(function()
        {
            database.ref('/posts/'+'LatestPosts'+'/'+postId).remove().then(function()
                {
                    
                    res.status(200).json('success');

                });
            
        });


    });
}