// src/controllers/marks.controller.js
const Mark = require('../models/mark.model');


exports.createMark = async (req, res) => {
try {
const m = new Mark(req.body);
const saved = await m.save();
return res.status(201).json(saved);
} catch (err) {
return res.status(400).json({ error: err.message });
}
};


exports.getAllMarks = async (req, res) => {
try {
const { studentId, subject, limit = 100, skip = 0 } = req.query;
const filter = {};
if (studentId) filter.studentId = studentId;
if (subject) filter.subject = subject;
const marks = await Mark.find(filter).skip(Number(skip)).limit(Number(limit));
return res.json(marks);
} catch (err) {
return res.status(500).json({ error: err.message });
}
};


exports.getMarkById = async (req, res) => {
try {
const mark = await Mark.findById(req.params.id);
if (!mark) return res.status(404).json({ error: 'Not found' });
return res.json(mark);
} catch (err) {
return res.status(400).json({ error: 'Invalid id' });
}
};


exports.updateMark = async (req, res) => {
try {
const updated = await Mark.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
if (!updated) return res.status(404).json({ error: 'Not found' });
return res.json(updated);
} catch (err) {
return res.status(400).json({ error: err.message });
}
};


exports.deleteMark = async (req, res) => {
try {
const removed = await Mark.findByIdAndDelete(req.params.id);
if (!removed) return res.status(404).json({ error: 'Not found' });
return res.json({ message: 'Deleted' });
} catch (err) {
return res.status(400).json({ error: 'Invalid id' });
}
};