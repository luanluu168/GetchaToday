const assert = require('assert')
const { estimate } = require('./src/estimate')


describe('Tests', function () {
  describe('Pages Size Test', async function () {
    this.timeout(30000)
    const MAX_SIZE = 2e6
    const ROOT_URL = 'http://localhost:3000'
    const PAGES = ['', '/listings/search', '/signin', '/signup']
    for (let page of PAGES) {
      it(`Testing ${page}. Size should be smaller than ${MAX_SIZE/10e5} mbytes`, async function () {      
        let size = await estimate(ROOT_URL + page, ROOT_URL)
        let pass = size < MAX_SIZE ? true : false
        assert.equal(pass, true)
      })
    }
  })
})
