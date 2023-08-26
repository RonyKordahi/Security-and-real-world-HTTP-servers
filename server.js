// Packages
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const bcrypt = require("bcryptjs");
// const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');

// The port of the server
const PORT = 8000;

// Data
const users = [
    {
        name: "Rony Kordahi",
        email: "rony@email.com",
        password: "$2a$10$oCMZf5FLeAlyJWePExljZ.OBuOABe/3s3k0lYAswsbDjUkhSJNI3G",
        id: 1,
    },
    {
        name: "Boaty McBoatface",
        email: "boat@email.com",
        password: "$2a$10$/T54lwvTDhcjz7TM2rw2P.Y7xUfjrzj98PQC7dAHL.QsNpiZsifC6",
        id: 2,
    }
]

// Creating the epxress server
const app = express();

// Setting the view engine
app.set("view engine", "ejs");

// ********** //
// Middleware //
// ********** //
app.use(helmet());
app.use(morgan("tiny"));
// app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
    name: 'user-login-cookie',
    keys: ["ousdhfg092jh498t489h09oj"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// *************************************************************** //
//                                  GET Endpoints                  //
// *************************************************************** //

// Displays the login form view
app.get("/login", (req, res) => {
    res.render("login");
})

// Displays the register form view
app.get("/register", (req, res) => {
    res.render("register");
})

// Displays the protected view
app.get("/protected", (req, res) => {

    // Destructure the userId from the cookies
    // const { userId } = req.cookies;
    const { userId } = req.session;

    // Check if the cookie exists
    if (!userId) {
        return res.status(401).send("You must be logged in to see this page!");
    }

    // Find the user based off their userId
    const user = users.find(user => {
        return user.id === Number(userId);
    })

    // The data passed to the view
    const data = {
        user: user
    };

    res.render("protected", data);
});

// *************************************************************** //
//                    POST Endpoints                               //
// *************************************************************** //

// Login validation
app.post("/login", (req, res) => {

    // Destructure the information from the body
    const { email, password } = req.body;

    // Find the user
    const foundUser = users.find(user => {
        return user.email === email;
    })

    // If the user isn"t found or the passwords don"t match, return an error
    if (!foundUser || !bcrypt.compareSync(password, foundUser.password)) {
        return res.status(404).send("Invalid email or password!");
    }

    // Set the cookie
    // res.cookie("userId", foundUser.id);
    req.session.userId = foundUser.id;

    res.redirect("/protected");
})

// Registers a new user
app.post("/register", (req, res) => {

    // Destructure the information from the body
    const newUser = { ...req.body };

    // Check if the user exists
    const foundUser = users.find(user => {
        return user.email === newUser.email;
    })

    // If the user exists, send an error
    if (foundUser) {
        return res.status(400).send("User already exists!");
    }

    // Create a hashed password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    // Replace the plain text password with the hashed password
    newUser.password = hashedPassword;

    // Create an id for the new user
    newUser.id = users.length + 1;

    // Add the new user to the "database"
    users.push(newUser);

    res.redirect("/login");
})

// Logs the user out
app.post("/logout", (req, res) => {
    // clear the user's cookie
    // res.clearCookie("userId");

    req.session.userId = null;

    // ⚠️ DANGEROUS!
    // req.session = null;

    // redirect them somewhere
    res.redirect("/login");
});

// *************************************************************** //
//                       Launches the server                       //
// *************************************************************** //
app.listen(PORT, () => {
    console.log(`Server is now running on port ${PORT}`);
});