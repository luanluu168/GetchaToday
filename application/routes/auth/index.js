const express = require('express')
const { registerUser } = require('../../db/user')
const router = express.Router()
const passport = require('../../config/auth')
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login')

router.get('/signin', ensureLoggedOut('/'), (req, res) => {
  res.render('signin', { title: 'Sign In' })
})

router.post('/signin', function (req, res, next) {
  passport.authenticate('local', function (error, user) {
    if (error) {
      return res.render('signin', { title: 'Sign In', error })
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err)
      }
      return res.redirect('/')
    })
  })(req, res, next)
})

router.get('/signup', ensureLoggedOut('/'), (req, res) => {
  res.render('signup', { title: 'Sign Up' })
})

router.post('/signup', async (req, res) => {
  let result = await registerUser(
    req.body.username,
    req.body.password,
    req.body.email,
    req.body.zip
  )
  if (result.error) {
    res.render('signup', { title: 'Sign Up', error: result.error })
  }
  res.redirect(307, '/signin')
})

router.get('/signout', ensureLoggedIn('/signin'), (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router
