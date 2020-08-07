const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
// prevent some security issue with requests Header
const helmet = require('helmet');
app.use(helmet());

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const accessTokenSecret = 'bd715a978b0d2caa370a925755f83a20bc68572279e7f93d9bec79c8904ef12f';

const authenticateJWT = (req, res, next) => {
    const jwt_access = req.cookies.access;
  

    if (jwt_access) {

        jwt.verify(jwt_access, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } 
    
    else {
        res.sendStatus(401);
    }
};

app.use(bodyParser.json());

app.listen(4000, () => {
    console.log('Books service started on port 4000');
});

const books = [
    {
        "author": "Chinua Achebe",
        "country": "Nigeria",
        "language": "English",
        "pages": 209,
        "title": "Things Fall Apart",
        "year": 1958
    },
    {
        "author": "Hans Christian Andersen",
        "country": "Denmark",
        "language": "Danish",
        "pages": 784,
        "title": "Fairy tales",
        "year": 1836
    },
    {
        "author": "Dante Alighieri",
        "country": "Italy",
        "language": "Italian",
        "pages": 928,
        "title": "The Divine Comedy",
        "year": 1315
    },
];


app.get('/books', authenticateJWT, (req, res) => {
    console.log('ehllo');
    const user = req.user;

    console.log('user', user);
    res.json(books);
});