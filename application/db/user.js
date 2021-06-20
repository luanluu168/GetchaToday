const db = require('.')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

function registerUser(username, password, email, zip) {
  return new Promise((resolve) => {
    let id = crypto.createHash('sha256').update(username).digest('hex')
    let hash = bcrypt.hashSync(password, 8)

    db.any(
      `INSERT INTO user_table ("id", "username", "password", "email", "zip") VALUES ('${id}', '${username}', '${hash}', '${email}', '${zip}');`
    )
      .then((results) => {
        resolve({ error: undefined })
      })
      .catch((error) => {
        resolve({ error: 'Username already exists!', status: 200 })
      })
  })
}

function findUser(attribute, value) {
  return new Promise((resolve) => {
    db.any(`SELECT * FROM user_table WHERE ${attribute} = '${value}'`)
      .then((results) => {
        if (results.length === 0) {
          resolve({ error: 'User was not found!', status: 200 })
        } else if (results.length > 1) {
          resolve({ error: 'Internal database error!', status: 500 })
        } else {
          resolve(results[0])
        }
      })
      .catch((error) => {
        resolve({ error: 'Error getting user!', status: 500 })
      })
  })
}

function updateUser(selector, mutator) {
  return new Promise((resolve) => {
    db.any(
      `UPDATE user_table SET ${mutator.attribute} = '${mutator.value}' WHERE ${selector.attribute} = '${selector.value}'`
    )
      .then((results) => {
        resolve({ error: undefined })
      })
      .catch((error) => {
        resolve({ error: 'Error updating user!', status: 500 })
      })
  })
}

function validatePassword(hash, password) {
  return bcrypt.compareSync(password, hash)
}

module.exports = {
  registerUser,
  findUser,
  updateUser,
  validatePassword,
}
