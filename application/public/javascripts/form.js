'use strict'

const formAuth = document.getElementById('form-auth')
const validationAlert = document.getElementById('validation-alert')
const validationError = document.getElementById('validation-error')
const inputUsername = document.getElementById('input-username')
const inputPassword = document.getElementById('input-password')
const inputPasswordMatch = document.getElementById('input-password-match')
const inputEmail = document.getElementById('input-email')
const inputZip = document.getElementById('input-zip')

let isValidUSZip = (zip) => /^\d{5}(-\d{4})?$/.test(zip)
let isLegalUsername = (word) => /^[a-zA-Z0-9\-_]{4,64}$/.test(word)
let isLegalPassword = (word) => /^[a-zA-Z0-9\-_]{8,64}$/.test(word)

formAuth.addEventListener('submit', (event) => {
  let preventDefault = false

  validationAlert.style.display = 'none'
  validationError ? (validationError.style.display = 'none') : null
  validationAlert.innerHTML = ''

  if (!isLegalUsername(inputUsername.value)) {
    preventDefault = true
    validationAlert.style.display = 'block'
    validationAlert.innerHTML +=
      'Username should be 4 alphanumeric chars or longer! '
  }

  if (!isLegalPassword(inputPassword.value)) {
    preventDefault = true
    validationAlert.style.display = 'block'
    validationAlert.innerHTML +=
      'Password should be 8 alphanumeric chars or longer! '
  }

  if (inputPasswordMatch && inputPassword.value !== inputPasswordMatch.value) {
    preventDefault = true
    validationAlert.style.display = 'block'
    validationAlert.innerHTML += `Passwords don't match! `
  }

  if (
    inputEmail &&
    (!inputEmail.value.includes('@') ||
      inputEmail.value.replace('@', '').length < 2)
  ) {
    preventDefault = true
    validationAlert.style.display = 'block'
    validationAlert.innerHTML += `Invalid email! `
  }

  if (inputZip && !isValidUSZip(inputZip.value)) {
    preventDefault = true
    validationAlert.style.display = 'block'
    validationAlert.innerHTML += `Invalid zip code!`
  }

  preventDefault ? event.preventDefault() : null
})
