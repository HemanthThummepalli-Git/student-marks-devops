const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const marksRouter = require('./routes/marks.routes');


const createApp = () => {
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/marks', marksRouter);


app.use((err, req, res, next) => {
console.error(err);
res.status(500).json({ error: 'Internal Server Error' });
});


return app;
};


module.exports = createApp;