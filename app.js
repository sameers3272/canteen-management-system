const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const Mongodb_Store = require('connect-mongodb-session')(session);
const multer = require('multer');
const MONGODB_URI = require('./util/database');
const csrf = require('csurf');
const helmet = require('helmet');
const compression = require('compression');
const flash = require('connect-flash');

const adminRoutes = require('./routes/admin');
const canteenRoutes = require('./routes/canteen');
const authRoutes = require('./routes/auth');
const errorController = require('./controller/error');
const User = require('./models/user');

const app = express();
const csrfProtection = csrf();
require("dotenv").config();

const store = new Mongodb_Store({
    uri: MONGODB_URI
});

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));
app.use(helmet());
app.use(compression());
app.use(csrfProtection);
app.use(flash());


app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            return next();
        })
        .catch(err => console.log(err));
});


app.use((req, res, next) => {
    if (req.user && req.user.name) {
        res.locals.userName = req.user.name;
    }
    else {
        res.locals.userName = ''
    }
    if(req.user && req.user.admin){
        res.locals.admin = true;
    }else{
        res.locals.admin = false;
    }
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/admin', adminRoutes);
app.use(canteenRoutes);
app.use(authRoutes);


app.use(errorController.get404)

app.use((errors, req, res, next) => {
    console.log(errors);
    res.status(500).render('500', {
        pageTitle: "Error!",
        path: '/500',
    });
    next();
})



mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected');
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => console.log(err));

