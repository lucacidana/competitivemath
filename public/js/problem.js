const id = window.location.pathname.slice(10) // Fetch problem & solution
fetch('/problemList/' + id).then((response) => {
  response
    .json()
    .then((data) => {
      let problemData = data.problem ? data.problem : data
      let problemSolution = data.solution ? data.solution[0] : ''

      document.querySelector('#problemTitle').textContent = problemData.title
      document.querySelector('#problemDesc').value = problemData.description
      document.querySelector('#problemCategory').textContent =
        problemData.category
      document.querySelector('#problemDifficulty').textContent =
        problemData.difficulty

      if (problemData.category === 'Algebra') {
        document.querySelector('#problemCategory').classList.add('bg-blue-400')
      } else if (problemData.category === 'Analiza') {
        document.querySelector('#problemCategory').classList.add('bg-red-400')
      } else {
        document.querySelector('#problemCategory').classList.add('bg-pink-400')
      }

      if (problemData.difficulty === 'Usor') {
        document
          .querySelector('#problemDifficulty')
          .classList.add('bg-green-400')
      } else if (problemData.difficulty === 'Mediu') {
        document
          .querySelector('#problemDifficulty')
          .classList.add('bg-green-500')
      } else {
        document
          .querySelector('#problemDifficulty')
          .classList.add('bg-green-600')
      }

      if (document.querySelector('#problemButton')) {
        document.querySelector('#problemButton').textContent = problemSolution
          ? 'Modify solution'
          : 'Add solution'
      }
      if (problemSolution) {
        document.querySelector('#solutionDescription').value =
          problemSolution.solution
        // document.querySelector('#modifySolutionAction').action = No need for this since we are fetching from clientside
        //   '/users/me/solutions/' + id

        if (problemSolution.grading.grade) {
          document.querySelector('#solutionGrade').textContent =
            problemSolution.grading.grade.toString()
          document.querySelector('#solutionComment').textContent =
            problemSolution.grading.comment
          document.querySelector('#gradedBy').textContent =
            problemSolution.grading.gradedBy
        } else {
          document.querySelector('#solutionComment').textContent =
            problemSolution.grading.comment
          document.querySelector('#gradedBy').textContent =
            problemSolution.grading.gradedBy
          document
            .querySelector('#gradedBy')
            .setAttribute('href', '/users/' + problemSolution.professorId)
        }

        if (problemSolution.solutionFiles) {
          let i = 1
          problemSolution.solutionFiles.forEach((buffer) => {
            document.querySelector(`#img${i}`).src =
              'data:image/jpeg;base64,' + buffer

            document.querySelector(`#img${i}`).style.display = 'flex'
            i = ++i
          })
          document.querySelector('#solutionImagesDiv').style.display = 'flex'
        }
        document.querySelector('#solutionDiv').style.display = 'block'
      } else {
        document.querySelector('#addSolutionAction').action = '/problems/' + id
      }

      document.querySelector('#problemDiv').style.display = 'block'
    })
    .catch((error) => {
      document.querySelector('#problemTitle').textContent =
        "Problem doesn't exist"
    })
})

if (document.querySelector('#problemButton')) {
  document
    .querySelector('#problemButton')
    .addEventListener('click', async (e) => {
      e.preventDefault()
      document.querySelector('#modalBackground').style.display = 'block'
      if (
        document.querySelector('#problemButton').textContent ===
        'Modify solution'
      ) {
        document.querySelector('#modifySolutionForm').style.display = 'flex'
      } else {
        document.querySelector('#addSolutionForm').style.display = 'flex'
      }
    })
}

document
  .querySelector('#modalBackground')
  .addEventListener('click', async (e) => {
    e.preventDefault()
    document.querySelector('#modalBackground').style.display = 'none'
    if (
      document.querySelector('#modifySolutionForm').style.display === 'flex'
    ) {
      document.querySelector('#modifySolutionForm').style.display = 'none'
    } else if (
      document.querySelector('#enlargedPhoto').style.display === 'flex'
    ) {
      document.querySelector('#enlargedPhoto').style.display = 'none'
    } else {
      document.querySelector('#addSolutionForm').style.display = 'none'
    }
  })

