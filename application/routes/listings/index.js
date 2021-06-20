const express = require('express')
const router = express.Router()
const { ensureLoggedIn } = require('connect-ensure-login')
const fileUpload = require('express-fileupload')
const createError = require('http-errors')
const crypto = require('crypto')
const {
  addItem,
  getItems,
  getItemsFiltered,
  editItem,
  constructQuery,
  runRawQuery,
  deleteItem,
} = require('../../db/item')
const zipcodes = require('zipcodes')
const jimp = require('jimp')

router.use(fileUpload())

router.get('/search', async function (req, res, next) {
  let listings = await getItems()
  let user = req.user

  if (user) {
    listings = listings.filter((listing) => listing.seller_id !== user.id)
  }

  listings.map((l) => (l.location = zipcodes.lookup(l.zip)))

  let filters = {
    filter: '',
  }

  res.render('listings', { title: 'Listings', user, listings, filters })
})

router.get('/selling', ensureLoggedIn('/signin'), async function (
  req,
  res,
  next
) {
  let user = req.user
  let listings = await getItemsFiltered('seller_id', user.id)
  res.render('selling', { title: 'Selling', user, listings })
})

router.post('/search', async function (req, res, next) {
  let query = constructQuery(req.body)

  let listings = await runRawQuery(query)
  let user = req.user

  if (user) {
    listings = listings.filter((listing) => listing.seller_id !== user.id)
  }
  listings.map((l) => (l.location = zipcodes.lookup(l.zip)))
  res.render('listings', {
    title: 'Listings',
    user,
    listings,
    filters: req.body,
  })
})

router.get('/new', ensureLoggedIn('/signin'), (req, res) => {
  res.render('listing_new', { title: 'New Listing', user: req.user })
})

router.get('/edit/:id', ensureLoggedIn('/signin'), async function (
  req,
  res,
  next
) {
  let listing = await getItemsFiltered('item_table.id', req.params.id, 0, 1)
  listing = listing.length === 1 ? listing[0] : undefined
  res.render('listing_edit', {
    title: 'Listing',
    user: req.user,
    listing: listing,
  })
})

router.post('/edit/:id', ensureLoggedIn('/signin'), async (req, res, next) => {
  if (req.files && Object.keys(req.files).length !== 0) {
    let imageFile = req.files.image
    let extension = getFileExtension(imageFile.name)

    if (!validateExtension(extension)) {
      res.redirect(`/edit/${req.params.id}?error=file_not_supported`)
    } else if (!validateSize(imageFile.size)) {
      res.redirect(`/edit/${req.params.id}?error=file_limit_exceeded`)
    } else {
      let fileName = `${getFileTimestamp(req.user.username)}${extension}`
      let filePath = `${process.env.STORAGE}/${fileName}`
      imageFile.mv(filePath, function (err) {
        if (err) {
          return next(createError(500))
        } else {
          jimp.read(filePath, async (err, uploadedFile) => {
            if (err) {
              return next(createError(500))
            } else {
              uploadedFile.resize(jimp.AUTO, 500).quality(60).write(filePath)

              let result = await editItem(
                req.params.id,
                req.body.title,
                req.body.description,
                req.body.price,
                fileName
              )
              res.redirect(`/listings/${req.params.id}`)
            }
          })
        }
      })
    }
  } else {
    let result = await editItem(
      req.params.id,
      req.body.title,
      req.body.description,
      req.body.price
    )
    res.redirect(`/listings/${req.params.id}`)
  }
})

router.post('/delete', ensureLoggedIn('/signin'), async (req, res) => {
  if (req.user.id === req.body.listing.seller_id) {
    let result = await deleteItem(req.body.listing.id)
    res.json({ error: undefined })
  } else {
    res.json({ error: 'Unauthorized!' })
  }
})

router.get('/:id', async function (req, res, next) {
  let listing = await getItemsFiltered('item_table.id', req.params.id, 0, 1)
  listing = listing.length === 1 ? listing[0] : undefined
  if (listing) {
    listing.location = zipcodes.lookup(listing.zip)
  }
  res.render('listing', { title: 'Listing', user: req.user, listing: listing })
})

let getFileExtension = (fileName) => {
  let regex = /\.....?$/g
  if (!fileName.match(regex).length || fileName.match(regex).length !== 1) {
    return undefined
  }
  return fileName.match(regex)[0]
}

let getFileTimestamp = (username) => {
  let seed = Date.now() + username
  return crypto.createHash('sha256').update(seed).digest('hex')
}

let validateExtension = (extension) => {
  let valid = ['.jpeg', '.jpg', '.jfif', '.png']
  return valid.indexOf(extension) !== -1
}

let validateSize = (size) => size < 1e7

router.post('/new', ensureLoggedIn('/signin'), async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    let fileName = 'default.png'
    let result = await addItem(
      req.body.title,
      req.body.description,
      req.body.price,
      req.body.category,
      fileName,
      req.user.id
    )
    res.redirect('/listings/search')
  } else {
    let imageFile = req.files.image
    let extension = getFileExtension(imageFile.name)

    if (!validateExtension(extension)) {
      res.render('listing_new', {
        title: 'New Listing',
        error: 'Filetype is not supported! We support: png, jpeg, jpg, jfif!',
      })
    } else if (!validateSize(imageFile.size)) {
      res.render('listing_new', {
        title: 'New Listing',
        error: 'Maximum filesize is 10 mbytes!',
      })
    } else {
      let fileName = `${getFileTimestamp(req.user.username)}${extension}`
      let filePath = `${process.env.STORAGE}/${fileName}`
      imageFile.mv(filePath, function (err) {
        if (err) {
          return next(createError(500))
        } else {
          jimp.read(filePath, async (err, uploadedFile) => {
            if (err) {
              return next(createError(500))
            } else {
              uploadedFile.resize(jimp.AUTO, 500).quality(60).write(filePath)

              let result = await addItem(
                req.body.title,
                req.body.description,
                req.body.price,
                req.body.category,
                fileName,
                req.user.id
              )
              res.redirect('/listings/search')
            }
          })
        }
      })
    }
  }
})

module.exports = router
