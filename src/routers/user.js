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
      // IMPORTANT TO REPRODUCE
      error: 'Email already has an account',
    })
  }
})

router.post('/users/login', upload.fields([]), async (req, res) => {
  // Login
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    // res.send({
    //   name: user.name,
    //   email: user.email,
    //   solutions: user.solvedProblems,
    //   token,
    // })

    res.cookie('Authorization', token, { maxAge: 300000 })
    res.redirect('/users/me') //TEST
  } catch (e) {
    res.render('login', {
      error: 'Incorrect email or password!',
    })
  }
})

router.post('/users/logout', auth, async (req, res) => {
  // Logout
  try {
    // req.user.tokens = req.user.tokens.filter((token) => {
    //   return token.token !== req.token
    // })
    res.clearCookie('Authorization')
    res.redirect('/')
  } catch (e) {
    res.status(500).send()
  }
})

// router.post('/users/logoutAll', auth, async (req, res) => {
//   // Logout from all places
//   try {
//     req.user.tokens = []

//     await req.user.save()
//     res.send()
//   } catch (e) {
//     res.status(500).send()
//   }
// })

router.post(
  '/users/me/students',
  [upload.fields([]), auth],
  async (req, res) => {
    // POST a student
    if (req.user.isProfessor) {
      // Verificam daca cererea este facuta de un profesor
      try {
        const user = await User.findOne({ email: req.body.email }) // Cautam utilizatorul dupa email
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

router.post('/users/me/students/:id/:problem', auth, async (req, res) => {
  // Perhaps make the nested 'if's a bit cleaner
  // Grade a solution, optionally leave a comment
  if (!req.user.isProfessor) {
    // If user is auth but not a professor
    res.status(401).send()
  } else if (
    //check if req.params.id is in student list & if we have the body
    req.user.students.some(
      (student) => student.studentId.toString() === req.params.id
    ) &&
    req.body.comment &&
    req.body.grade
  ) {
    try {
      const user = await User.findById(req.params.id)
      if (!user) {
        res.status(404).send('User does not exist') // In case URL is changed manually with a student which deleted its account
      } else {
        user.solvedProblems.forEach((solution) => {
          if (solution.problemId === req.params.problem) {
            solution.comment = req.body.comment
            solution.grading = req.body.grade
          }
        })
        if (user.isModified()) {
          await user.save()
          res.send({ Comment: req.body.comment, Grade: req.body.grade })
        } else {
          res.status(404).send('Solution not found or grade has not changed')
        }
      }
    } catch (e) {
      res.status(500).send()
    }
  } else {
    res.status(400).send()
  }
})

// Begin DELETE methods
router.delete('/users/me/solutions/:id', auth, async (req, res) => {
  // delete solution for a problem
  const problem = await Problem.findById(req.params.id)
  if (problem) {
    try {
      req.user.solvedProblems = req.user.solvedProblems.filter((solutions) => {
        return solutions.problemId !== req.params.id
      })
      await req.user.save()
      res.send('Solution was successfully deleted')
    } catch (e) {
      res.status(500).send(e)
    }
  } else {
    res.status(404).send('Solution for problem was not found')
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    sendCancelationEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.delete('/users/me/students/:id')

// Begin PATCH methods
router.post('/users/me', [upload.fields([]), auth], async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password']
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  )

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' }) // catch
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]))
    await req.user.save()
    res.clearCookie('Authorization')
    res.redirect('/users/me')
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post('/recover', upload.fields([]), async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (user) {
    try {
      user.password = req.body.password
      await user.save()
      res.send({ message: 'Successfully changed password' })
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
          if (solution.problemId === req.params.id) {
            solution.solution = req.body.solution
            solution.grading.grade = null
            solution.solutionFiles = req.body.images
          }
        })

        if (req.user.isModified()) {
          await req.user.save()
          res.send()
        }
        res.status(404).send('No solution to be modified was found')
      } catch (e) {
        res.status(500).send()
      }
    } else {
      res.status(400).send('Please add a solution')
    }
  }
)

// Begin GET methods
router.get('/', async (req, res) => {
  try {
    const token = req.cookies['Authorization'].replace('Bearer ', '') // Verify if a user is logged in or not (auth middleware throws error)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
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

router.get('/users/me', auth, async (req, res) => {
  // Requires auth
  // GET profile
  res.render('profile', {
    Professor: req.user.isProfessor,
  })
})

router.get('/users/:id', async (req, res) => {
  // Display profile page, check if
  res.render('profile', {
    Professor: req.user.isProfessor,
    //isStudent: true/false
  })
})

router.get('/users/:id/data', auth, async (req, res) => {
  if (req.params.id === 'me') {
    try {
      res.send(req.user)
    } catch (e) {
      res.status(404).send()
    }
  }
  try {
    const user = await User.findById(req.params.id) //Limit access to data

    if (!user) {
      throw new Error()
    }
    res.send(user)
  } catch (e) {
    res.status(404).send()
  }
})

router.get('/users/me/solutions', auth, async (req, res) => {
  // GET user's solutions
  try {
    const result = req.user.solvedProblems.slice(
      // Fetch the next 10
      req.query.skip ? req.query.skip : 0,
      req.query.skip ? parseInt(req.query.skip) + 10 : 10
    )

    if (result) {
      if (req.query.category) {
        // Filter by 'category'
        result = result.filter(
          (solution) => solution.category === req.query.category
        )
      }

      if (req.query.difficulty) {
        // Filter by 'difficulty'
        result = result.filter(
          (solution) => solution.difficulty === req.query.difficulty
        )
      }

      res.render('solutions', {
        Professor: req.user.isProfessor,
      })
    } else {
      res.status(404).send({ error: 'No solutions found' })
    }
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/users', auth, async (req, res) => {
  // Get list of users by searching for email or name
  const Search = req.body.search
  if (!Search || Search.length < 3) {
    // No need for 2nd condition -------- TO DO ---------
    // Search term shouldn't be less than 2 characters (to avoid fetching half of the db)
    res
      .status(400)
      .send('Please provide a search term longer than 2 characters')
  } else {
    try {
      if (validator.isEmail(Search)) {
        const result = await User.find({ email: Search }, 'name email age', {
          skip: req.query.skip ? parseInt(req.query.skip) : 0,
          limit: req.query.limit ? parseInt(req.query.limit) : 10,
        })
        res.send(result.length !== 0 ? result : 'No user found')
      } else {
        const result = await User.find(
          {
            name: { $regex: Search, $options: 'i' }, // Use regex to find parts of the name, 'i' option for case insensitive
          },
          'name email age',
          {
            skip: req.query.skip ? parseInt(req.query.skip) : 0,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
          }
        )
        res.send(result.length !== 0 ? result : 'No user found')
      }
    } catch (e) {
      res.status(500).send()
    }
  }
})

// router.get('/users/me/solutions/:id', auth, async (req, res) => {
//   // Get solutions for a specific problem
//   try {
//     const solutions = await req.user.getSolvedProblem(req.params.id)

//     if (solutions.length === 0) {
//       res.status(404).send()
//     } else {
//       res.send(solutions)
//     }
//   } catch (e) {
//     res.status(500).send()
//   }
// })

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
            skip: req.query.skip ? parseInt(req.query.skip) : 0,
            limit: 36,
          }
        )
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

module.exports = router
