const contactForm = document.getElementById('contactForm')
contactForm.addEventListener('keydown', (event) => { 
  if (event.key === 'Enter') {
    event.preventDefault()
  }
})
const submitButton = document.getElementById('submitButton')
submitButton.addEventListener('click', () => { contactForm.submit() })