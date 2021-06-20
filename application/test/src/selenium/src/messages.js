const { Builder, By, Key } = require('selenium-webdriver')

async function sendMessage(sender, message) {
  const url = 'http://localhost:3000'
  console.log(sender)
  let { username, password } = sender

  let driver = await new Builder().forBrowser('chrome').build()
  try {
    await driver.get(url)
    await driver.findElement(By.id('signin')).click()
    await driver.executeScript(
      `document.querySelector('#input-username').value = '${username}'`
    )
    await driver.executeScript(
      `document.querySelector('#input-password').value ='${password}'`
    )
    await driver.findElement(By.css('button.btn-solid')).click()
    await driver.findElement(By.css('button.btn-outline-solid')).click()

    await driver.findElement(By.css('a.btn-solid')).click()

    await driver
      .findElement(By.id('input-message'))
      .sendKeys(message.body, Key.RETURN)
  } finally {
    await driver.quit()
  }
}

module.exports = {
  sendMessage,
}
