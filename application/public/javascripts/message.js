let socket = new ReconnectingWebSocket(location.origin.replace(/^http/, 'ws'))

let userId = document.querySelector('#uid').innerHTML
let url = location.href.split('/').reverse()
let channelId = url[0]
let listingId = url[1]

let messagesContainer = document.querySelector('#chat-log')
let messageInput = document.querySelector('#input-message')
let sendButton = document.querySelector('#btn-send')
let warning = document.querySelector('#text-warning')

let cache = {}

let MIN_LENGTH = 1
let MAX_LENGTH = 255

async function sendMessage(body) {
  let message = {
    body,
    userId,
    listingId,
    channelId,
  }
  let result = await axios.post('/messages/new', message)
  updateMessages()
  console.log(result.data)
}

let formatDate = (timestamp) => {
  let date = new Date(timestamp)
  return date.toLocaleTimeString()
}

function updateMessages(
  cb = async (cb = () => window.scrollTo(0, document.body.scrollHeight)) => {
    let result = await axios.get(
      `/messages?listing=${listingId}&channel=${channelId}`
    )
    let messages = result.data
    console.log(messages)
    // TODO fix
    // if(messages.length === 0) {
    //   messagesContainer.innerHTML = 'No messages were found!'
    // }
    for (message of messages) {
      if (cache[message.id] === undefined) {
        cache[message.id] = 1
        let messageHTML
        if (message.sender_id !== userId) {
          messageHTML = `<div class="chat-log__item">
                          <div class="chat-log__message">${message.body}</div>
                          <h3 class="chat-log__author"><small>sent ${formatDate(
                            message.sent
                          )}</small></h3>
                        </div>`
        } else {
          messageHTML = `<div class="chat-log__item chat-log__item--own">
                          <div class="chat-log__message">${message.body}</div>
                          <h3 class="chat-log__author"><small>sent ${formatDate(
                            message.sent
                          )}</small></h3>
                        </div>`
        }
        messagesContainer.innerHTML += messageHTML
      }
    }
    cb()
  }
) {
  // messagesContainer.innerHTML = ''
  cb()
}

socket.onopen = (event) => {
  console.log('Connection with chat server opened!')
  updateMessages()
}

socket.onmessage = (event) => {
  if (event.data === 'UPDATE_MESSAGES') {
    updateMessages()
  }
}

socket.onclose = (event) => {
  console.log('Connection with chat server closed!')
}

sendButton.addEventListener('click', async () => {
  let body = messageInput.value
  if (body.length < MIN_LENGTH) {
    warn('Your message cannot be empty!')
  } else if (body.length > MAX_LENGTH) {
    warn(
      `Your message is ${body.length} characters! (Maximum ${MAX_LENGTH} characters)`
    )
  } else {
    await sendMessage(body)
    messageInput.value = ''
  }
})

messageInput.addEventListener('keyup', function (event) {
  if (event.keyCode === 13) {
    event.preventDefault()
    sendButton.click()
  }
})

let warn = (text) => {
  warning.innerHTML = text
  setTimeout(() => (warning.innerHTML = ''), 3000)
}
