const db = require('.')

function sendMessage(body, channelId, senderId, itemId) {
  return new Promise((resolve) => {
    db.any(
      `INSERT INTO message_table ("body", "channel_id", "sender_id", "item_id") VALUES ('${body.replace(
        /'/g,
        "''"
      )}', '${channelId}', '${senderId}', '${itemId}');`
    )
      .then((results) => {
        resolve({ error: undefined })
      })
      .catch((error) => {
        resolve({ error: 'Error sending message!', code: 500 })
      })
  })
}

function getMessages(channelId, itemId, offset, limit) {
  return new Promise((resolve) => {
    db.any(
      `SELECT * FROM message_table WHERE channel_id = '${channelId}' AND item_id = '${itemId}' OFFSET ${offset} LIMIT ${limit}`
    )
      .then((results) => {
        resolve(results)
      })
      .catch((error) => {
        console.log(error)
        resolve({ error: 'Error getting messages!', code: 500 })
      })
  })
}

function getSellerChannels(senderId) {
  return new Promise((resolve) => {
    db.any(
      `SELECT DISTINCT channel_id, item_id, title, username FROM message_table
          INNER JOIN item_table ON CAST(item_table.id AS VARCHAR) = message_table.item_id   
          INNER JOIN user_table ON CAST(message_table.channel_id AS VARCHAR) = user_table.id     
          WHERE item_id IN (
          SELECT CAST (id AS VARCHAR) FROM item_table WHERE seller_id = '${senderId}'
        );`
    )
      .then((results) => {
        resolve(results)
      })
      .catch((error) => {
        console.log(error)
        resolve({ error: 'Error getting messages!', code: 500 })
      })
  })
}

function getBuyerChannels(senderId) {
  return new Promise((resolve) => {
    db.any(
      `SELECT DISTINCT channel_id, item_id, title, username FROM message_table
        INNER JOIN item_table ON CAST(item_table.id AS VARCHAR) = message_table.item_id 
        INNER JOIN user_table ON CAST(item_table.seller_id AS VARCHAR) = user_table.id      
        WHERE item_id NOT IN (
        SELECT CAST (id AS VARCHAR) FROM item_table WHERE seller_id = '${senderId}'
        ) AND channel_id = '${senderId}';`
    )
      .then((results) => {
        resolve(results)
      })
      .catch((error) => {
        console.log(error)
        resolve({ error: 'Error getting messages!', code: 500 })
      })
  })
}

module.exports = {
  getMessages,
  sendMessage,
  getSellerChannels,
  getBuyerChannels,
}
