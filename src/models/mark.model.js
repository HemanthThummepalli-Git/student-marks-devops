// src/models/mark.model.js
const mongoose = require('mongoose');


const MarkSchema = new mongoose.Schema({
studentId: { type: String, required: true, index: true },
name: { type: String, required: true },
subject: { type: String, required: true },
score: { type: Number, required: true, min: 0, max: 100 },
date: { type: Date, default: Date.now }
}, { timestamps: true });


module.exports = mongoose.model('Mark', MarkSchema);