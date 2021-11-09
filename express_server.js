const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  console.log('/urls')
  const templateVars = { urls: urlDatabase };
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
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  console.log('/urls/:shortURL')
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("*", (req, res) => {
  const templateVars = { greeting: '404! Page not found' };
  res.status(404)
  res.render("404", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});