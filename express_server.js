const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")

app.use(cookieParser())

app.use(bodyParser.urlencoded({extended: false})); //handles just primitive data types
app.use(bodyParser.urlencoded({extended: true})); // handles every data type
app.set("view engine", "ejs");

// app.use(cookieSession({
//   name: ''
// }));

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "u1@e.com", 
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "u2@e.com", 
    password: "456"
  }
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Welcome! This is TinyApp.");
});

app.get("/urls", (req, res) => {
  console.log('/urls')
  const shortURL = req.params.shortURL;
  const templateVars = { urls: urlDatabase,  userId: req.cookies["userId"] };
  res.render("urls_index", templateVars);
});

app.get('/users/:userId/books/:bookId', function (req, res) {
  console.log('/users/:userId/books/:bookId')
  res.send(req.params)
})

app.get("/urls.json", (req, res) => {
  console.log('/urls.json')
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  console.log('urls/new')
  const templateVars = { id: req.cookies["id"]};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect('/urls');
});

app.get("/urls/:shortURL", (req, res) => {
  console.log('/urls/:shortURL')
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  console.log('/urls/:shortURL')
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], id: req.cookies["id"]};
  res.render("urls_edit", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  console.log('/urls/:shortURL/edit')
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log('delete /urls/:shortURL');
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
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('E-Mail and/or Password cannot be blank!');
  }

  const user = findUserByEmail(email);

  if (user) {
    return res.status(400).send(`${email} is already in use!`);
  }

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

  if(!email || !password){
    return res.status(400).send('E-Mail and Password cannot be blank!');
  }

  const user = findUserByEmail(email);

  if (!user) {
    return res.status(403).send(`No user with ${email} found`)
  }

  if (user.password !== password) {
    return res.status(403).send(`Password does not match ${email}'s saved password'`)
  }

  res.cookie('userId', user.id);

  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  console.log('/urls/login');
  res.render("urls_login");
});

app.post('/logout', (req, res) => {
  console.log('/logout');
  req.cookie = null;
  res.clearCookie("userId");
  console.log(req.cookie)
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