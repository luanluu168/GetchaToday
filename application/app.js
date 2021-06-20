const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const session = require('express-session')

const passport = require('./config/auth')

const appRouter = require('./routes/app')
const messagesRouter = require('./routes/messages')
const listingsRouter = require('./routes/listings')
const authRouter = require('./routes/auth')

const app = express()

app.set('views', [
  path.join(__dirname, 'views', 'pages'),
  path.join(__dirname, 'views', 'error'),
  path.join(__dirname, 'views', 'auth'),
])
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/api/images', express.static(process.env.STORAGE))

if (process.env.REDIS_PORT) {
  let RedisStore = require('connect-redis')(session)
  let redisClient = require('redis').createClient(process.env.REDIS_PORT)

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
    })
  )
} else {
  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
    })
  )
}

app.use(passport.initialize())
app.use(passport.session())

app.use('/', appRouter)
app.use('/', authRouter)
app.use('/listings/', listingsRouter)
app.use('/messages/', messagesRouter)

app.use(function (req, res, next) {
  next(createError(404))
})

app.use(function (err, req, res, next) {
  let error
  switch (err.status) {
    case 404:
      error = {
        status: 404,
        text: '404 File Not Found',
      }
      break
    default:
      error = {
        status: 500,
        text: '500 Internal Server Error',
      }
  }

  res.status(error.status)
  res.render('error', { title: error.status + ' Error', error })
})

module.exports = app
