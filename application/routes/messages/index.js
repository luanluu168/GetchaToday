const express = require('express')
const router = express.Router()
const { ensureLoggedIn } = require('connect-ensure-login')
const {
  sendMessage,
  getMessages,
  getSellerChannels,
  getBuyerChannels,
} = require('../../db/message')

router.post('/new', ensureLoggedIn('/signin'), async (req, res) => {
  let wsServer = req.app.get('ws')
  wsServer.clients.forEach(function each(client) {
    if (client.readyState === require('ws').OPEN) {
      client.send('UPDATE_MESSAGES')
    }
  })

  let message = req.body
  let result = await sendMessage(
    message.body,
    message.channelId,
    message.userId,
    message.listingId
  )
  console.log(result)

  res.json({
    error: undefined,
  })
})

router.get('/:listing/:channel', ensureLoggedIn('/signin'), (req, res) => {
  res.render('message', { title: 'Message', user: req.user })
})

router.get('/', ensureLoggedIn('/signin'), async (req, res) => {
  if (req.query.channel && req.query.listing) {
    let messages = await getMessages(
      req.query.channel,
      req.query.listing,
      0,
      500
    )
    res.json(messages)
  } else {
    let sellerChannels = await getSellerChannels(req.user.id)
    let buyerChannels = await getBuyerChannels(req.user.id)
    res.render('messages', {
      title: 'Messages',
      user: req.user,
      sellerMessages: sellerChannels,
      buyerMessages: buyerChannels,
    })
  }
})

module.exports = router
