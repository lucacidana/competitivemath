const mongoose = require('mongoose')

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: true,
    maxlength: 50,
    minlength: 3,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 30,
    maxlength: 2000,
  },
  difficulty: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
})

const Problem = mongoose.model('Problem', problemSchema)

module.exports = Problem
