const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const {users, urlDatabase} = require('./helpers/userDB');
const {urlsForUser, validateCredentialsFields, validateAction, generateRandomString, userLoggedIn} = require('./helpers/userHelper');



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

app.get("/urls", (req, res) => {
  console.log('/urls');
  if(!userLoggedIn(req.session.user_id))
    return res.redirect('/login');
  const uid = req.session.user_id;
  const shortURL = req.params.shortURL;
  const templateVars = { urls: urlsForUser(urlDatabase, uid),  userId: uid};
  console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  console.log('/urls.json');
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  console.log('urls/new');
  if(!userLoggedIn(req.session.user_id))
    return res.redirect('/login');
  const templateVars = { userId: req.session.user_id};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log("post /urls/new")
  const randomid = generateRandomString();
  urlDatabase[randomid] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect('/urls');
});

app.get("/urls/:shortURL", (req, res) => {
  console.log('Get /urls/:shortURL');
  if(!userLoggedIn(req.session))
    return res.redirect('/login');
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  console.log('Post /urls/:shortURL');
  if(!userLoggedIn(req.session))
    return res.redirect('/login');
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userId: req.session.user_id};
  res.render("urls_edit", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  console.log('/urls/:shortURL/edit');
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log('delete /urls/:shortURL');
  if(!userLoggedIn(req.session))
    return res.redirect('/login');
  const shortURL = req.params.shortURL;
  const valUser = validateAction(urlDatabase, shortURL,req.session.user_id)
  if( valUser[0] === false)
    return res.status(valUser[1]).send(valUser[2]);
  delete urlDatabase[shortURL]
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  console.log('/urls/register');
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  console.log('/urls/register/post');
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
  console.log(users)
  res.redirect('/login')
});

app.post("/login", (req, res) => {
  console.log('/login');
  const login = req.body.id
  const email = req.body.email;
  const password = req.body.password;
  const val = validateCredentialsFields(users, email, password, "login");
  if (val[0] === false)
    return res.status(val[1]).send(val[2]);
  
  req.session.user_id = val.id;
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  console.log('/urls/login');
  res.render("urls_login");
});

app.post('/logout', (req, res) => {
  console.log('/logout');
  req.session = null;
  res.redirect('/urls');
});

app.get("*", (req, res) => {
  const templateVars = { greeting: '404! Page not found' };
  res.status(404)
  res.render("404", templateVars);
});


app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

