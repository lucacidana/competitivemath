const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const Problem = require('../models/problem')
const jwt = require('jsonwebtoken')
require('mongoose')
const multer = require('multer')
const upload = multer()
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
        res.redirect('/problems/' + req.params.id)
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
  let Professor = false
  if (token !== undefined) {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  }

  const user = await User.findOne({ password: decoded.password }) //, 'tokens.token': token })

  res.render('problems', {
    Professor: user ? user.isProfessor : '',
  })
})

router.get('/problemList', async (req, res) => {
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
    )
    if (problems.length !== 0) {
      res.send(problems)
    } else {
      res.status(404).send()
    }
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/problems/:id', async (req, res) => {
  let decoded = ''
  let Professor = ''

  const token = req.cookies['Authorization'] //.replace('Bearer ', '') // Verify if a user is logged in or not (auth middleware throws error)
  if (token !== undefined) {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  }
  const user = await User.findOne({ password: decoded.password }) //, 'tokens.token': token })
  Professor = user ? user.isProfessor : ''

  res.render('problem', {
    Professor,
    loggedIn: user ? true : false,
  })
})

router.get('/problemList/:id', async (req, res) => {
  // Getting a problem ID can be done publicly, without auth

  try {
    let decoded = ''
    const problem = await Problem.findById(req.params.id)

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

module.exports = router