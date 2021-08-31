const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const Problem = require('../models/problem')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const validator = require('validator')
const multer = require('multer')
const sharp = require('sharp')
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
})
const jwt = require('jsonwebtoken')
const e = require('express')
const resize = require('../middleware/resize')

// Begin POST methods

router.post('/users/create', upload.fields([]), async (req, res) => {
  // Sign Up
  const user = new User(req.body)

  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.cookie('Authorization', token, { maxAge: 300000 })
    res.redirect('/users/me')
  } catch (e) {
    res.render('signup', {
      error: 'Email-ul are deja un cont',
    })
  }
})

router.post('/users/login', upload.fields([]), async (req, res) => {
  // Login
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()

    res.cookie('Authorization', token, { maxAge: 3600000 })
    res.redirect('/users/me')
  } catch (e) {
    res.render('login', {
      error: 'Email sau parola invalida!',
    })
  }
})

router.post('/users/logout', async (req, res) => {
  // Logout
  try {
    res.clearCookie('Authorization')
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post(
  '/users/me/students',
  [upload.fields([]), auth],
  async (req, res) => {
    // POST a student
    if (req.user.isProfessor) {
      // Verificam daca cererea este facuta de un profesor
      try {
        const user = await User.findOne({ email: req.body.email }).lean() // Cautam utilizatorul dupa email
        const id = user ? user._id.toString() : null
        if (!user || user.isProfessor) {
          // Nu se gaseste studentul dupa email sau email-ul este a unui profesor
          res.render('students', {
            Professor: true,
            error: 'Studentul nu exista!',
          })
        } else if (
          // Verificam daca studentul este deja adaugat
          req.user.students.some(
            (student) => student.studentId.toString() === id
          )
        ) {
          res.render('students', {
            Professor: true,
            error: 'Studentul a fost deja adaugat',
          })
        } else {
          // Adaugam id-ul studentului in array
          req.user.students.push({ studentId: user._id })

          await req.user.save()
          res.redirect('/users/me/students')
        }
      } catch (e) {
        // Internal error
        res.status(500).send()
      }
    } else {
      // Unauthorized - requestul este facut de un student/guest
      res.status(401).send()
    }
  }
)

// Begin PATCH methods
router.post('/users/me', [upload.fields([]), auth], async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password']
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  )

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Schimbari invalide!' }) // catch
  }

  try {
    updates.forEach((update) => {
      if (req.body[update]) {
        req.user[update] = req.body[update]
      }
    })

    await req.user.save()
    res.clearCookie('Authorization')
    res.redirect('/users/me')
  } catch (e) {
    res.render('profile', { error: 'Email-ul nu este disponibil!' })
  }
})

router.post('/recover', upload.fields([]), async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (user) {
    try {
      user.password = req.body.password
      await user.save()
      res.send({ message: 'Parola schimbata cu success' })
    } catch (error) {
      res.status(500).send()
    }
  } else {
    res.status(400).send()
  }
})

router.post(
  '/users/me/avatar',
  [auth, upload.single('avatar')],
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 300 })
      .jpeg({ quality: 80 })
      .toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
  },
  (error, req, res, next) => {
    res.status(400).send({ error: 'File too large!' })
  }
)

router.post(
  //Modify a solution
  '/users/me/solutions/:id',
  [
    upload.fields([
      {
        name: 'files',
        maxCount: 10,
      },
    ]),
    auth,
    resize,
  ],
  async (req, res) => {
    if (req.body.solution) {
      try {
        req.user.solvedProblems.forEach((solution) => {
          if (solution.problemId == req.params.id) {
            solution.solution = req.body.solution
            if (solution.grading[0]) {
              req.user.ranking = req.user.ranking - solution.grading[0].grade
              solution.grading[0].grade = null
            }
            solution.solutionFiles = req.body.images
            solution.updatedAt = Date.now()
          }
        })

        if (req.user.isModified()) {
          await req.user.save()
          res.send()
        }
        res.status(404).send('Nu s-a gasit solutia')
      } catch (e) {
        res.status(500).send()
      }
    } else {
      res.status(400).send('Adauga o solutie')
    }
  }
)

// Begin GET methods
router.get('/', async (req, res) => {
  try {
    const token = req.cookies['Authorization'].replace('Bearer ', '') // Verify if a user is logged in or not (auth middleware throws error)
    jwt.verify(token, process.env.JWT_SECRET)
    res.redirect('/users/me')
  } catch (e) {
    res.redirect('/users/login')
  }
})

