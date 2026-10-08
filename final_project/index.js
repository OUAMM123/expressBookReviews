const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session middleware for /customer routes
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
  })
);

// Authentication middleware for /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if session exists and has authorization data
  if (req.session && req.session.authorization) {
    const accessToken = req.session.authorization.accessToken;

    // Verify the JWT token
    jwt.verify(accessToken, "access_token_secret", (err, decoded) => {
      if (err) {
        // Token invalid or expired
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      // Attach decoded user info to request for downstream routes
      req.user = decoded;
      next();
    });
  } else {
    // No session or no authorization data
    return res.status(401).json({ message: "User not authenticated" });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));