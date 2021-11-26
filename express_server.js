const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const { users, urlDatabase } = require("./helpers/userDB");
const generateUserHelpers = require("./helpers/userHelper");
const {
  urlsForUser,
  validateCredentialsFields,
  validateAction,
  generateRandomString,
  userLoggedIn,
} = generateUserHelpers(users, urlDatabase);

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  return res.redirect("/urls");
});

//Lists all urls if the user is logged in
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userLoggedIn(userId)) return res.redirect("/login");

  const templateVars = {
    urls: urlsForUser(userId),
    userId: users[userId].email,
  };
  res.render("urls_index", templateVars);
});

//Loads the form for adding new urls
app.get("/urls/new", (req, res) => {
  if (!userLoggedIn(req.session.user_id)) return res.redirect("/login");

  const templateVars = { userId: users[req.session.user_id].email };
  res.render("urls_new", templateVars);
});

//Redirects to the longurl
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Submits new URL request
app.post("/urls", (req, res) => {
  if (!userLoggedIn(req.session.user_id)) return res.redirect("/login");

  const randomId = generateRandomString();
  urlDatabase[randomId] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${randomId}`);
});

//View the page for selected shorturl
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const UID = req.session.user_id;
  if (!userLoggedIn(req.session.user_id)) return res.redirect("/login");

  const val = validateAction(shortURL, UID);
  if (!(val[0])) return res.status(val[1]).send(val[2]);

  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    userId: users[UID].email,
  };
  res.render("urls_show", templateVars);
});

//Loads the edit page for selected shorturl
app.get("/urls/:shortURL/edit", (req, res) => {
  const userId = req.session.user_id;
  if (!userLoggedIn(userId)) return res.redirect("/login");

  const shortURL = req.params.shortURL;
  const valUser = validateAction(shortURL, userId);
  if (!(valUser[0])) return res.status(valUser[1]).send(valUser[2]);

  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    userId: users[userId].email,
  };
  res.render("urls_edit", templateVars);
});

//Submits the edit longurl request for selected shorturl
app.post("/urls/:shortURL/edit", (req, res) => {
  if (!userLoggedIn(req.session.user_id)) return res.redirect("/login");

  const longURL = req.body.longURL;
  const valUser = validateAction(req.params.shortURL, req.session.user_id);
  if (!(valUser[0])) return res.status(valUser[1]).send(valUser[2]);

  urlDatabase[req.params.shortURL].longURL = longURL;
  res.redirect("/urls");
});

//Submits the delete request for selected shorturl
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!userLoggedIn(req.session.user_id)) return res.redirect("/login");

  const shortURL = req.params.shortURL;
  const valUser = validateAction(shortURL, req.session.user_id);
  if (!(valUser[0])) return res.status(valUser[1]).send(valUser[2]);

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Loads the register form
app.get("/register", (req, res) => {
  if (!userLoggedIn(req.session.user_id)) res.render("urls_register");

  res.redirect("/urls");
});

//Submits the register form
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password);
  const val = validateCredentialsFields(users, email, password, "register");
  if (!val[0]) return res.status(val[1]).send(val[2]);

  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password,
  };
  req.session.user_id = id;
  res.redirect("/urls");
});

//Submits the login form
app.post("/login", (req, res) => {
  const login = req.body.id;
  const email = req.body.email;
  const password = req.body.password;
  const val = validateCredentialsFields(users, email, password, "login");
  console.log(val)
  if (!val[0] === false) return res.status(val[1]).send(val[2]);

  req.session.user_id = val.id;
  res.redirect("/urls");
});

//Loads the login form
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//Submits the logout request
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Loads the 404 page for unhandled routes
app.get("*", (req, res) => {
  const templateVars = { greeting: "404! Page not found" };
  res.status(404);
  res.render("404", templateVars);
});

//Starts listening on the selected port
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});
