const { Schema } = require('mongoose');

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
})

module.exports = blogSchema;