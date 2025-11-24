// src/tests/marks.test.js
const request = require('supertest');
const createApp = require('../app');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const Mark = require('../models/mark.model');


let app;


beforeAll(async () => {
// Use a local/test mongodb. CI will provide MONGO_URI
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/studentmarks_test';
await connectDB(mongoUri);
app = createApp();
});


afterAll(async () => {
await mongoose.connection.dropDatabase();
await mongoose.connection.close();
});


afterEach(async () => {
await Mark.deleteMany({});
});


test('POST /api/marks -> creates a mark', async () => {
const payload = { studentId: 's1', name: 'Alice', subject: 'Math', score: 92 };
const res = await request(app).post('/api/marks').send(payload).expect(201);
expect(res.body.studentId).toBe('s1');
expect(res.body.score).toBe(92);
});


test('GET /api/marks -> empty array', async () => {
const res = await request(app).get('/api/marks').expect(200);
expect(Array.isArray(res.body)).toBe(true);
});