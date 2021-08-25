const avatarForm = document.querySelector('#avatarForm')

fetch('/users/me/data')
  .then((response) => {
    response.json().then((data) => {
      console.log(data)
      if (data.avatar) {
        document.querySelector('#userPhoto2').src =
          'data:image/jpeg;base64,' + data.avatar

        document.querySelector('#userPhoto').src =
          'data:image/jpeg;base64,' + data.avatar
      } else {
        document.querySelector('#userPhoto2').src =
          '/img/avatar_placeholder.png'

        document.querySelector('#userPhoto').src = '/img/avatar_placeholder.png'
      }
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
      // Should be the same as doing it with a form, but keeping this for studying reasons
      method: 'POST',
      body: formData,
    })
      .then((data) => {
        if (data.status === 400) {
          throw new Error('File too large!')
        } else if (data.status !== 200) {
          console.log('Something wrong has happened!')
        } else {
          console.log('Succesfully uploaded!')
          setTimeout(() => {
            window.location.href = window.location.href
          }, 2000)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  })

// avatarForm.addEventListener('submit', async (e) => {
//   e.preventDefault()
//   console.log(new FormData(avatarForm))
//   fetch('/users/me/avatar', {
//     method: 'POST',
//     body: new FormData(avatarForm),
//   })
// })
