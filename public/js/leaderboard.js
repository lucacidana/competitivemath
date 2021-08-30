const myStudentsButton = document.querySelector('#myStudentsButton')
const searchButton = document.querySelector('#searchButton')
const searchEmail = document.querySelector('#searchEmail')
const errorMessage = document.querySelector('#errorMessage')
const navigateLeft = document.querySelector('#navigateLeft')
const navigateRight = document.querySelector('#navigateRight')
const oldParams = new URLSearchParams(window.location.search)
const params = new URLSearchParams()

if (window.location.href.includes('?')) {
  const URL = `/users/leaderboard/data?${oldParams.toString()}`
  const skipValue = oldParams.get('skip')
  fetch(URL).then((response) =>
    response.json().then((data) => {
      console.log(data)
      let i = 1
      data.forEach((user) => {
        let content = document.createElement('div')
        content.id = `userDiv${i}`
        content.className = 'flex p-2 bg-green-50 rounded-lg'
        content.innerHTML = `
        	<div class="flex w-full bg-white px-1.5 justify-between space-x-10 shadow border border-transparent rounded-lg">
            <a class="text-green-700 hover:text-green-500 text-lg" href="" id="user${i}"></a>
            <p class="text-green-700" id="rankingPos${i}"></p>
					</div>
  `
        document.getElementById('contentDiv').appendChild(content)

        document
          .querySelector(`#user${i}`)
          .setAttribute('href', `/users/${user._id}`)
        document.querySelector(`#user${i}`).textContent = user.name
        document.querySelector(
          `#rankingPos${i}`
        ).textContent = `Punctaj total: ${user.ranking}`
        i++
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
  )
}

if (oldParams.has('myStudents')) {
  params.append('myStudents', '')
  document.querySelector('#myStudentsCheck').checked = true
  myStudentsButton.classList.replace('text-green-600', 'text-green-800')
  myStudentsButton.classList.replace('bg-white', 'bg-green-300')
  myStudentsButton.classList.remove('hover:bg-green-100')
}

if (myStudentsButton) {
  myStudentsButton.addEventListener('click', async (e) => {
    e.preventDefault()
    if (!document.querySelector('#myStudentsCheck').checked) {
      document.querySelector('#myStudentsCheck').checked = true
      myStudentsButton.classList.replace('text-green-600', 'text-green-800')
      myStudentsButton.classList.replace('bg-white', 'bg-green-300')
      myStudentsButton.classList.remove('hover:bg-green-100')
      params.append('myStudents', '')
    } else {
      document.querySelector('#myStudentsCheck').checked = false
      myStudentsButton.classList.replace('text-green-800', 'text-green-600')
      myStudentsButton.classList.replace('bg-green-300', 'bg-white')
      myStudentsButton.classList.add('hover:bg-green-100')
      params.delete('myStudents')
    }
  })
}

searchButton.addEventListener('click', async (e) => {
  const re =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

  if (searchEmail.value && !re.test(searchEmail.value)) {
    errorMessage.textContent = 'Email invalid!'
  } else {
    params.append('email', searchEmail.value)
    window.location.href =
      '//' + location.host + location.pathname + `?${params.toString()}`
  }
})

navigateRight.addEventListener('click', async (e) => {
  let skipValue = parseInt(oldParams.get('skip'), 10)

  if (isNaN(skipValue) || skipValue < 0) {
    params.set('skip', '10')
  } else {
    params.set('skip', (skipValue + 10).toString())
  }

  window.location.href =
    '//' + location.host + location.pathname + `?${params.toString()}`
})

// Add logic to navigateLeft, basically add 10 to the skip query
navigateLeft.addEventListener('click', async (e) => {
  params.set('skip', (parseInt(oldParams.get('skip'), 10) - 10).toString())
  window.location.href =
    '//' + location.host + location.pathname + `?${params.toString()}`
})