router.get('/users/login', async (req, res) => {
  // TEST METHOD
  // Login
  try {
    if (req.cookies['Authorization']) {
      res.render('login', {
        loggedIn: true,
      })
    } else {
      res.render('login')
    }
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/users/create', async (req, res) => {
  res.render('signup')
})

router.get('/users/leaderboard', auth, async (req, res) => {
  res.render('leaderboard', {
    Professor: req.user.isProfessor,
  })
})

router.get('/users/leaderboard/data', auth, async (req, res) => {
  if ('myStudents' in req.query) {
    if (req.user.isProfessor) {
      const ids = []
      req.user.students.forEach((student) => ids.push(student.studentId))
      const users = await User.find(
        {
          _id: { $in: ids },
          email: req.query.email ? req.query.email : new RegExp(/.*/),
        },
        'name ranking',
        {
          skip:
            req.query.skip && req.query.skip >= 0
              ? parseInt(req.query.skip)
              : 0,
          limit: 10,
        }
      )
        .sort({ ranking: 'desc' })
        .lean()
      res.send(users)
    }
  } else {
    const users = await User.find(
      {
        email: req.query.email ? req.query.email : new RegExp(/.*/),
      },
      'name ranking',
      {
        skip:
          req.query.skip && req.query.skip >= 0 ? parseInt(req.query.skip) : 0,
        limit: 10,
      }
    )
      .sort({ ranking: 'desc' })
      .lean()
    res.send(users)
  }
})

router.get('/users/:id', auth, async (req, res) => {
  // Display profile page, check if
  res.render('profile', {
    Professor: req.user.isProfessor,
    isSelf:
      req.params.id === 'me' || req.user.id === req.params.id ? true : false,
  })
})

router.get('/users/:id/data', auth, async (req, res) => {
  if (req.params.id === 'me' || req.params.id == req.user._id) {
    // Own profile
    try {
      const completedProblems = req.user.solvedProblems.length
      if (!req.user.isProfessor) {
        // Students will be greeted with their last 10 most recent solutions
        req.user.solvedProblems.sort((a, b) => b.updatedAt - a.updatedAt)
        req.user.solvedProblems = req.user.solvedProblems.slice(0, 10)

        res.send({ user: req.user, problem: undefined, completedProblems })
      } else {
        // Professors will be greeted with the last 10 most recent problems
        const problems = await Problem.find(
          {},
          'title difficulty category description authorId authorName',
          {
            limit: 10,
          }
        )
          .sort({ updatedAt: 'desc' })
          .lean()
        res.send({ user: req.user, problems, completedProblems })
      }
    } catch (e) {
      res.status(404).send()
    }
  } else {
    try {
      // Public profile
      const user = await User.findById(req.params.id).lean()

      if (!user) {
        throw new Error()
      }
      const completedProblems = user.solvedProblems.length
      if (user.isProfessor) {
        // If accessing a professor's public profile, show his last uploaded problems
        const problems = await Problem.find(
          { authorId: user._id },
          'title difficulty category description authorId authorName',
          {
            limit: 10,
          }
        )
          .sort({ updatedAt: 'desc' })
          .lean()
        delete user.students
        delete user.createdAt
        delete user.updatedAt
        delete user.__v
        delete user.solvedProblems
        delete user.password
        res.send({
          user,
          problems,
          completedProblems,
        })
      } else {
        // Else if accessing a student's profile, show his last uploaded solutions
        user.solvedProblems.sort((a, b) => b.updatedAt - a.updatedAt)
        user.solvedProblems = user.solvedProblems.slice(0, 10)

        if (req.user.isProfessor) {
          req.user.students.forEach((student) => {
            if (student.studentId == req.params.id) {
              // If the user who view's the profile is the student's teacher, show the solutions grade
              delete user.updatedAt
              delete user.createdAt
              delete user.students
              delete user.__v
              delete user.password
              res.send({ user, problem: undefined, completedProblems })
            }
          })
        } else {
          // Else, hide them
          delete user.updatedAt
          delete user.createdAt
          delete user.students
          delete user.__v
          delete user.password
          user.solvedProblems.forEach((solution) => {
            delete solution.solution
            delete solution.solutionFiles
            solution.grading = []
          })
          res.send({ user, problem: undefined, completedProblems })
        }
      }
    } catch (e) {
      res.status(404).send()
    }
  }
})

router.get('/users/:id/solutions', auth, async (req, res) => {
  res.render('solutions', {
    Professor: req.user.isProfessor,
  })
})

router.get('/users/:id/solutions/data', auth, async (req, res) => {
  // GET user's solutions
  try {
    let user = ''
    if (req.params.id === 'me') {
      user = req.user
    } else {
      user = await User.findById(req.params.id).lean()
    }
    let Search = req.query.search ? req.query.search.replace('+', ' ') : ''

    user.solvedProblems = user.solvedProblems.filter((solution) =>
      solution.title.includes(Search)
    )

    user.solvedProblems = user.solvedProblems.slice(
      // Fetch the next 10
      req.query.skip && req.query.skip >= 0 ? req.query.skip : 0,
      req.query.skip && req.query.skip >= 0 ? parseInt(req.query.skip) + 10 : 10
    )
    if (user.solvedProblems) {
      if (req.query.category) {
        // Filter by 'category'
        user.solvedProblems = user.solvedProblems.filter(
          (solution) => solution.category === req.query.category
        )
      }

      if (req.query.difficulty) {
        // Filter by 'difficulty'
        user.solvedProblems = user.solvedProblems.filter(
          (solution) => solution.difficulty === req.query.difficulty
        )
      }

      let isStudent = false
      if (req.user.isProfessor && req.params.id !== 'me') {
        req.user.students.forEach((student) => {
          if (student.studentId == req.params.id) {
            isStudent = true
          }
        })
      }

      if (!isStudent && req.params.id !== 'me') {
        user.solvedProblems.forEach((solution) => {
          solution.solution = null
          solution.solutionFiles = null
          solution.grading = null
        })
      }
      res.send(user.solvedProblems)
    } else {
      res.status(404).send({ error: 'Nu s-au gasit solutii' })
    }
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/users/me/studentList', auth, async (req, res) => {
  if (req.user.isProfessor) {
    try {
      if (req.user.students.length !== 0) {
        let ids = []
        req.user.students.forEach((student) => ids.push(student.studentId)) // Any way to make this cleaner?

        let studentName = req.query.name ? req.query.name : ''
        studentName = studentName.replace('+', ' ')
        const users = await User.find(
          // fetching student information
          {
            _id: { $in: ids },
            name: { $regex: studentName, $options: 'i' },
          },
          'studentId name email',
          {
            skip:
              req.query.skip && req.query.skip >= 0
                ? parseInt(req.query.skip)
                : 0,
            limit: 36,
          }
        ).lean()
        if (users.length !== 0) {
          res.send(users)
        } else {
          res.status(404).send()
        }
      } else {
        res.status(404).send()
      }
    } catch (e) {
      res.status(500).send()
    }
  } else {
    res.redirect('/')
  }
})

router.get('/users/me/students', auth, async (req, res) => {
  // Get my students (only if professor)
  if (req.user.isProfessor) {
    try {
      res.render('students', {
        Professor: true,
      })
    } catch (e) {
      res.status(500).send()
    }
  } else {
    res.redirect('/')
  }
})

// router.get('/users', auth, async (req, res) => {
//   // Get list of users by searching for email or name
//   const Search = req.body.search
//   if (!Search || Search.length < 3) {
//     // No need for 2nd condition -------- TO DO ---------
//     // Search term shouldn't be less than 2 characters (to avoid fetching half of the db)
//     res
//       .status(400)
//       .send('Please provide a search term longer than 2 characters')
//   } else {
//     try {
//       if (validator.isEmail(Search)) {
//         const result = await User.find({ email: Search }, 'name email age', {
//           skip: req.query.skip ? parseInt(req.query.skip) : 0,
//           limit: req.query.limit ? parseInt(req.query.limit) : 10,
//         }).lean()
//         res.send(result.length !== 0 ? result : 'No user found')
//       } else {
//         const result = await User.find(
//           {
//             name: { $regex: Search, $options: 'i' }, // Use regex to find parts of the name, 'i' option for case insensitive
//           },
//           'name email age',
//           {
//             skip: req.query.skip ? parseInt(req.query.skip) : 0,
//             limit: req.query.limit ? parseInt(req.query.limit) : 10,
//           }
//         )
//         res.send(result.length !== 0 ? result : 'No user found')
//       }
//     } catch (e) {
//       res.status(500).send()
//     }
//   }
// })

router.get('/users/me/students/delete/:id', auth, async (req, res) => {
  // Delete an individual student
  try {
    req.user.students = req.user.students.filter((student) => {
      return student.studentId.toString() !== req.params.id
    })

    await req.user.save()
    res.redirect('/users/me/students?name=')

    // const user = await User.findById(req.params.id, 'name email solutions')
  } catch (e) {
    res.status(500).send()
  }
})

// Begin DELETE methods
// router.delete('/users/me/solutions/:id', auth, async (req, res) => {
//   // delete solution for a problem
//   const problem = await Problem.findById(req.params.id)
//   if (problem) {
//     try {
//       req.user.solvedProblems = req.user.solvedProblems.filter((solutions) => {
//         return solutions.problemId !== req.params.id
//       })
//       await req.user.save()
//       res.send('Solution was successfully deleted')
//     } catch (e) {
//       res.status(500).send(e)
//     }
//   } else {
//     res.status(404).send('Solution for problem was not found')
//   }
// })

// router.delete('/users/me', auth, async (req, res) => {
//   try {
//     await req.user.remove()
//     sendCancelationEmail(req.user.email, req.user.name)
//     res.send(req.user)
//   } catch (e) {
//     res.status(500).send(e)
//   }
// })
module.exports = router
