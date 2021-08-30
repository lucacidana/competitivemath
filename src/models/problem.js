const mongoose = require('mongoose')

const problemSchema = new mongoose.Schema(
  {
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
      validate(value) {
        if (!['Dificil', 'Mediu', 'Usor'].includes(value)) {
          throw new Error('Introduceti o dificultate valida')
        }
      },
    },
    category: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (
          ![
            'Algebra',
            'Analiza',
            'Geometrie',
            'Aritmetica',
            'Grafuri si Combinatorica',
            'Ecuatii Diferentiale',
            'Statistica Matematica',
            'Logica Matematica',
            'Teoria Numerelor',
            'Trigonometrie',
          ].includes(value)
        ) {
          throw new Error('Introduceti o categorie valida')
        }
      },
    },
    authorId: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Problem = mongoose.model('Problem', problemSchema)

module.exports = Problem
