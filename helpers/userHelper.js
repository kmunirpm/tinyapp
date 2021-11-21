const bcrypt = require('bcryptjs');

const generateUserHelpers = (users, urlDatabase) => {

  //validates users actions
  const validateAction = (urlid, userId) => {
    if(typeof userId === "undefined" || userId === "")
      return [err, code, msg] = [false, 400, "Login required."];
    if (typeof urlDatabase[urlid] === "undefined") {
      return [err, code, msg] = [false, 403, `Sorry! ${urlid} short URL is an invalid URL.`];
    }
    else if (urlDatabase[urlid].userID !== userId) {
      return [err, code, msg] = [false, 403, `Sorry! ${urlid} short URL does not belong to you.`];
    }
    return [] = [true];
  }

  //valiadates user authentication and new user registration
  const validateCredentialsFields = (users, email, password, functionality) => 
  {
    if (email === '' || password === '') {
        return [err, code, msg] = [false, 400, 'E-Mail and Password cannot be blank!'];
    }
    
    const user = findUserByEmail(email);
    if (!user && functionality === "login") {
      return [err, code, msg] = [false, 403, `No user with ${email} found`];
    }
    else if (user && functionality === "register") {
      return [err, code, msg] = [false, 400, `${email} is already in use!`];
    }
    if (functionality === "login") {
      if (!bcrypt.compareSync(password, user.password)) {
        return [err, code, msg] = [false, 403, `Password does not match ${email}'s saved password`];
      }
    }

    if (functionality === "register") {
      return [] = [true]
    } else {
      return user;
    }

  }

  const urlsForUser = (id) => {
    let userDb = {}, url;
    for (let urlId in urlDatabase) {
      url = urlDatabase[urlId];
      if (url.userID === id) {
        userDb[urlId] = urlDatabase[urlId].longURL;
      }
    }
    return userDb;
  }

  //generates random strings for new users & new urls
  const generateRandomString = function () {
    charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var randomString = '';
      for (var i = 0; i < 6; i++) {
          var randomPoz = Math.floor(Math.random() * charSet.length);
          randomString += charSet.substring(randomPoz,randomPoz+1);
      }
      return randomString;
  }


  const findUserByEmail = (email) => {
    for (const userId in users) {
      const user = users[userId];
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  //to ensure that once server restarts all previous sessions become invalid 
  const findUserByID = (ID) => {
    if(typeof ID !== "undefined" && typeof users[ID] !== "undefined")
      return true
    return false;
  }

  //validates if user is logged in.
  const userLoggedIn = (session) => {
    if(typeof session == "undefined" || session == "" || !findUserByID(session))
        return false;
    return true;
  }

  return {urlsForUser, findUserByEmail, validateCredentialsFields, validateAction, generateRandomString, userLoggedIn};
}


module.exports = generateUserHelpers;
