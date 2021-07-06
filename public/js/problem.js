const id = window.location.pathname.slice(10)
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
        document.querySelector('#modifySolutionAction').action =
          '/users/me/solutions/' + id

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

            document.querySelector(`#img${i}`).style.display = 'block'
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
      console.log(error)
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

document.querySelector('#img1').addEventListener('click', async (e) => {
  // code for enlarging images
  e.preventDefault()
  document.querySelector('#enlargedPhoto').style.display = 'flex'
  document.querySelector('#img11').src = document.querySelector('#img1').src
})
