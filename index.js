// Express Module
const express = require('express');

// Other Module
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const ejsLayouts = require('express-ejs-layouts');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

// APP
const app = express();

// Config Module
const config = require('./config/config');

// APP Use
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(compression());
app.use(ejsLayouts);

// Setting method override
app.use(
    methodOverride((req, res) => {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            const method = req.body._method;
            delete req.body._method;
            return method;
        }
    })
);

// Setting Flash
app.use(cookieParser());
app.use(
    session({
        secret: config.sessionSecret,
        resave: true,
        saveUninitialized: false,
    })
);
app.use(flash());

// Set view to EJS
app.set('view engine', 'ejs');
// Set views root folder
app.set('views', path.join(__dirname, 'views'));
// Set static root folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const Router = require('./routes/index');
app.use(Router);

// Database
const { connectToDB } = require('./database/mongo.db');

// APP Listen
app.listen(config.PORT, () => {
    console.log(`Server started on port: ${config.PORT}`);

    connectToDB(config.mongoDBURI)
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
});
