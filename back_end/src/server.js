const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
dotenv.config({});
const app = express();
app.use(
    cors({
        origin: 'http://localhost:5173', // Chỉ cho phép domain này
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
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
