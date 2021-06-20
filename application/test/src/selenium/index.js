const { addListing } = require('./src/listings')
const { sendMessage } = require('./src/messages')
const crypto = require('crypto')

const users = require('../data/users.json')
const items = require('../data/items.json')
const messages = require('../data/messages.json')

async function runListingsTests() {
  items.map((item) => {
    return (item.seller = users.filter((user) => {
      return (
        crypto.createHash('sha256').update(user.username).digest('hex') ===
        item.seller
      )
    })[0])
  })

  let listings = items

  for (let listing of listings.splice(0, 3)) {
    await addListing(listing)
  }
}

async function runMessagesTests() {
  let sender = users[0]
  for (let message of messages.splice(25, 30)) {
    await sendMessage(sender, message)
  }
}

(async function runTest() {
  await runListingsTests()
  await runMessagesTests()
})()
