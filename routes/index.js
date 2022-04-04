const express = require('express');
const nodemailer = require('nodemailer');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const { body, check, validationResult } = require('express-validator');

const ensureLoggedIn = function (
    options = {
        redirectTo: String('/admin'),
        redirectMessage: String('You must be logged in to access this page.'),
    }
) {
    return (
        req = express.request,
        res = express.response,
        next = (err) => {
            next(err);
        }
    ) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error', options.redirectMessage);
        return res.redirect(options.redirectTo);
    };
};

// Admin Account List
const adminList = [
    {
        username: 'admin',
        password: 'admin',
    },
    {
        username: 'IDika',
        password: 'AndikaP317',
    },
];

// Setting passport-local to passport
passport.use(
    new passportLocal(function (username, password, done) {
        const admin = adminList.find((admin) => admin.username === username && admin.password === password);
        if (admin) {
            return done(null, admin);
        } else done(null, false);
    })
);

// Serialize and Deserialize user in passport
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});

const app = express.Router();

// Passport Use
app.use(passport.initialize());
app.use(passport.session());

const layout = 'layouts/main-layouts';
const adminLayout = 'layouts/admin';

const blog = require('../database/model/blog');

// sort array to a page
const sortArray = (array, page, limit) => {
    const start = (page - 1) * limit;
    const end = page * limit;
    return array.slice(start, end);
};

app.get('/', async (req, res) => {
    const haveBlog = await blog.find();

    return res.render('index', {
        layout,
        title: 'Portfolio',
        message: req.flash('message'),
        haveBlog,
        blogs: sortArray(haveBlog, 1, 6),
    });
});

// Admin Login
app.get('/admin', async (req, res) => {
    if (req.user) return res.redirect('/admin/dashboard');
    return res.render('admin', { layout: adminLayout, title: 'Admin Login', message: req.flash('message'), error: req.flash('error') });
});

// Admin Dashboard
app.get('/admin/dashboard', ensureLoggedIn(), async (req, res) => {
    const blogs = await blog.find();

    return res.render('dashboard', {
        layout: 'layouts/dashboard/main-layout',
        title: 'Admin Dashboard',
        message: req.flash('message'),
        error: req.flash('error'),
        blogs,
    });
});

// Create Blog
app.get('/admin/blog/create', ensureLoggedIn(), async (req, res) => {
    return res.render('create-blog', { layout: adminLayout, title: 'Create Blog', error: req.flash('error') });
});

// Edit Blog
app.get('/admin/blog/edit/:_id', ensureLoggedIn(), (req, res) => {
    blog.findOne({ _id: req.params._id }, (err, blog) => {
        if (err) {
            req.flash('error', 'Blog not found!');
            return res.redirect('/admin/dashboard');
        }

        return res.render('edit-blog', {
            layout: adminLayout,
            title: 'Edit Blog',
            success: req.flash('success'),
            error: req.flash('error'),
            blog,
        });
    });
});

// Admin Login Act
app.post('/admin', passport.authenticate('local'), (req, res) => {
    if (req.isAuthenticated()) {
        req.flash('message', `Welcome, ${req.user.username}`);
        return res.redirect('/admin/dashboard');
    }
    req.flash('error', 'Invalid username or password');
    return res.redirect('/admin');
});

// Create Blog Act
app.post(
    '/admin/blog',
    ensureLoggedIn(),
    [
        body('title').custom(async (value) => {
            if (value === '') {
                throw new Error('Title cannot be empty!');
            }

            const blogs = await blog.findOne({ title: value });

            if (blogs) {
                throw new Error('Title already used!');
            }

            return true;
        }),
    ],
    async (req, res) => {
        const data = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            req.flash('error', errors.array());
            return res.redirect(`/admin/blog/create`);
        }

        blog.create(data)
            .then(() => {
                req.flash('message', 'Blog created successfully!');
                res.redirect('/admin/dashboard');
            })
            .catch((err) => {
                req.flash('error', err.message);
                res.redirect('/admin/dashboard');
            });
    }
);

// Edit Blog Act
app.put(
    '/admin/blog',
    ensureLoggedIn(),
    [
        body('title').custom(async (value, { req }) => {
            if (value === '') {
                throw new Error('Title cannot be empty!');
            }

            const blogs = await blog.findOne({ title: value });

            if (value !== req.body.oldTitle && blogs) {
                throw new Error('Title already used!');
            }

            return true;
        }),
    ],
    (req, res) => {
        const data = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            req.flash('error', errors.array());
            return res.redirect(`/admin/blog/edit/${data._id}`);
        }

        blog.findOneAndUpdate(
            { _id: data._id },
            {
                $set: {
                    title: data.title,
                    content: data.content,
                },
            }
        )
            .then(() => {
                req.flash('message', 'Blog updated successfully!');
                res.redirect('/admin/dashboard');
            })
            .catch((err) => {
                req.flash('error', err.message);
                res.redirect('/admin/dashboard');
            });
    }
);

// Delete Blog Act
app.delete('/admin/blog', ensureLoggedIn(), (req, res) => {
    const data = req.body;
    blog.findOneAndDelete({ _id: data._id })
        .then(() => {
            req.flash('message', 'Blog deleted successfully!');
            res.redirect('/admin/dashboard');
        })
        .catch((err) => {
            req.flash('error', 'Blog not found!');
            res.redirect('/admin/dashboard');
        });
});

// Logout Act
app.get('/admin/logout', (req, res) => {
    req.logout();
    req.flash('message', 'Logged out successfully!');
    res.redirect('/admin');
});

// Read Blog Using ID
app.get('/blog/read/:_id', async (req, res) => {
    blog.findById(req.params._id)
        .then((v) => {
            return res.render('read', {
                layout,
                title: v.title,
                content: v.content,
            });
        })
        .catch(() => {
            return res.redirect('/');
        });
});

// Contact Me
app.post('/', async (req, res) => {
    const body = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'contact.idika@gmail.com',
            pass: 'xngjevigpjadwgvv',
        },
    });

    await transporter.sendMail({
        from: `"${body.name}" <${body.email}>`,
        to: 'contact@idikanugraha.me',
        subject: 'IDika Portfolio Message',
        text: body.message,
    });

    req.flash('message', 'Message Sent!');
    return res.redirect('/#contact');
});

module.exports = app;
