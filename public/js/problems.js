const searchForm = document.querySelector('form')
const problemHeading = document.querySelector('#problem-heading')
const problemDiv = document.querySelector('#problemDiv')
const addProblemModal = document.querySelector('#addProblemModal')
const addProblemButton = document.querySelector('#addProblemButton')
const closeAddProblemButton = document.querySelector('#closeAddProblem')
const submitProblemForm = document.querySelector('#submitProblem')
const navigateLeft = document.querySelector('#navigateLeft')
const navigateRight = document.querySelector('#navigateRight')

// Populate the problem list
if (window.location.href.includes('?')) {
  let URL =
    '/problemList' +
    window.location.href.slice(window.location.href.indexOf('?')) // For sec purposes, I should use URL params and concat that, not just paste the queries
  let urlParams = new URLSearchParams(window.location.search)
  let skipValue = urlParams.get('skip')
  fetch(URL).then((response) => {
    response
      .json()
      .then((data) => {
        problemDiv.style.display = 'block'
        problemHeading.textContent = 'Problems'
        let i = 1
        data.forEach((value) => {
          document
            .querySelector(`#link${i}`)
            .setAttribute('href', `/problems/${value._id}`)
          document.querySelector(`#link${i}`).textContent = value.title

          document.querySelector(`#category${i}`).textContent = value.category
          if (value.category === 'Algebra') {
            document.querySelector(`#category${i}`).classList.add('bg-blue-400')
          } else if (value.category === 'Analiza') {
            document.querySelector(`#category${i}`).classList.add('bg-red-400')
          } else {
            document.querySelector(`#category${i}`).classList.add('bg-pink-400')
          }

          document.querySelector(`#difficulty${i}`).textContent =
            value.difficulty
          if (value.difficulty === 'Usor') {
            document
              .querySelector(`#difficulty${i}`)
              .classList.add('bg-green-400')
          } else if (value.difficulty === 'Mediu') {
            document
              .querySelector(`#difficulty${i}`)
              .classList.add('bg-green-500')
          } else {
            document
              .querySelector(`#difficulty${i}`)
              .classList.add('bg-green-600')
          }

          if (value.description.length > 100) {
            document.querySelector(`#short${i}`).textContent =
              value.description.slice(0, 100) + '...'
          } else {
            document.querySelector(`#short${i}`).textContent = value.description
          }
          document.querySelector(`#problem${i}`).style.display = 'block'
          i = ++i
        })

        if (i === 11 && skipValue < 10) {
          navigateRight.style.display = 'block'
        } else if (i === 11 && skipValue >= 10) {
          navigateLeft.style.display = 'block'
          navigateRight.style.display = 'block'
        } else if (i !== 11 && skipValue >= 10) {
          navigateLeft.style.display = 'block'
        }
      })
      .catch((error) => {
        problemDiv.style.display = 'block'
        problemHeading.textContent = 'No problems were found!'
      })
  })
}

// Populate query via form
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  let URL = '/problems?'
  const formData = new FormData(searchForm)
  for (var pair of formData.entries()) {
    URL = URL + pair[0] + '=' + pair[1] + '&'
  }
  URL = URL.slice(0, -1)

  window.location.href = URL
})

// Add logic to navigateRight, basically add 10 to the skip query
navigateRight.addEventListener('click', async (e) => {
  let urlParams = new URLSearchParams(window.location.search)
  let skipValue = parseInt(urlParams.get('skip'), 10)

  if (isNaN(skipValue)) {
    urlParams.set('skip', '10')
  } else {
    urlParams.set('skip', (skipValue + 10).toString())
  }

  window.location.href = '/problems?' + urlParams.toString()
})

// Add logic to navigateLeft, basically add 10 to the skip query
navigateLeft.addEventListener('click', async (e) => {
  let urlParams = new URLSearchParams(window.location.search)
  urlParams.set('skip', (parseInt(urlParams.get('skip'), 10) - 10).toString())
  window.location.href = '/problems?' + urlParams.toString()
})

document.querySelector('#clearButton').addEventListener('click', async (e) => {
  e.preventDefault()
  window.location.href = '/problems'
})

// Show the form
if (addProblemButton) {
  addProblemButton.addEventListener('click', async (e) => {
    addProblemModal.style.display = 'block'
    addProblemForm.style.display = 'block'
  })
}
// Close the form
closeAddProblemButton.addEventListener('click', async (e) => {
  e.preventDefault()
  window.location.href = window.location.href
})

