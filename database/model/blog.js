const { model } = require('mongoose')

const blogModel = model('Blog', require('../schema/blog'))

module.exports = blogModel