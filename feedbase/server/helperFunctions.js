require ('firebase/storage');

const constants = require('./constants');
module.exports = function(app, firebase, admin, database ) {
    const bucket = admin.storage().bucket();
    const dbRef = database.ref();

     delay =(ms) => {
      return new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    };
    uploadImageToStorage = (file, bucketPath, newFileName) => {
      let prom = new Promise((resolve, reject) => {
        if (!file) {
          reject('No image file');
        }
       
        //let  bucketDir = firebase.storage().ref(bucketPath).child(bucketPath);
        let fileUpload = bucket.file(bucketPath+newFileName);
        
        const blobStream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype
          }
        });
    
        blobStream.on('error', (error) => {
          reject('Something is wrong! Unable to upload at the moment.');
        });
    
        blobStream.on('finish', () => {
          // The public URL can be used to directly access the file via HTTP.
          const url = fileUpload.name;
          resolve(url);
        });
    
        blobStream.end(file.buffer);
      });
      return prom;
    }
    getKeyFromValue = function(_map, value)
    {
       var resultKey = null;
        _map.forEach(function(val, key, _map)
        {
            if(val==value)
                resultKey = key;
        });
        return resultKey;
    }
    getTimeNow = function()
    {
        return new Date().toLocaleString();
    }
    updateUserLastActivityDate = function(_uid)
    {
    var d = getTimeNow();
    dbRef.child('users/'+_uid).update({
        last_activity: d
    })
    };
    checkEmailExists = function(_email)
{
  return new Promise(function(resolve,reject){
    var doesExist = false;
  dbRef.child('users/').orderByChild('email').once('value', function(snaps){
    try{
      snaps.forEach(function(snap)
      {
    var value = snap.val();
    if(value)
    {
      if(value.email === _email)
      doesExist=true;
    }
  });
    resolve(doesExist);
    }
    catch(reject){

    }
  })
})};

 checkUsernameExists = function(_username)
{
  return new Promise(function(resolve,reject){
    var doesExist = false;
  dbRef.child('users/').orderByChild('username').once('value', function(snaps){
    try{
      snaps.forEach(function(snap)
      {
    var value = snap.val();
    if(value)
    {
      if(value.username === _username)
      doesExist=true;
    }
  });
    resolve(doesExist);
    }
    catch(reject){

    }
  })
})};

      getUserInfo = function(uid, theseKeysOnly = [], removeTheseKeys= [])
        {
          var profileData=null;
      return database.ref('users').child(uid).once('value').then(function(snap)
      {        
          var _uid = snap.key;
          profileData =snap.val();
            return getProfileImageHTMLUrl(profileData.profile_img).then(function(url){

              profileData.Success = true;
              profileData.imgurl = url;
              profileData.uid = _uid;
              console.log("profileData: \n"+ profileData.uid);
              console.log('URL: '+url);
              if(theseKeysOnly.length==0 &&removeTheseKeys.length==0)
             return profileData;

             else{
              return  filterObjectKeys(profileData, theseKeysOnly, removeTheseKeys);
             }
             }
           );

      }).catch(function(err){
        profileData = {Success: false};
        return profileData;
      });

          
        }
        filterObjectKeys = function(objToFilter, theseKeysOnly=[], removeTheseKeys=[] )
        {
          for(var key in objToFilter)
          {
            if(theseKeysOnly.length != 0)
            if(theseKeysOnly.indexOf(key) == -1)
            {
              objToFilter[key] = undefined;
            }
            if(removeTheseKeys.length!=0)
            if(removeTheseKeys.indexOf(key) != -1)
            {
             objToFilter[key] = undefined;
            }
          }
          objToFilter =JSON.parse(JSON.stringify(objToFilter));
          objToFilter.Success = true;
          return objToFilter;
        }


         verifyUserNotDuplicate = async function(_name, _email)
        {
        try{
        var dataChecker = {userExists: false, emailExists:false};

        dataChecker.userExists = await checkUsernameExists(_name);
        dataChecker.emailExists = await checkEmailExists(_email);
        console.log("Data checker currently: " +JSON.stringify(dataChecker));

        return dataChecker;

        }
        catch(e)
        {
            console.log("Error in async function :/ ");
            console.log(e);
        }
        }

        getProfileImageHTMLUrl = function(imgname)
        {

        return bucket.file(constants.ProfilePicLocation+imgname).getSignedUrl({ action: 'read', expires: '03-09-2491' }).then(function(results){
        var url = results[0];      
            return url;
        });
        
        }

        
}