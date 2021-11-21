const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const {users, urlDatabase} = require('./helpers/userDB');
const generateUserHelpers = require('./helpers/userHelper');
const {urlsForUser, validateCredentialsFields, validateAction, generateRandomString, userLoggedIn} = generateUserHelpers(users, urlDatabase);


app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))


app.use(bodyParser.urlencoded({extended: false})); //handles just primitive data types
app.use(bodyParser.urlencoded({extended: true})); // handles every data type
app.set("view engine", "ejs");



app.get("/", (req, res) => {
  return res.redirect('/urls');
});

//Lists all urls when the use 1st logins
app.get("/urls", (req, res) => {
  if(!userLoggedIn(req.session.user_id))
    return res.redirect('/login');
  const uid = req.session.user_id;
  const shortURL = req.params.shortURL;
  const templateVars = { urls: urlsForUser(uid),  userId: uid};
  res.render("urls_index", templateVars);
});

//Loads the form for adding new urls
app.get("/urls/new", (req, res) => {
  if(!userLoggedIn(req.session.user_id))
    return res.redirect('/login');
  const templateVars = { userId: req.session.user_id};
  res.render("urls_new", templateVars);
});

//Redirects to the longurl
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Submits new URL request
app.post("/urls", (req, res) => {
  if(!userLoggedIn(req.session.user_id))
    return res.redirect('/login');
  const randomid = generateRandomString();
  urlDatabase[randomid] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect('/urls');
});

//View the page for selected shorturl
app.get("/urls/:shortURL", (req, res) => {
  if(!userLoggedIn(req.session.user_id))
    return res.redirect('/login');
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userId: req.session.user_id};
  res.render("urls_show", templateVars);
});

//Loads the edit page for selected shorturl
app.get("/urls/:shortURL/edit", (req, res) => {
  if(!userLoggedIn(req.session.user_id))
    return res.redirect('/login');
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userId: req.session.user_id};
  res.render("urls_edit", templateVars);
});

//Submits the edit longurl request for selected shorturl
app.post("/urls/:shortURL/edit", (req, res) => {
  if(!userLoggedIn(req.session.user_id))
    return res.redirect('/login');
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

//Submits the delete request for selected shorturl
app.post("/urls/:shortURL/delete", (req, res) => {
  if(!userLoggedIn(req.session.user_id))
    return res.redirect('/login');
  const shortURL = req.params.shortURL;
  const valUser = validateAction(shortURL,req.session.user_id)
  if( valUser[0] === false)
    return res.status(valUser[1]).send(valUser[2]);
  delete urlDatabase[shortURL]
  res.redirect('/urls');
});

//Loads the register form
app.get("/register", (req, res) => {
  res.render("urls_register");
});

//Submits the register form
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password);
  const val = validateCredentialsFields(users, email, password, "register");
  if (val[0] === false)
    return res.status(val[1]).send(val[2]);
  
  const id = generateRandomString();
  users[id] = {
    id, 
    email,
    password,
  }
  req.session.user_id = id;
  res.redirect('/urls')
});

//Submits the login form
app.post("/login", (req, res) => {
  const login = req.body.id
  const email = req.body.email;
  const password = req.body.password;
  const val = validateCredentialsFields(users, email, password, "login");
  if (val[0] === false)
    return res.status(val[1]).send(val[2]);
  
  req.session.user_id = val.id;
  res.redirect('/urls');
});

//Loads the login form
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//Submits the logout request
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//Loads the 404 page for unhandled routes
app.get("*", (req, res) => {
  const templateVars = { greeting: '404! Page not found' };
  res.status(404)
  res.render("404", templateVars);
});

//Starts listening on the selected port
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

