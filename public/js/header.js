if (window.location.pathname.includes('problems')) {
  document.querySelector('#problemsHeading').classList.add('text-green-50')
} else {
  document.querySelector('#problemsHeading').classList.add('text-green-900')
}

if (document.querySelector('#studentHeader')) {
  if (window.location.pathname.includes('users/me/students')) {
    document.querySelector('#studentHeader').classList.add('text-green-50')
  } else {
    document.querySelector('#studentHeader').classList.add('text-green-900')
  }
}

if (window.location.pathname === '/users/me') {
  document.querySelector('#profileHeading').classList.add('text-green-50')
} else {
  document.querySelector('#profileHeading').classList.add('text-green-900')
}

if (window.location.pathname.includes('/users/me/solutions')) {
  document.querySelector('#solutionsHeading').classList.add('text-green-50')
} else {
  document.querySelector('#solutionsHeading').classList.add('text-green-900')
}

document.querySelector('#logoutButton').addEventListener('click', async (e) => {
  fetch('/users/logout', {
    method: 'POST',
  }).then(() => {
    window.location.href = '/'
  })
})
