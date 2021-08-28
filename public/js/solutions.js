const searchText = document.querySelector('#searchText')
const searchButton = document.querySelector('#searchButton')
const navigateLeft = document.querySelector('#navigateLeft')
const navigateRight = document.querySelector('#navigateRight')
const skipValue = new URLSearchParams(window.location.search).get('skip')
const id = window.location.href.split('/')[4]
fetch(`/users/${id}/solutions/data` + window.location.search).then(
  (response) => {
    response
      .json()
      .then((data) => {
        let i = 1
        data.forEach((solution) => {
          let content = document.createElement('div')
          content.id = `solution${i}`
          content.className = 'mt-6 p-2 bg-white rounded-lg shadow'
          content.innerHTML = `<div class="flex flex-col bg-white p-2">
					<div class="inline-flex space-x-12">
						<a href="" class="flex font-light text-lg text-green-800 hover:text-green-500" id="link${i}">test</a>
						<div class="flex space-x-1.5">
							<div class="px-0.5 border border-transparent text-white font-light rounded" id="category${i}"></div>
							<div class="px-0.5 border border-transparent text-white font-light rounded" id="difficulty${i}"></div>
							<div class="px-0.5 hidden border border-transparent text-white bg-gray-400 font-light rounded" id="grade${i}"></div>
						</div>
					</div>
					<div class="flex"><p class="font-light" id="short${i}"></p></div>
        </div>`
          document.getElementById('solutionsDiv').appendChild(content)
          document
            .querySelector(`#link${i}`)
            .setAttribute(
              'href',
              `/problems/${solution.problemId + (id !== 'me' ? `/${id}` : '')}`
            )
          document.querySelector(`#link${i}`).textContent = solution.title
          document.querySelector(`#category${i}`).textContent =
            solution.category
          document.querySelector(`#difficulty${i}`).textContent =
            solution.difficulty
          document.querySelector(`#short${i}`).textContent = solution.solution
            ? solution.solution.slice(0, 100)
            : ''
          if (solution.category === 'Algebra') {
            document.querySelector(`#category${i}`).classList.add('bg-blue-400')
          } else if (solution.category === 'Analiza') {
            document.querySelector(`#category${i}`).classList.add('bg-red-400')
          } else {
            document.querySelector(`#category${i}`).classList.add('bg-pink-400')
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

          if (solution.grading[0]) {
            if (solution.grading[0].grade) {
              console.log(i)
              document.querySelector(`#grade${i}`).style.display = 'block'
              document.querySelector(`#grade${i}`).textContent =
                'Nota: ' + solution.grading[0].grade
            }
          }

          i++
        })

        if (data.length === 0) {
          document.querySelector('#errorMessage').textContent =
            'Nu s-au gasit solutii'
          document.querySelector('#errorMessage').style.display = 'block'
        }

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
        console.log(error)
        // document.querySelector('#errorMessage').textContent = error // 'Nu s-a gasit studentul'
        // document.querySelector('#errorMessage').style.display = 'block'
      })
  }
)

searchButton.addEventListener('click', async (e) => {
  e.preventDefault()
  const data = {
    search: searchText.value ? searchText.value : '',
    category: document.querySelector('input[name="category"]:checked')
      ? document.querySelector('input[name="category"]:checked').value
      : '',
    difficulty: document.querySelector('input[name="difficulty"]:checked')
      ? document.querySelector('input[name="difficulty"]:checked').value
      : '',
  }
  const searchParams = new URLSearchParams(data)
  window.location.href = `/users/${id}/solutions?` + searchParams.toString()
})

navigateRight.addEventListener('click', async (e) => {
  let urlParams = new URLSearchParams(window.location.search)
  let skipValue = parseInt(urlParams.get('skip'), 10)

  if (isNaN(skipValue)) {
    urlParams.set('skip', '10')
  } else {
    urlParams.set('skip', (skipValue + 10).toString())
  }

  window.location.href = `/users/${id}/solutions?` + urlParams.toString()
})

navigateLeft.addEventListener('click', async (e) => {
  let urlParams = new URLSearchParams(window.location.search)
  urlParams.set('skip', (parseInt(urlParams.get('skip'), 10) - 10).toString())
  window.location.href = `/users/${id}/solutions?` + urlParams.toString()
})
