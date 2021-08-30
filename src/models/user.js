const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Please enter a valid email')
        }
      },
    },
    age: {
      type: Number,
      required: true,
      validate(value) {
        if (value < 0) {
          throw new Error('Age must be positive')
        }
        if (value > 100) {
          throw new Error("Age can't be greater than 100")
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.lenght < 6) {
          throw new Error('Password must be at least 6 characters long')
        }
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password cannot contain "password')
        }
      },
    },
    isProfessor: {
      type: Boolean,
      default: false,
    },
    ranking: {
      type: Number,
      default: 0,
    },
    solvedProblems: [
      {
        problemId: {
          type: String,
          trim: true,
          required: true,
        },
        title: {
          type: String,
          trim: true,
          required: true,
        },
        solution: {
          type: String,
          trim: true,
          required: true,
        },
        solutionFiles: [
          {
            type: String,
          },
        ],
        difficulty: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          required: true,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        grading: [
          {
            grade: {
              type: Number,
              validate(value) {
                if (value < 0 || value > 11) {
                  throw new Error('Grade should be a number between 1 and 10')
                }
              },
            },
            comment: {
              type: String,
              trim: true,
              maxlength: 255,
            },
            gradedBy: {
              type: String,
            },
            professorId: {
              type: mongoose.Schema.Types.ObjectId,
            },
          },
        ],
      },
    ],
    students: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      },
    ],
    // tokens: [
    //   {
    //     token: {
    //       type: String,
    //       required: true,
    //     },
    //   },
    // ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign(
    {
      password: user.password,
    },
    process.env.JWT_SECRET,
    { expiresIn: '60m' }
  )
  return token
}

userSchema.methods.getSolvedProblem = async function (id) {
  const user = this
  const solutions = user.solvedProblems.filter(
    (solution) => solution.problemId === id
  )

  return solutions
}

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })

  if (!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return user
}

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  // delete userObject.avatar

  return userObject
}

// Hash the plaintext password before saving
userSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
