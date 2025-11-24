// src/server.js
require('dotenv').config();
const createApp = require('./app');
const connectDB = require('./config/db');


const PORT = process.env.PORT || 3000;


async function start() {
try {
await connectDB(process.env.MONGO_URI);
const app = createApp();
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
} catch (err) {
console.error('Failed to start:', err.message);
process.exit(1);
}
}


if (require.main === module) start();


module.exports = start;