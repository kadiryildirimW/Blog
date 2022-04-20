function previewPhoto(file, tag) {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    tag.style.backgroundImage = 'url(' + reader.result + ')'
  };
  reader.onerror = function (error) {
    console.log('Error: ', error);
  };
}

function openModal () {
  document.getElementById('overlay').style.display = 'block'
  document.getElementById('modal').style.display = 'block'
}

function closeModal () {
  document.getElementById('overlay').style.display = 'none'
  document.getElementById('modal').style.display = 'none'
}

const title = document.getElementById('title')
const subtitle = document.getElementById('subtitle')
const masthead = document.getElementById('masthead')
const contactDescription = document.getElementById('contactDescription')

const titleInput = document.getElementById('titleInput')
const subtitleInput = document.getElementById('subtitleInput')
const backgroundInput = document.getElementById('backgroundInput')
const contactDescriptionInput = document.getElementById('contactDescriptionInput')

let titleValue, subtitleValue, backgroundValue, oldBackgroundPath, contactDescriptionValue

if (title && titleInput) {
  titleInput.addEventListener('input', () => { 
    if (titleInput.value.trim() === '') {
      titleValue = ' '
      title.innerHTML = '&nbsp;'
    } else {
      titleValue = titleInput.value.trim()
      title.innerText = titleInput.value.trim() 
    }
  })
}
if (subtitle && subtitleInput) {
  subtitleInput.addEventListener('input', () => { 
    if (subtitleInput.value.trim() === '') {
      subtitleValue = ' '
      subtitle.innerHTML = '&nbsp;'
    } else {
      subtitleValue = subtitleInput.value.trim()
      subtitle.innerText = subtitleInput.value.trim()
    }
  })
}
if (backgroundInput && masthead) {
  oldBackgroundPath = masthead.style.backgroundImage.match(/(?<=url\("backgroundImages\/)(.*?)(?="\))/g)
  oldBackgroundPath = oldBackgroundPath ? oldBackgroundPath[0] : undefined
  backgroundInput.addEventListener('change', () => {
    if (backgroundInput.files[0]) {
      backgroundValue = backgroundInput.files[0]
      previewPhoto(backgroundInput.files[0], masthead)
    }
  })
}
if (contactDescription && contactDescriptionInput) {
  contactDescriptionInput.addEventListener('input', () => {
    if (contactDescriptionInput.value.trim() === '') {
      contactDescriptionValue = ' '
      contactDescription.innerHTML = '&nbsp;'
    } else {
      contactDescriptionValue = contactDescriptionInput.value.trim()
      contactDescription.innerText = contactDescriptionInput.value.trim()
    }
  })
}
let editorTag = document.getElementById('editor')
if (editorTag) {
  let editor = new FroalaEditor('#editor', {
    fontFamily: {
      "Roboto,sans-serif": 'Roboto',
      "Oswald,sans-serif": 'Oswald',
      "Montserrat,sans-serif": 'Montserrat',
      "'Open Sans Condensed',sans-serif": 'Open Sans Condensed'
    },
    fontFamilySelection: true,
    imageManagerLoadURL: '/resimler',
    imageManagerLoadMethod: 'GET',
    imageUploadURL: '/resim-kaydet',
    imageUploadMethod: 'POST',
    imageAllowedTypes: ['jpeg', 'jpg', 'png'],
    saveURL: advancedForm.getAttribute('action') ? advancedForm.getAttribute('action') : window.location.href ,
    saveMethod: 'POST',
    saveParam: 'content',
    saveParams: {},
    saveInterval: 2000,
    events: { 
      'image.removed': function ($img) {}  
    }
  }, function () {
    editor.html.set(editorTag.getAttribute('html'))
    editorTag.removeAttribute('html')
    const advancedForm = document.getElementById('advancedForm')
    if (advancedForm) {
      advancedForm.addEventListener('submit', (event) => {
        event.preventDefault()
        openModal()
        const formData = new FormData()
        if (titleValue) formData.append('title', titleValue)
        if (subtitleValue) formData.append('subtitle', subtitleValue)
        const contentValue = editor.html.get()
        if (typeof contentValue === 'string') formData.append('content', contentValue ? contentValue : ' ' )
        if (backgroundValue) {
          formData.append('background', backgroundValue)
          if (oldBackgroundPath) {
            formData.append('oldBackgroundPath', oldBackgroundPath)
          }
        }
        axios.post(window.location.href, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: progressEvent => {
            processRate.innerText = `${Math.floor(progressEvent.loaded / progressEvent.total * 100)} %`
          }
        })
        .then(response => {
          if (advancedForm.classList.contains('post-form')) {
            window.location.href = `/${response.data}`
          } else {
            window.location.href = advancedForm.getAttribute('redirect')
          } 
        })
        .catch(err => { console.error(err) })
      })
    }
  })
  if (titleInput) titleInput.addEventListener('input', () => { editor.opts.saveParams.title = titleValue })
  if (subtitleInput) subtitleInput.addEventListener('input', () => { editor.opts.saveParams.subtitle = subtitleValue })
}

const processScreen = document.getElementById('processScreen')
const processRate = document.getElementById('processRate')

const form = document.getElementById('form')
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    openModal()
    const formData = new FormData()
    if (titleValue) formData.append('title', titleValue)
    if (subtitleValue) formData.append('subtitle', subtitleValue)
    if (backgroundValue) formData.append('background', backgroundValue)
    if (contactDescriptionValue) formData.append('contactDescription', contactDescriptionValue)
    
    axios.post(form.getAttribute('action'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressEvent => {
        processRate.innerText = `${Math.floor(progressEvent.loaded / progressEvent.total * 100)} %`
      }
    })
    .then(response => {
      if (response.status === 200) {
        if (form.getAttribute('redirect')) {
          window.location.href = form.getAttribute('redirect')
        } else {
          window.location.reload()
        }
      }
    })
    .catch(err => { console.error(err) })
  })
}
