//SETUP
const   express                 = require('express'),
        session                 = require('express-session'),
        mongoose                = require('mongoose'),
        passport                = require('passport'),
        bodyParser              = require('body-parser'),
        LocalStrategy           = require('passport-local'),
        passportLocalMongoose   = require('passport-local-mongoose'),
        User                    = require('./models/user'); 

//CONFIG

//database config
mongoose.connect("mongodb://localhost:27017/authdemo",{useNewUrlParser: true, useUnifiedTopology: true});

//app config
var app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));
app.use(passport.initialize());
app.use(passport.session());



//passport config
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(
    User.authenticate()
    // function(username, password, done) {
    //   User.findOne({ username: username }, function (err, user) {
    //     if (err) { return done(err); }
    //     if (!user) {
    //       return done(null, false, { message: 'Incorrect username.' });
    //     }
    //     if (!user.validPassword(password)) {
    //       return done(null, false, { message: 'Incorrect password.' });
    //     }
    //     return done(null, user);
    //   });
    // }
  ));





//ROUTES

//Home page
app.get("/",function(req,res){
    res.render('home');
})



//Register page to show sign up form
app.get('/register',function(req,res){
    res.render('register');
})

//Handle the registration data
app.post('/register',function(req,res){
    User.register(new User({username: req.body.username}), req.body.password, function(error, user){
        if (error) {
            console.log(error);
            res.redirect('/register');
        }
        else {
            passport.authenticate("local")(req,res,function(){
                res.redirect('/secret');
            })
        }
    })
})

//Login form
app.get("/login",function (req,res) {
    res.render("login");    
});

//Handle login request
app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    console.log(req.user);
    console.log(req.isAuthenticated());
    res.redirect("/secret");
  });

  //Secret page
app.get("/secret", isLoggedIn, function(req,res){
    console.log(req.user);
    res.render('secret');
})

//Session handling
function isLoggedIn(req, res, next) {
    console.log(req.user);
    if (req.isAuthenticated()) {
        console.log('User is authenticated')
        return next();
    }
    res.redirect('login');
}




//SERVER LISTENER
app.listen(3000,function(){
    console.log("Server is started. App is listening on 3000");
})

