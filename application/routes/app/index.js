const express = require('express')
const router = express.Router()
const { ensureLoggedIn } = require('connect-ensure-login')
const { updateUser, findUser } = require('../../db/user')
const zipcodes = require('zipcodes')

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Home', user: req.user })
})

router.get('/account', ensureLoggedIn('/signin'), async (req, res) => {
  let user = req.user
  let userData = await findUser('id', user.id)
  userData.location = zipcodes.lookup(user.zip)
  res.render('account', { title: 'Account', user, userData })
})

router.post('/account/update', ensureLoggedIn('/signin'), async (req, res) => {
  let selector = {
    attribute: 'id',
    value: req.user.id,
  }
  let mutator = {
    attribute: 'email',
    value: req.body.email,
  }
  let result = await updateUser(selector, mutator)
  res.redirect('/account')
})

module.exports = router
