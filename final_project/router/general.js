const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const exists = users.some(u => u.username === username);
  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(book, null, 4));
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const result = Object.keys(books)
    .filter(key => books[key].author.toLowerCase() === author)
    .map(key => ({ isbn: key, ...books[key] }));

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found for this author" });
  }
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(result, null, 4));
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const result = Object.keys(books)
    .filter(key => books[key].title.toLowerCase() === title)
    .map(key => ({ isbn: key, ...books[key] }));

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(result, null, 4));
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(book.reviews, null, 4));
});

// ---------------------------------------------------------------
// Tasks 10-13: same features with Axios (Promises / async-await)
// ---------------------------------------------------------------

// Task 10: Get the list of books (Promise callbacks with Axios)
public_users.get('/async', function (req, res) {
  axios.get(`${BASE_URL}/`)
    .then(response => {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    })
    .catch(error => {
      return res.status(500).json({ message: "Error fetching book list", error: error.message });
    });
});

// Task 11: Get book details by ISBN (async-await with Axios)
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(req.params.isbn)}`);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: "Error fetching book by ISBN", error: error.message });
  }
});

// Task 12: Get book details by author (async-await with Axios)
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(req.params.author)}`);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: "Error fetching books by author", error: error.message });
  }
});

// Task 13: Get book details by title (async-await with Axios)
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(req.params.title)}`);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: "Error fetching books by title", error: error.message });
  }
});

module.exports.general = public_users;