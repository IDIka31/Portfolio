const express = require('express');
const nodemailer = require('nodemailer');

const app = express.Router();

const layout = 'layouts/main-layouts'

const blog = require('../database/model/blog');

// sort array to a page
const sortArray = (array, page, limit) => {
    const start = (page - 1) * limit;
    const end = page * limit;
    return array.slice(start, end);
}

app.get('/', async (req, res) => {
    const query = req.query;
    const page = query.page ? query.page : 1;

    const haveBlog = await blog.find();
    
    return res.render('index', { 
        layout, 
        title: 'Portfolio', 
        message: req.flash('message'), 
        haveBlog,
        blog: sortArray(haveBlog, page, 4)
    })
})

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
})

module.exports = app