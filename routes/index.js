const express = require('express');
const nodemailer = require('nodemailer');

const app = express.Router();

const layout = 'layouts/main-layouts'

app.get('/', (req, res) => {
    return res.render('index', { 
        layout, 
        title: 'Portfolio', 
        message: req.flash('message'), 
        // haveBlog
    })
})

app.post('/', async (req, res) => {
    const body = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
        auth: {
            user: 'postmaster@sandbox78701b9f532340a59c3048c718003477.mailgun.org',
            pass: '9655f63086425ae697698ed818b22733-62916a6c-1e1d8f4c',
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
})

module.exports = app