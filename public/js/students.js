const studentHeading = document.querySelector('#studentHeading')
const navigateRight = document.querySelector('#navigateRight')
const navigateLeft = document.querySelector('#navigateLeft')

document
  .querySelector('#searchStudent')
  .addEventListener('keyup', async (e) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      // Insert logic
      let name = document.querySelector('#searchStudent').value
      window.location.href = '/users/me/students?name=' + name
      // search by name, use fetch and populate divs
    }
  })

document
  .querySelector('#searchStudentButton')
  .addEventListener('click', async (e) => {
    e.preventDefault()
    // Insert logic
    let name = document.querySelector('#searchStudent').value
    window.location.href = '/users/me/students?name=' + name
    // search by name, use fetch and populate divs
  })

document
  .querySelector('#addStudentButton')
  .addEventListener('click', async (e) => {
    e.preventDefault()
    document.querySelector('#addStudentModal').style.display = 'block'
    document.querySelector('#addStudentForm').style.display = 'flex'
    // add student by email, refresh page with results
  })

document
  .querySelector('#cancelAddStudent')
  .addEventListener('click', async (e) => {
    e.preventDefault()
    window.location.href = window.location.href
  })

document
  .querySelector('#addStudentModal')
  .addEventListener('click', async (e) => {
    e.preventDefault()
    window.location.href = window.location.href
  })

document
  .querySelector('#addStudentForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault()
    let email = document.querySelector('#addStudentEmail').value
    if (email.length < 1) {
      document.querySelector('#addStudentError').textContent =
        'Please introduce a valid email'
    }
  })

navigateRight.addEventListener('click', async (e) => {
  let urlParams = new URLSearchParams(window.location.search)
  let skipValue = parseInt(urlParams.get('skip'), 10)

  if (isNaN(skipValue)) {
    urlParams.set('skip', '10')
  } else {
    urlParams.set('skip', (skipValue + 10).toString())
  }

  window.location.href = '/users/me/students?' + urlParams.toString()
})

navigateLeft.addEventListener('click', async (e) => {
  let urlParams = new URLSearchParams(window.location.search)
  urlParams.set('skip', (parseInt(urlParams.get('skip'), 10) - 10).toString())
  window.location.href = '/users/me/students?' + urlParams.toString()
})

if (window.location.href.includes('?name=')) {
  let URL =
    'http://localhost:3000/users/me/studentList' +
    window.location.href.slice(window.location.href.indexOf('?'))
  let urlParams = new URLSearchParams(window.location.search)
  let skipValue = urlParams.get('skip')

  fetch(URL).then((response) => {
    document.querySelector('#studentDiv').style.display = 'block' // Display list div
    response
      .json()
      .then((data) => {
        let i = 1
        data.forEach((value) => {
          document
            .querySelector(`#link${i}`)
            .setAttribute('href', `/users/${value._id}`)
          document
            .querySelector(`#delete${i}`)
            .setAttribute('href', `/users/me/students/delete/${value._id}`)
          document.querySelector(`#link${i}`).textContent = value.name
          document.querySelector(`#email${i}`).textContent = value.email
          document.querySelector(`#student${i}`).style.display = 'block' // Display list element
          if (
            document.querySelector(`#studentRow${Math.trunc((i + 6) / 6)}`)
              .style.display != 'flex'
          ) {
            document.querySelector(
              `#studentRow${Math.trunc((i + 6) / 6)}`
            ).style.display = 'flex'
          }
          i = ++i
        })
        studentHeading.textContent = 'Student list'

        if (i === 37 && skipValue < 36) {
          navigateRight.style.display = 'block'
        } else if (i === 37 && skipValue >= 36) {
          navigateLeft.style.display = 'block'
          navigateRight.style.display = 'block'
        } else if (i !== 37 && skipValue >= 36) {
          navigateLeft.style.display = 'block'
        }
      })
      .catch((error) => {
        document.querySelector('#studentImage').style.display = 'none'
        studentHeading.textContent = 'No students were found!'
      })
  })
}
