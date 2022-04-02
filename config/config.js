require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    sessionSecret: process.env.sessionSecret
}