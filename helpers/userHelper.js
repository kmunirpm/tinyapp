const bcrypt = require('bcryptjs');

const validateAction = (urlDatabase, urlid, userId) => {
  if(typeof userId === "undefined" || userId === "")
    return [err, code, msg] = [false, 400, "Login required."];
  if (urlDatabase[urlid].userID !== userId)
    return [err, code, msg] = [false, 407, "Action not allowed."]; 
     console.log(urlid,userId);
  return [] = [true];
}


const validateCredentialsFields = (users, email, password, functionality) => 
{
  if (email === '' || password === '') {
      return [err, code, msg] = [false, 400, 'E-Mail and Password cannot be blank!'];
  }
  
  const user = findUserByEmail(users, email);
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

const urlsForUser = (urlDatabase, id) => {
  let userDb = {}, url;
  for (let urlId in urlDatabase) {
    url = urlDatabase[urlId];
    console.log("Filtering: ", url)
    if (url.userID === id) {
      userDb[urlId] = urlDatabase[urlId].longURL;
    }
  }
  return userDb;
}



const generateRandomString = function () {
  charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < 6; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}


const findUserByEmail = (users, email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}


const userLoggedIn = (session) => {
  if(typeof session === "undefined" || session === "")
    return false;
  return true;
}




module.exports = {urlsForUser, validateCredentialsFields, validateAction, generateRandomString, userLoggedIn};0