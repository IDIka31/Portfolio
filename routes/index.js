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
        service: 'gmail',
        auth: {
            user: 'idikanugraha@gmail.com',
            pass: 'vmbjdjxncjbfulpw',
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