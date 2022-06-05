const navbarToggler = document.getElementById('navbarToggler')
const menu = document.getElementById('menu')

navbarToggler.addEventListener('click', () => { menu.classList.toggle('active') })

const password = document.getElementById('password')
const passwordConfirm = document.getElementById('passwordConfirm')

const passwordChangeForm = document.getElementById('passwordChangeForm')

if (passwordChangeForm)
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

if (password)
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

if(passwordConfirm)
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

let tr
const result = document.getElementById('result')
if (result)
axios.get(`/search-post?page=1&limit=50`).then((res) => {
  result.innerHTML = ''
  res.data.docs.forEach((post, index) => {
    tr = document.createElement('tr')
    tr.innerHTML = `
      <th scope="row">${index + 1}</th>
      <td>${post.title}</td>
      <td>${post.date}</td>
    `
    tr.addEventListener('click', () => { window.location.href = post.handle })
    result.append(tr)
  })
}).catch(err => console.error(err))

const searchBar = document.getElementById('search-bar')
if (searchBar) {
  let search
  searchBar.addEventListener('input', async () => {
    try {
      search = searchBar.value.trim()
      const res = await axios.get(`/search-post?page=1&limit=20&ara=${search}`)
      result.innerHTML = ''
      res.data.docs.forEach((post, index) => {
        tr = document.createElement('tr')
        tr.innerHTML = `
        <th scope="row">${index + 1}</th>
        <td>${post.title}</td>
        <td>${post.date}</td>
        `
        tr.addEventListener('click', () => { window.location.href = post.handle })
        result.append(tr)
      })
    } catch (err) {
      console.error(err)
    }
  })
}