const signUpForm = document.querySelector('form')
const password1 = document.querySelector('#password1')
const password2 = document.querySelector('#password2')
const error = document.querySelector('#errorMessage')

signUpForm.addEventListener('submit', (e) => {
  if (password1.value !== password2.value) {
    e.preventDefault()
    error.textContent = 'Parolele nu coincid!'
  }
})

document
  .querySelector('#professorLabel')
  .addEventListener('click', async (e) => {
    document.querySelector('#professorLabel').classList.add('text-green-500')
    document.querySelector('#studentLabel').classList.remove('text-green-500')
  })

document.querySelector('#studentLabel').addEventListener('click', async (e) => {
  document.querySelector('#professorLabel').classList.remove('text-green-500')
  document.querySelector('#studentLabel').classList.add('text-green-500')
})