addProblemModal.addEventListener('click', (e) => {
  window.location.href = window.location.href
})
// Check for title and desc length
submitProblemForm.addEventListener('submit', async (e) => {
  if (
    document.querySelector('#addTitle').value.length < 3 ||
    document.querySelector('#addTitle').value.length > 50
  ) {
    e.preventDefault()
    document.querySelector('#addProblemError').textContent =
      'Title should have between 3 and 50 characters'
  }

  if (
    document.querySelector('#addDesc').value.length < 30 ||
    document.querySelector('#addDesc').value.length > 2000
  ) {
    e.preventDefault()
    document.querySelector('#addProblemError').textContent =
      'Description should have between 30 and 2000 characters'
  }
})

//Begin search label highlights
document
  .querySelector('#searchLabelUsor')
  .addEventListener('click', async (e) => {
    document.querySelector('#searchLabelUsor').classList.add('text-green-500')
    document
      .querySelector('#searchLabelMediu')
      .classList.remove('text-green-500')
    document
      .querySelector('#searchLabelDificil')
      .classList.remove('text-green-500')
  })

document
  .querySelector('#searchLabelMediu')
  .addEventListener('click', async (e) => {
    document
      .querySelector('#searchLabelUsor')
      .classList.remove('text-green-500')
    document.querySelector('#searchLabelMediu').classList.add('text-green-500')
    document
      .querySelector('#searchLabelDificil')
      .classList.remove('text-green-500')
  })

document
  .querySelector('#searchLabelDificil')
  .addEventListener('click', async (e) => {
    document
      .querySelector('#searchLabelUsor')
      .classList.remove('text-green-500')
    document
      .querySelector('#searchLabelMediu')
      .classList.remove('text-green-500')
    document
      .querySelector('#searchLabelDificil')
      .classList.add('text-green-500')
  })

document
  .querySelector('#searchLabelAnaliza')
  .addEventListener('click', async (e) => {
    document
      .querySelector('#searchLabelAnaliza')
      .classList.add('text-green-500')
    document
      .querySelector('#searchLabelAlgebra')
      .classList.remove('text-green-500')
    document
      .querySelector('#searchLabelGeometrie')
      .classList.remove('text-green-500')
  })

document
  .querySelector('#searchLabelAlgebra')
  .addEventListener('click', async (e) => {
    document
      .querySelector('#searchLabelAnaliza')
      .classList.remove('text-green-500')
    document
      .querySelector('#searchLabelAlgebra')
      .classList.add('text-green-500')
    document
      .querySelector('#searchLabelGeometrie')
      .classList.remove('text-green-500')
  })

document
  .querySelector('#searchLabelGeometrie')
  .addEventListener('click', async (e) => {
    document
      .querySelector('#searchLabelAnaliza')
      .classList.remove('text-green-500')
    document
      .querySelector('#searchLabelAlgebra')
      .classList.remove('text-green-500')
    document
      .querySelector('#searchLabelGeometrie')
      .classList.add('text-green-500')
  })
//End search label highlights
//Begin add label highlights

document.querySelector('#addLabelUsor').addEventListener('click', async (e) => {
  document.querySelector('#addLabelUsor').classList.add('text-green-500')
  document.querySelector('#addLabelMediu').classList.remove('text-green-500')
  document.querySelector('#addLabelDificil').classList.remove('text-green-500')
})

document
  .querySelector('#addLabelMediu')
  .addEventListener('click', async (e) => {
    document.querySelector('#addLabelUsor').classList.remove('text-green-500')
    document.querySelector('#addLabelMediu').classList.add('text-green-500')
    document
      .querySelector('#addLabelDificil')
      .classList.remove('text-green-500')
  })

document
  .querySelector('#addLabelDificil')
  .addEventListener('click', async (e) => {
    document.querySelector('#addLabelUsor').classList.remove('text-green-500')
    document.querySelector('#addLabelMediu').classList.remove('text-green-500')
    document.querySelector('#addLabelDificil').classList.add('text-green-500')
  })

document
  .querySelector('#addLabelAnaliza')
  .addEventListener('click', async (e) => {
    document.querySelector('#addLabelAnaliza').classList.add('text-green-500')
    document
      .querySelector('#addLabelAlgebra')
      .classList.remove('text-green-500')
    document
      .querySelector('#addLabelGeometrie')
      .classList.remove('text-green-500')
  })

document
  .querySelector('#addLabelAlgebra')
  .addEventListener('click', async (e) => {
    document
      .querySelector('#addLabelAnaliza')
      .classList.remove('text-green-500')
    document.querySelector('#addLabelAlgebra').classList.add('text-green-500')
    document
      .querySelector('#addLabelGeometrie')
      .classList.remove('text-green-500')
  })

document
  .querySelector('#addLabelGeometrie')
  .addEventListener('click', async (e) => {
    document
      .querySelector('#addLabelAnaliza')
      .classList.remove('text-green-500')
    document
      .querySelector('#addLabelAlgebra')
      .classList.remove('text-green-500')
    document.querySelector('#addLabelGeometrie').classList.add('text-green-500')
  })
