//Shared helpers
require('firebase/storage');

const constants = require('./constants');
module.exports = function(app, firebase, admin, database) {
    const bucket = admin.storage().bucket();
    const dbRef = database.ref();
    /**
     * Delays the execution of an async function by ms time
     * @param {number} ms Number of milliseconds to delay the execution
     * @returns {Promise} Resolves when ms milliseconds have passed
     */
    delay = (ms) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    };
    /**
     * Uploads image to cloud storage
     * @param {File} file Image file
     * @param {string} bucketPath The path to the bucket
     * @param {string} newFileName New file name to rename the file
     * @returns {Promise} Resolves when the file is done uploading
     */
    uploadImageToStorage = (file, bucketPath, newFileName) => {
        let prom = new Promise((resolve, reject) => {
            if (!file) {
                reject('No image file');
            }

            //let  bucketDir = firebase.storage().ref(bucketPath).child(bucketPath);
            let fileUpload = bucket.file(bucketPath + newFileName);

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
    /**
     * Given a map _map, the function returns the first key that corresponds to the passed value
     * @param {map} _map The map to check
     * @param {*} value The value to check with
     * @returns {*} The key linked to the passed value
     */
    getKeyFromValue = function(_map, value) {
        var resultKey = null;
        _map.forEach(function(val, key, _map) {
            if (val == value)
                resultKey = key;
        });
        return resultKey;
    }
    /**
     * Gets the locale string of the current time
     * @returns {string} Current time
     */
    getTimeNow = function() {
        return new Date().toLocaleString();
    }

    /**
     * Updates user's last activity date
     * @param {string} _uid ID of the user to update
     */
    updateUserLastActivityDate = function(_uid) {
        var d = getTimeNow();
        dbRef.child('users/' + _uid).update({
            last_activity: d
        })
    };

    /**
     * Checks if email exists in the database
     * @param {string} _email the email to check in the database
     * @returns {boolean} Does the email exist?
     */
    checkEmailExists = function(_email) {
        return new Promise(function(resolve, reject) {
            var doesExist = false;
            dbRef.child('users/').orderByChild('email').once('value', function(snaps) {
                try {
                    snaps.forEach(function(snap) {
                        var value = snap.val();
                        if (value) {
                            if (value.email === _email)
                                doesExist = true;
                        }
                    });
                    resolve(doesExist);
                } catch (reject) {

                }
            })
        })
    };
    /**
     * Checks if username exists in the database
     * @param {string} _username the username to check in the database
     * @returns {boolean} Does the username exist?
     */
    checkUsernameExists = function(_username) {
        return new Promise(function(resolve, reject) {
            var doesExist = false;
            dbRef.child('users/').orderByChild('username').once('value', function(snaps) {
                try {
                    snaps.forEach(function(snap) {
                        var value = snap.val();
                        if (value) {
                            if (value.username === _username)
                                doesExist = true;
                        }
                    });
                    resolve(doesExist);
                } catch (reject) {

                }
            })
        })
    };
    /**
     * Gets the info of a specific user, with the ability to fiter through the user's keys.
     * @param {string} uid - ID of the user
     * @param {string[]} theseKeysOnly - A string array to use when you want to only specify the keys to keep. Unused if empty. Empty by default. 
     * @param {string[]} removeTheseKeys - A string array to use when you want to only specify the keys to remove. Unused if empty. Empty by default
     * @returns {string[]} The key linked to the passed value
     */
    getUserInfo = function(uid, theseKeysOnly = [], removeTheseKeys = []) {
        var profileData = null;
        return database.ref('users').child(uid).once('value').then(function(snap) {
            var _uid = snap.key;
            profileData = snap.val();
            return getProfileImageHTMLUrl(profileData.profile_img).then(function(url) {

                profileData.Success = true;
                profileData.imgurl = url;
                profileData.uid = _uid;
                console.log("profileData: \n" + profileData.uid);
                console.log('URL: ' + url);
                if (theseKeysOnly.length == 0 && removeTheseKeys.length == 0)
                    return profileData;

                else {
                    return filterObjectKeys(profileData, theseKeysOnly, removeTheseKeys);
                }
            });

        }).catch(function(err) {
            profileData = {
                Success: false
            };
            return profileData;
        });


    }
    /**
    * Takes a Javascript object and allows you to get rid of unwanted keys. 
    You can do that through an array that only keeps specific keys, or through an array that removes specific keys.
    * @param {Object} objToFilter - The JavaScript object that you wish to filer through
    * @param {string[]} theseKeysOnly - A string array to use when you want to only specify the keys to keep. Unused if empty. Empty by default. 
    * @param {string[]} removeTheseKeys - A string array to use when you want to only specify the keys to remove. Unused if empty. Empty by default
    * @returns {Object} The Javascript object after the filteration process
    */
    filterObjectKeys = function(objToFilter, theseKeysOnly = [], removeTheseKeys = []) 
    {
        //Loop through every key in the object
        for (var key in objToFilter) {
            //If theseKeysOnly isn't empty
            if (theseKeysOnly.length != 0) {
                //If key doesn't exist in the array
                if (theseKeysOnly.indexOf(key) == -1) {
                    //Set the value at this key to undefined
                    objToFilter[key] = undefined;
                }
            }

            //If removeTheseKeys isn't empty
            if (removeTheseKeys.length != 0) {
                //If key exists in the array
                if (removeTheseKeys.indexOf(key) != -1) {
                    //Set the value at this key to undefined
                    objToFilter[key] = undefined;
                }
            }
        }
        //Stringify then parse the object to get rid of any keys set to undefined values (the ones we removed)
        objToFilter = JSON.parse(JSON.stringify(objToFilter));
        return objToFilter;
    }

    /**
     * Checks if user already exists based on name and email
     * @async
     * @param {string} _name - username to check
     * @param {string} _email - email to check
     * @returns {Object} - a Javascript object that containing the result for each checks 
     */
    verifyUserNotDuplicate = async function(_name, _email) {
        try {
            var dataChecker = {
                userExists: false,
                emailExists: false
            };

            dataChecker.userExists = await checkUsernameExists(_name);
            dataChecker.emailExists = await checkEmailExists(_email);
            console.log("Data checker currently: " + JSON.stringify(dataChecker));

            return dataChecker;

        } catch (e) {
            console.log("Error in async function :/ ");
            console.log(e);
        }
    }
    /**
     * Gets a url to the image in the bucket based on the image name
     * @async
     * @param {string} imgname - Image name to get
     * @returns {string} - URL to the image in the bucket
     */
    getProfileImageHTMLUrl = function(imgname) {
        return bucket.file(constants.ProfilePicLocation + imgname).getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        }).then(function(results) {
            var url = results[0];
            return url;
        });

    }


}