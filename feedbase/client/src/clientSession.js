function generateHash(len) {
    var symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    var hash = '';
    for (var i = 0; i < len; i++) {
      var symIndex = Math.floor(Math.random() * symbols.length);
      hash += symbols.charAt(symIndex);
    }
    return hash;
  }
  if (!/\buser_id=/.test(document.cookie)) { //if no 'user_id' in cookies
    document.cookie = 'user_id=' + generateHash(32);  //add cookie 'user_id'
  }