document
  .querySelector('#enlargedPhoto')
  .addEventListener('click', async (e) => {
    document.querySelector('#enlargedPhoto').style.display = 'none'
  })

document
  .querySelector('#modifySolutionAction')
  .addEventListener('submit', async (e) => {
    e.preventDefault()
    let URL = '/users/me/solutions/' + id
    fetch(URL, {
      // Modify solution
      method: 'POST',
      body: new FormData(document.querySelector('#modifySolutionAction')),
    }).then((response) => {
      if (response.status === 400) {
        document.querySelector('#modFileError').textContent =
          'File too large (>1mb)'
      } else {
        document.querySelector('#modFileError').classList.remove('text-red-500')
        document.querySelector('#modFileError').classList.add('text-green-500')
        document.querySelector('#modFileError').textContent =
          'Successfuly modified solution!'
        setTimeout(() => {
          window.location.href = '/problems/' + id
        }, 2000)
      }
    })
  })

document
  .querySelector('#addSolutionAction')
  .addEventListener('submit', async (e) => {
    e.preventDefault()
    let URL = '/problems/' + id
    fetch(URL, {
      // Add solution
      method: 'POST',
      body: new FormData(document.querySelector('#addSolutionAction')),
    }).then((response) => {
      if (response.status === 400) {
        document.querySelector('#addFileError').textContent =
          'File too large (>1mb)'
      } else {
        document.querySelector('#addFileError').classList.remove('text-red-500')
        document.querySelector('#addFileError').classList.add('text-green-500')
        document.querySelector('#addFileError').textContent =
          'Successfuly added solution!'
        setTimeout(() => {
          window.location.href = '/problems/' + id
        }, 3000)
      }
    })
  })

// Begin enlarge image listeners
document.querySelector('#img1').addEventListener('click', async (e) => {
  e.preventDefault()
  document.querySelector('#enlargedPhoto').style.display = 'flex'
  document.querySelector('#img11').src = document.querySelector('#img1').src
})

document.querySelector('#img2').addEventListener('click', async (e) => {
  e.preventDefault()
  document.querySelector('#enlargedPhoto').style.display = 'flex'
  document.querySelector('#img11').src = document.querySelector('#img2').src
})

document.querySelector('#img3').addEventListener('click', async (e) => {
  e.preventDefault()
  document.querySelector('#enlargedPhoto').style.display = 'flex'
  document.querySelector('#img11').src = document.querySelector('#img3').src
})

document.querySelector('#img4').addEventListener('click', async (e) => {
  e.preventDefault()
  document.querySelector('#enlargedPhoto').style.display = 'flex'
  document.querySelector('#img11').src = document.querySelector('#img4').src
})

document.querySelector('#img5').addEventListener('click', async (e) => {
  e.preventDefault()
  document.querySelector('#enlargedPhoto').style.display = 'flex'
  document.querySelector('#img11').src = document.querySelector('#img5').src
})

document.querySelector('#img6').addEventListener('click', async (e) => {
  e.preventDefault()
  document.querySelector('#enlargedPhoto').style.display = 'flex'
  document.querySelector('#img11').src = document.querySelector('#img6').src
})

document.querySelector('#img7').addEventListener('click', async (e) => {
  e.preventDefault()
  document.querySelector('#enlargedPhoto').style.display = 'flex'
  document.querySelector('#img11').src = document.querySelector('#img7').src
})

document.querySelector('#img8').addEventListener('click', async (e) => {
  e.preventDefault()
  document.querySelector('#enlargedPhoto').style.display = 'flex'
  document.querySelector('#img11').src = document.querySelector('#img8').src
})

document.querySelector('#img9').addEventListener('click', async (e) => {
  e.preventDefault()
  document.querySelector('#enlargedPhoto').style.display = 'flex'
  document.querySelector('#img11').src = document.querySelector('#img9').src
})

document.querySelector('#img10').addEventListener('click', async (e) => {
  e.preventDefault()
  document.querySelector('#enlargedPhoto').style.display = 'flex'
  document.querySelector('#img11').src = document.querySelector('#img10').src
})
