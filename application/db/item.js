const db = require('.')

function addItem(title, description, price, category, image, sellerId) {
  return new Promise((resolve) => {
    db.any(
      `INSERT INTO item_table ("title", "description", "price", "category", "image", "seller_id") VALUES ('${title.replace(
        /'/g,
        "''"
      )}', '${description.replace(
        /'/g,
        "''"
      )}', '${price}', '${category}', '${image}', '${sellerId}');`
    )
      .then((results) => {
        resolve({ error: undefined })
      })
      .catch((error) => {
        console.log(error)
        resolve({ error: 'Error adding item', status: 500 })
      })
  })
}

function editItem(id, title, description, price, image = null) {
  return new Promise((resolve) => {
    let query = `UPDATE item_table SET "title" = '${title.replace(
      /'/g,
      "''"
    )}', "description" = '${description.replace(
      /'/g,
      "''"
    )}', "price" = '${price}'`
    if (image) {
      query += `, "image" = '${image}'`
    }
    db.any(`${query} WHERE id = '${id}';`)
      .then((results) => {
        resolve({ error: undefined })
      })
      .catch((error) => {
        resolve({ error: 'Error editing item!', status: 500 })
      })
  })
}

function deleteItem(id) {
  return new Promise((resolve) => {
    db.any(`DELETE FROM item_table WHERE id = '${id}';`)
      .then((results) => {
        resolve({ error: undefined })
      })
      .catch((error) => {
        resolve({ error: 'Error deleting item!', status: 500 })
      })
  })
}

function getItemsFiltered(attribute, value, offset = 0, limit = 200) {
  return new Promise((resolve) => {
    db.any(
      `SELECT item_table.id, title, description, price, category, image, seller_id, listed, username, email, zip 
              FROM item_table 
              INNER JOIN user_table ON item_table.seller_id = user_table.id 
              WHERE ${attribute} = '${value}'
              OFFSET ${offset} LIMIT ${limit};`
    )
      .then((results) => {
        resolve(results)
      })
      .catch((error) => {
        console.log(error)
        resolve({ error: 'Error finding items!', status: 500 })
      })
  })
}

function getItems(offset = 0, limit = 200) {
  return new Promise((resolve) => {
    db.any(
      `SELECT item_table.id, title, description, price, category, image, seller_id, listed, username, email, zip 
    FROM item_table 
    INNER JOIN user_table ON item_table.seller_id = user_table.id
    OFFSET ${offset} LIMIT ${limit};`
    )
      .then((results) => {
        resolve(results)
      })
      .catch((error) => {
        resolve({ error: 'Error finding items!', status: 500 })
      })
  })
}

function constructQuery(request, offset = 0, limit = 100) {
  let q = `SELECT item_table.id, title, description, price, category, image, seller_id, listed, username, email, zip 
            FROM item_table 
            INNER JOIN user_table ON item_table.seller_id = user_table.id WHERE`

  if (request.maxPrice) {
    q += ` CAST(price AS INTEGER) < ${request.maxPrice} AND `
  }

  if (request.minPrice) {
    q += ` CAST(price AS INTEGER) > ${request.minPrice} AND `
  }

  if (request.category) {
    q += ` category = '${request.category}' AND `
  }

  if (request.filter) {
    q += ` position('${request.filter}' in title)>0 
            OR position('${request.filter}' in description)>0 `
  }

  q = q.replace(/AND $/, '')
  q = q.replace(/WHERE$/, '')

  if (request.sort) {
    if (request.sort === 'recent') {
      q += 'ORDER BY listed DESC '
    } else if (request.sort === 'high') {
      q += 'ORDER BY CAST(price AS INTEGER) DESC '
    } else {
      q += 'ORDER BY CAST(price AS INTEGER) ASC '
    }
  }

  q += `OFFSET ${offset} LIMIT ${limit};`
  console.log(q)
  return q
}

function runRawQuery(query) {
  return new Promise((resolve) => {
    db.any(query)
      .then((results) => {
        resolve(results)
      })
      .catch((error) => {
        console.log(error)
        resolve({ error: 'Error querying!', status: 500 })
      })
  })
}

function getItemsFilteredComplex(filter) {
  return new Promise((resolve) => {
    db.any(
      `
      SELECT item_table.id, title, description, price, category, image, seller_id, listed, username, email, zip 
      FROM item_table 
      INNER JOIN user_table ON item_table.seller_id = user_table.id 
      WHERE position('${filter}' in title)>0 OR position('${filter}' in description)>0
      OFFSET 0 LIMIT 200;
    `
    )
      .then((results) => {
        resolve(results)
      })
      .catch((error) => {
        console.log(error)
        resolve({ error: 'Error getting items!', status: 500 })
      })
  })
}

module.exports = {
  addItem,
  getItems,
  getItemsFiltered,
  getItemsFilteredComplex,
  editItem,
  constructQuery,
  runRawQuery,
  deleteItem,
}
