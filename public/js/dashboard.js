const navbarToggler = document.getElementById('navbarToggler')
const menu = document.getElementById('menu')

navbarToggler.addEventListener('click', () => { menu.classList.toggle('active') })

const password = document.getElementById('password')
const passwordConfirm = document.getElementById('passwordConfirm')

const passwordChangeForm = document.getElementById('passwordChangeForm')

passwordChangeForm.addEventListener('submit', (event) => {
  passwordChangeForm.classList.add('was-submitted')
  if (password.value.length < 8) {
    event.preventDefault()
    password.classList.add('is-invalid')
  }
  if (!passwordConfirm.value) {
    event.preventDefault()
    passwordConfirm.classList.add('is-invalid')
  }
  if (password.value !== passwordConfirm.value || passwordConfirm.value.trim() === '') {
    event.preventDefault()
    passwordConfirm.classList.add('is-invalid')
  }
})

password.addEventListener('input', () => {
  if (!passwordChangeForm.classList.contains('was-submitted')) return
  if (password.value.length < 8) {
    password.classList.add('is-invalid')
    password.classList.remove('is-valid')
  } else {
    password.classList.add('is-valid')
    password.classList.remove('is-invalid')
  }
  if (!passwordConfirm.value) {
    passwordConfirm.classList.add('is-invalid')
    passwordConfirm.classList.remove('is-valid')
  } else {
    passwordConfirm.classList.add('is-valid')
    passwordConfirm.classList.remove('is-invalid')
  }
  if (password.value !== passwordConfirm.value || passwordConfirm.value.trim() === '') {
    passwordConfirm.classList.add('is-invalid')
    passwordConfirm.classList.remove('is-valid')
  } else {
    passwordConfirm.classList.add('is-valid')
    passwordConfirm.classList.remove('is-invalid')
  }
})

passwordConfirm.addEventListener('input', () => {
  if (!passwordChangeForm.classList.contains('was-submitted')) return
  if (!passwordConfirm.value) {
    passwordConfirm.classList.add('is-invalid')
    passwordConfirm.classList.remove('is-valid')
  } else {
    passwordConfirm.classList.add('is-valid')
    passwordConfirm.classList.remove('is-invalid')
  }
  if (password.value !== passwordConfirm.value || passwordConfirm.value.trim() === '') {
    passwordConfirm.classList.add('is-invalid')
    passwordConfirm.classList.remove('is-valid')
  } else {
    passwordConfirm.classList.add('is-valid')
    passwordConfirm.classList.remove('is-invalid')
  }
})