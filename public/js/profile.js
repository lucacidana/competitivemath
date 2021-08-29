const avatarForm = document.querySelector('#avatarForm')
const errorMessage = document.querySelector('#errorMessage')
const id = window.location.href.split('/')[4]
const fetchURL = '/users/' + id + '/data'

fetch(fetchURL)
  .then((response) => {
    if (response.status === 404) {
      document.querySelector('#userName').textContent = 'Nu s-a gasit studentul'
    }
    response
      .json()
      .then((data) => {
        const { user, problems, completedProblems } = data
        let i = 1

        if (!problems) {
          // If we are a student, we should only see recent solutions
          document.querySelector('#feedHeading').textContent = 'Solutii recente'
          user.solvedProblems.forEach((solution) => {
            let content = document.createElement('div')
            content.id = `solution${i}`
            content.className = 'mt-6 p-2 bg-white rounded-lg shadow'
            content.innerHTML = `
	<!--Structure of a problem entry-->
	<a href="" class="font-light text-lg text-green-800 hover:text-green-500" id="link${i}"></a>
	<span class="float-right space-x-1">
		 <!--Example of float in div, inline items with span, spacing within child elems-->
		 <span class="p-0.5 border border-transparent text-white font-light rounded" id="category${i}"></span>
		 <span class="p-0.5 border border-transparent text-white font-light rounded" id="difficulty${i}"></span>
		 <span class="hidden p-0.5 border border-transparent text-white bg-gray-400 font-light rounded" id="grade${i}"></span>
	</span>
	`
            document.getElementById('solutionFeed').appendChild(content)

            document
              .querySelector(`#link${i}`)
              .setAttribute(
                'href',
                `/problems/${
                  solution.problemId + (id !== 'me' ? `/${id}` : '')
                }`
              )
            document.querySelector(`#link${i}`).textContent = solution.title
            document.querySelector(`#category${i}`).textContent =
              solution.category
            document.querySelector(`#difficulty${i}`).textContent =
              solution.difficulty
            if (solution.grading[0]) {
              if (solution.grading[0].grade) {
                document.querySelector(`#grade${i}`).textContent =
                  'Nota: ' + solution.grading[0].grade
                document.querySelector(`#grade${i}`).style.display = 'inline'
              }
            }
            if (solution.category === 'Algebra') {
              document
                .querySelector(`#category${i}`)
                .classList.add('bg-blue-400')
            } else if (solution.category === 'Analiza') {
              document
                .querySelector(`#category${i}`)
                .classList.add('bg-red-400')
            } else {
              document
                .querySelector(`#category${i}`)
                .classList.add('bg-pink-400')
            }

            if (solution.difficulty === 'Usor') {
              document
                .querySelector(`#difficulty${i}`)
                .classList.add('bg-green-400')
            } else if (solution.difficulty === 'Mediu') {
              document
                .querySelector(`#difficulty${i}`)
                .classList.add('bg-green-500')
            } else {
              document
                .querySelector(`#difficulty${i}`)
                .classList.add('bg-green-600')
            }

            if (solution.grading) {
              if (solution.grading.grade) {
                document.querySelector(`grade${i}`).style.display = 'block'
              }
            }

            i++
          })
        } else {
          document.querySelector('#feedHeading').textContent =
            'Probleme recente'
          problems.forEach((problem) => {
            let content = document.createElement('div')
            content.id = `problem${i}`
            content.className = 'mt-6 p-2 bg-white rounded-lg shadow'
            content.innerHTML = `
	<!--Structure of a problem entry-->
	<a href="" class="font-light text-lg text-green-800 hover:text-green-500" id="link${i}"></a>
	<span class="float-right space-x-1">
		 <!--Example of float in div, inline items with span, spacing within child elems-->
		 <p class="inline font-light truncate mr-6" id="short${i}"></p>
		 <span class="p-0.5 border border-transparent text-white font-light rounded" id="category${i}"></span>
		 <span class="p-0.5 border border-transparent text-white font-light rounded" id="difficulty${i}"></span>
	</span>
	`
            document.getElementById('solutionFeed').appendChild(content)

            document
              .querySelector(`#link${i}`)
              .setAttribute('href', `/problems/${problem._id}`)
            document.querySelector(`#link${i}`).textContent = problem.title
            document.querySelector(`#category${i}`).textContent =
              problem.category
            document.querySelector(`#difficulty${i}`).textContent =
              problem.difficulty
            document.querySelector(`#short${i}`).textContent =
              problem.description.slice(0, 50) + '...'

            if (problem.category === 'Algebra') {
              document
                .querySelector(`#category${i}`)
                .classList.add('bg-blue-400')
            } else if (problem.category === 'Analiza') {
              document
                .querySelector(`#category${i}`)
                .classList.add('bg-red-400')
            } else {
              document
                .querySelector(`#category${i}`)
                .classList.add('bg-pink-400')
            }

            if (problem.difficulty === 'Usor') {
              document
                .querySelector(`#difficulty${i}`)
                .classList.add('bg-green-400')
            } else if (problem.difficulty === 'Mediu') {
              document
                .querySelector(`#difficulty${i}`)
                .classList.add('bg-green-500')
            } else {
              document
                .querySelector(`#difficulty${i}`)
                .classList.add('bg-green-600')
            }
            i++
          })
        }

        if (user.avatar) {
          document.querySelector('#userPhoto2').src =
            'data:image/jpeg;base64,' + user.avatar

          document.querySelector('#userPhoto').src =
            'data:image/jpeg;base64,' + user.avatar
        } else {
          document.querySelector('#userPhoto2').src =
            '/img/avatar_placeholder.png'

          document.querySelector('#userPhoto').src =
            '/img/avatar_placeholder.png'
        }

        document.querySelector('#userName').textContent = user.name
        document.querySelector('#userEmail').textContent = user.email
        document.querySelector('#completedProblems').textContent =
          'Probleme rezolvate: ' + completedProblems
        document
          .querySelector('#completedProblems')
          .setAttribute(
            'href',
            `/users/${window.location.href.split('/')[4]}/solutions`
          )

        if (user.isProfessor) {
          document.querySelector('#userDiv').classList.add('ring-2')
        }
      })
      .catch((error) => {
        console.log(error)
      })
  })
  .catch((error) => {
    console.log(error)
  })

