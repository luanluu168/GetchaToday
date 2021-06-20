require('dotenv').config()
const fs = require('fs')
const path = require('path')

const users = require('../data/users.json')
const items = require('../data/items.json')
const { registerUser } = require('../../../db/user')
const { addItem } = require('../../../db/item')

let populateUsers = async () => {
  for (let user of users) {
    let result = await registerUser(
      user.username,
      user.password,
      user.email,
      user.zip
    )
    console.log(result)
  }
}

let populateItems = async () => {
  for (let item of items) {
    let result = await addItem(
      item.title,
      item.description,
      item.price,
      item.category,
      item.image,
      item.seller
    )
    console.log(result)
    let srcFile = path.resolve(__dirname, 'data', 'images', item.image)
    let dstFile = process.env.STORAGE + item.image
    fs.createReadStream(srcFile).pipe(fs.createWriteStream(dstFile))
  }
}

populateItems()
populateUsers()
