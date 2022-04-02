const express = require('express');
const nodemailer = require('nodemailer');

const app = express.Router();

const layout = 'layouts/main-layouts'

app.get('/', (req, res) => {
    return res.render('index', { layout, title: 'Portfolio', message: req.flash('message'), })
})

app.post('/', async (req, res) => {
    const body = req.body;
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
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