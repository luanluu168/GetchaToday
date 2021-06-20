let isAlphaNumeric = (data) => /^[a-z\d\-_\s]+$/i.test(data)
let formSearch = document.getElementById('formSearch')
let textSearch = document.getElementById('filterInput')

let constructWarning = (str) =>
  ` Illegal search characters: ${str
    .split('')
    .filter((x) => !isAlphaNumeric(x))
    .filter((v, i, a) => a.indexOf(v) === i)
    .toString()}`

if (formSearch) {
  let warningSearch = document.getElementById('filterWarning')
  formSearch.addEventListener('submit', (event) => {
    if (textSearch.value && !isAlphaNumeric(textSearch.value)) {
      warningSearch.innerHTML = constructWarning(textSearch.value)
      setTimeout(() => (warningSearch.innerHTML = ''), 4000)

      event.preventDefault()
    }
  })
}