document.querySelector('#modalBg').addEventListener('click', async (e) => {
  e.preventDefault()
  document.querySelector('#modalBg').style.display = 'none'
  document.querySelector('#modalForm').style.display = 'none'
})

document.querySelector('#editUser').addEventListener('click', async (e) => {
  document.querySelector('#modalBg').style.display = 'flex'
  document.querySelector('#modalForm').style.display = 'flex'
})

document.querySelector('#submitForm').addEventListener('click', async (e) => {
  if (
    document.querySelector('#modifyPassword').value !==
    document.querySelector('#modifyPasswordConfirm').value
  ) {
    e.preventDefault()
    document.querySelector('#passwordError').textContent = 'Parolele nu coincid'
  } else if (
    !document.querySelector('#modifyEmail').value &&
    !document.querySelector('#modifyPasswordConfirm').value &&
    !document.querySelector('#modifyPassword').value
  ) {
    e.preventDefault()
    document.querySelector('#passwordError').textContent = 'Introduceti datele'
  }
})

document.querySelector('#cancelForm').addEventListener('click', async (e) => {
  e.preventDefault()
  window.location.href = window.location.href
})

document
  .querySelector('#uploadPhotoButton')
  .addEventListener('click', async (e) => {
    e.preventDefault()
    document.querySelector('#uploadPhotoSelector').click()
  })

document
  .querySelector('#uploadPhotoSelector')
  .addEventListener('input', async (e) => {
    const formData = new FormData()
    formData.append(
      'avatar',
      document.querySelector('#uploadPhotoSelector').files[0]
    )

    fetch('/users/me/avatar', {
      // POST FILE
      // Should be the same as doing it with a form, but keeping this for studying reasons
      method: 'POST',
      body: formData,
    })
      .then((data) => {
        if (data.status === 400) {
          throw new Error('File too large!')
        } else if (data.status !== 200) {
          errorMessage.style.display = 'inline'
          errorMessage.textContent = 'S-a produs o eroare!'
        } else {
          errorMessage.style.display = 'inline'
          errorMessage.classList.remove('text-red-900')
          errorMessage.classList.add('text-green-900')
          errorMessage.textContent = 'Poza uploadata cu succes!'
          setTimeout(() => {
            window.location.href = window.location.href
          }, 2000)
        }
      })
      .catch((error) => {
        errorMessage.style.display = 'inline'
        errorMessage.textContent = 'Poza selectata trebuie sa fie < 1mb'
      })
  })
