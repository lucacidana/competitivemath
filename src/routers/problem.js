const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const Problem = require('../models/problem')
const jwt = require('jsonwebtoken')
require('mongoose')
const multer = require('multer')
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
})
const resize = require('../middleware/resize')
const Categories = ['Algebra', 'Analiza', 'Geometrie']
const Difficulties = ['Usor', 'Mediu', 'Dificil']
// Begin POST methods

router.post('/problems', [upload.fields([]), auth], async (req, res) => {
  // Professors can add problems. Verify for category and difficulty settings
  if (
    req.user.isProfessor &&
    Categories.includes(req.body.category) &&
    Difficulties.includes(req.body.difficulty)
  ) {
    const problem = new Problem(req.body)
    try {
      await problem.save()
      res.status(201).redirect('/problems/' + problem._id)
    } catch (e) {
      res.render('problems', {
        uniqueError: true,
      })
    }
  } else {
    res.status(401).send()
  }
})

router.post(
  // Upload a solution
  '/problems/:id',
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
    // POST a solution
    const problem = await Problem.findById(req.params.id)
    if (problem) {
      try {
        if (
          req.user.solvedProblems.some(
            (solution) => solution.problemId === req.params.id
          )
        ) {
          res.status(400).send('Problem already has a solution')
        }
        req.user.solvedProblems = req.user.solvedProblems.concat({
          problemId: req.params.id,
          title: problem.title,
          solution: req.body.solution,
          difficulty: problem.difficulty,
          category: problem.category,
          solutionFiles: req.body.images,
        })
        await req.user.save()
        res.send()
      } catch (e) {
        res.status(500).send(e)
      }
    } else {
      res.status(404).send('Problem not found')
    }
  }
)
// Begin PATCH methods
router.patch('/problems/:id', auth, async (req, res) => {
  // A professor can modify a problem's description
  if (
    JSON.stringify(Object.keys(req.body)) === '["description"]' &&
    req.user.isProfessor
  ) {
    const problem = await Problem.findById(req.params.id)
    try {
      if (problem) {
        problem.description = req.body.description
        await problem.save()
        res.send(problem)
      } else {
        res.status(404).send('Problem not found')
      }
    } catch (e) {
      res.status(500).send(e)
    }
  } else {
    if (!req.user.isProfessor) {
      res.status(401).send()
    } else {
      res.status(400).send('Invalid updates!')
    }
  }
})

// Begin DELETE methods
router.delete('/problems/:id', auth, async (req, res) => {
  // Delete a problem, should also delete all solutions with that problem id
  if (req.user.isProfessor) {
    try {
      const problem = await Problem.findByIdAndDelete(req.params.id)

      if (!problem) {
        res.status(404).send('Problem not found')
      } else {
        res.send(problem)
      }
    } catch (e) {
      res.status(500).send()
    }
  } else {
    res.status(401).send()
  }
})

// Begin GET method
router.get('/problems', async (req, res) => {
  // Getting all problems, limit/skip by 10 and be able to filter by category and difficulty (perhaps even 'isCompleted')

  const token = req.cookies['Authorization'] // This could be cleaner
  let decoded = ''

  if (token !== undefined) {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  }

  const user = await User.findOne({ password: decoded.password }).lean() //, 'tokens.token': token })

  res.render('problems', {
    Professor: user ? user.isProfessor : '',
  })
})

router.get('/problemList', async (req, res) => {
  // ProblemList is used to fetch a problem list
  try {
    let Search = req.query.search ? req.query.search : ''
    Search = Search.replace('+', ' ')
    const problems = await Problem.find(
      {
        title: { $regex: Search, $options: 'i' }, // Search by title
        category: req.query.category ? req.query.category : { $in: Categories },
        difficulty: req.query.difficulty
          ? req.query.difficulty
          : { $in: Difficulties },
      },
      'title difficulty category description',
      {
        skip: req.query.skip ? parseInt(req.query.skip) : 0,
        limit: 10,
      }
    ).lean()

    if (problems.length !== 0) {
      res.send(problems)
    } else {
      res.status(404).send()
    }
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/problemList/:id', async (req, res) => {
  // ProblemList/:id is used to fetch an individual problem and it's solution
  // Getting a problem ID can be done publicly, without auth
  try {
    let decoded = ''
    const problem = await Problem.findById(req.params.id).lean()
    const token = req.cookies['Authorization'] //.replace('Bearer ', '') // Verify if a user is logged in or not (auth middleware throws error)
    if (token !== undefined) {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    }
    const user = await User.findOne({ password: decoded.password }) //, 'tokens.token': token })

    if (problem) {
      if (user) {
        // Fetch only solutions for that problem
        solution = await user.getSolvedProblem(req.params.id)
        res.send({ problem, solution })
      } else {
        // If not logged in, only send the problem
        res.send(problem)
      }
    } else {
      // If problem not found, send new error
      throw new Error()
    }
  } catch (e) {
    res.status(404).send()
  }
})

router.get('/problemList/:id/:studId', auth, async (req, res) => {
  // Returns a problem with id = :id and the solution of :studId
  try {
    if (
      !req.user.students.some(
        (student) => student.studentId == req.params.studId
      )
    ) {
      res.send()
    } else {
      const problem = await Problem.findById(req.params.id).lean()
      const user = await User.findById(req.params.studId)
      const solution = await user.getSolvedProblem(req.params.id)

      res.send({ problem, solution })
    }
  } catch (error) {
    res.send(error)
  }
})

router.get('/problems/:id', async (req, res) => {
  let decoded = ''
  let Professor = ''

  const token = req.cookies['Authorization'] //.replace('Bearer ', '') // Verify if a user is logged in or not (auth middleware throws error)
  if (token !== undefined) {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  }
  const user = await User.findOne({ password: decoded.password }).lean() //, 'tokens.token': token })
  Professor = user ? user.isProfessor : ''

  res.render('problem', {
    Professor,
    loggedIn: user ? true : false,
  })
})

router.get('/problems/:id/:studId', auth, async (req, res) => {
  if (req.user.isProfessor) {
    if (
      req.user.students.some(
        (student) => student.studentId == req.params.studId
      )
    ) {
      res.render('problem', {
        Professor: true,
        loggedIn: true,
      })
    } else {
      res.redirect(`/problems/${req.params.id}`)
    }
  } else {
    res.redirect(`/problems/${req.params.id}`)
  }
})

router.post('/problems/:id/:studId', auth, async (req, res) => {
  // Perhaps make the nested 'if's a bit cleaner
  // Grade a solution, optionally leave a comment

  if (!req.user.isProfessor) {
    // If user is auth but not a professor
    res.status(401).send({})
  } else if (
    //check if req.params.id is in student list & if we have the body
    req.user.students.some(
      (student) => student.studentId == req.params.studId
    ) &&
    req.body.comment &&
    req.body.grade
  ) {
    try {
      let user = await User.findById(req.params.studId)
      if (!user) {
        res.status(404).send('User does not exist') // In case URL is changed manually with a student which deleted its account
      } else {
        user.solvedProblems.forEach((solution) => {
          if (solution.problemId == req.params.id) {
            solution.grading = [
              {
                comment: req.body.comment,
                grade: req.body.grade,
                gradedBy: req.user.name,
                professorId: req.user._id,
              },
            ]
          }
        })
        if (user.isModified()) {
          await user.save()
          res.send({})
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

module.exports = router
