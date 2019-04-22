let mysql = require('mysql');


module.exports = function(app, passport) {

    app.get('/login', function(req, res) {
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    app.post('/login', passport.authenticate('local-login', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        }),
        function(req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        });

    app.get('/register', function(req, res) {
        res.render('register.ejs', {
            message: req.flash('registerMessage')
        });
    });

    app.post('/register', passport.authenticate('local-register', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    }));

    app.get('/', isLoggedIn, function(req, res) {
        res.render('index.ejs', {
            user: req.user
        });
    });

    app.get('/logout', function(req, res) {
        req.session.destroy(function(err) {
            res.redirect('/login');
        });
    })
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}
