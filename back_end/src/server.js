const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const envPath = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envPath });
const app = express();
app.use(
    cors({
        origin: process.env.URL_CORS,
        credentials: true
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'public')));
const connectDB = require('./config/db');
connectDB();
routes(app);
app.listen(process.env.PORT || 5000, '0.0.0.0', () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
