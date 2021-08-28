document
  .querySelector('#forgotPassword')
  .addEventListener('click', async (e) => {
    e.preventDefault()
    document.querySelector('#forgotPasswordModal').style.display = 'flex'
    document.querySelector('#forgotPasswordForm').style.display = 'flex'
  })

document
  .querySelector('#forgotPasswordModal')
  .addEventListener('click', async (e) => {
    document.querySelector('#forgotPasswordModal').style.display = 'none'
    document.querySelector('#forgotPasswordForm').style.display = 'none'
    window.location.href = '/users/login'
  })

document
  .querySelector('#submitRecoverPassword')
  .addEventListener('click', async (e) => {
    let password1 = document.querySelector('#password1').value
    let password2 = document.querySelector('#password2').value
    if (password1 !== password2) {
      e.preventDefault()
      document.querySelector('#recoveryError').textContent =
        'Parolele nu potrivesc!'
    } else if (password1.length < 6 || password1.includes('password')) {
      document.querySelector('#recoveryError').textContent = 'Parola invalida!'
    } else {
      //fetch
      fetch('/recover', {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: document.querySelector('#recoveryEmail').value,
          password: password1,
        }),
      })
        .then((response) => {
          if (response.status === 400) {
            throw new Error('Email invalid')
          } else if (response.status === 304) {
            throw new Error('Parola noua trebuie sa fie diferita de cea veche')
          } else {
            response.json().then((data) => {
              document
                .querySelector('#recoveryError')
                .classList.replace('text-red-500', 'text-green-500')
              document.querySelector('#recoveryError').textContent =
                data.message
              setTimeout(() => {
                window.location.href = '/users/login'
              }, 3000)
            })
          }
        })
        .catch((error) => {
          console.log(error)
        })
    }
  })

document
  .querySelector('#recoverPasswordForm')
  .addEventListener('keyup', async (e) => {
    e.preventDefault()
    if (e.keyCode === 13) {
      document.querySelector('#submitRecoverPassword').click()
    }
  })

document.querySelector('#logoutButton').addEventListener('click', async (e) => {
  fetch('/users/logout', {
    method: 'POST',
  }).then(() => {
    window.location.href = '/users/login'
  })
})

document
  .querySelector('#cancelLogoutButton')
  .addEventListener('click', async (e) => {
    e.preventDefault()
    window.location.href = '/users/me'
  })
