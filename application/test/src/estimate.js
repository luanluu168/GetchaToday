const axios = require('axios')
const { parse } = require('node-html-parser')

let isAbsoluteURL = (url) => /^http/.test(url)

let estimate = async (url, root) => {
  let total = 0
  let res = await axios.get(url)
  total += res.data.length

  let html = parse(res.data)
  let scripts = html.querySelectorAll('script')
  let links = html.querySelectorAll('link')
  let urls = []

  for (let s of scripts) {
    urls.push(s.getAttribute('src'))
  }
  for (let l of links) {
    urls.push(l.getAttribute('href'))
  }
  urls = urls.map((u) => {
    if (!isAbsoluteURL(u)) {
      return root + u
    }
    return u
  })

  for (let u of urls) {
    let res = await axios.get(u)
    total += res.data.length
  }
  return total
}

module.exports = {
  estimate,
}
