const chatAndRoomList = document.getElementById('chats-list')
const btnCreateRoom = document.getElementById('createRoom')
const btnJoinRoom = document.getElementById('joinRoom')
const modal = document.getElementById('modal')
const btnChat = document.getElementById('chatUser')

const link = document.getElementById('link')
link.href = '/' + localStorage.getItem('userId')

btnCreateRoom.addEventListener('click', handleCreateRoom)
btnJoinRoom.addEventListener('click', handleJoinRoom)
btnChat.addEventListener('click', handleChatBtn)

async function refreshRequest() {
    const URL_REFRESH = '/api/auth/refresh'

    const response = await fetch(URL_REFRESH)
    if(!response.ok) return window.location.href = '/'
    const json = await response.json()
    localStorage.setItem('token', json.accessToken)
    localStorage.setItem('userId', json.user.id)
}

refreshRequest()

const eventChat = new EventChat()

class ChatBlock {
    #userId = localStorage.getItem('userId')
    constructor(options) {
        this.$ = document.querySelector(options.selector)

        this.hide()
        this.$messageBlock = this.$.querySelector('.chat__message')
        this.$form = this.$.querySelector('.chat__input')
        this.$form.addEventListener('submit', this.#listenerSubmitSendMessage)
        this.$.querySelector('.chat__header--name').addEventListener('click', this.#listenerInfoRoom)
        this.$.append(this.#elem())
    }

    hide() {
        for(const childNode of this.$.childNodes) {
            if(childNode.nodeName === 'DIV' ) childNode.style.display = 'none'
        }
        this.hidden = true
    }

    #listenerInfoRoom = async (event) =>  {
        if(eventChat.selectType !== 'room') return
        const id = +eventChat.selectChatId
        const room = await eventChat.getInfoRoom(id)
        modal.innerHTML = `
            <form  class="modal__form">
                <div>Ссылка для вступления: ${room.link}</div>
                <br>
                <button class="btn btn-discord" type='submit'>Покинуть комнату</button>
            </form>
        `
        modal.classList.add('open')
        modal.querySelector('form').addEventListener('submit', async event => {
            event.preventDefault()
            modal.classList.remove('open')
            const ok = await eventChat.leaveRoom(id)
            if(!ok) return
            this.hide()
            eventChat.selectedChat(0, '')
            removeChat(id)
        }, {once: true })

        
    }

    #listenerSubmitSendMessage = async (event) => {
        event.preventDefault() 
        let message
        const input = this.$form.querySelector('.chat__input-field')
        if(!input.value) return
        if(eventChat.selectType === 'room') {
            message = await eventChat.sendMessageRoom(eventChat.selectChatId, input.value.trim())
        }else {
            message = await eventChat.sendMessageUser(eventChat.selectChatId, input.value.trim())
        }
        
        this.renderMessage(message)
        input.value = ''
        input.focus()
    }


    set roomName(name) {
        this._roomName = name
        this.$.querySelector('.chat__header--name').textContent = name  
    }

    set countMember(count) {
        this._countMember = count
        this.$.querySelector('.chat__header--member--count').textContent = count
    }

    show() {
        if(this.hidden) {
            this.hidden = false
           
            const el = this.$.querySelector('.chat-list-span')
            if(el) el.remove()
        }
        for(const childNode of this.$.childNodes) {
            if(childNode.nodeName === 'DIV' ) childNode.style.display = 'block'
        }
        this.$.querySelector('.chat__header--member').style.display = 'block'
        messageScrollDown()
    }

    #elem() {
        const div = document.createElement('div')
        div.textContent = 'Выбери кому хочешь написать'
        div.classList.add('chat-list-span')
        return div
    }

    renderMessage = (message) => {
        if(message.filename) {
            return this.renderAudioMessage(message)
        }
        const $message = document.createElement('div')
        $message.classList.add('message')
        if(this.#userId === message.user.id) {
            $message.classList.add('my')
            $message.innerHTML = `
               <div class="message__text">${message.text}<div>
                
            `
        }else {
            $message.innerHTML =  `
            <div class="message__author">${message.user.username}</div>
            <div class="message__text">${message.text}</div>
             `
        }
        this.$messageBlock.append($message)
        messageScrollDown()
    }

    renderAudioMessage = async (message) => {
        let voiceMessage
        if(this.#userId === message.user.id) {
            voiceMessage = new VoiceMessage(`/audio/${message.filename}`, true)
        }else {
            voiceMessage = new VoiceMessage(`/audio/${message.filename}`, false, message.user.username)
        }
        setTimeout(messageScrollDown, 100)
        this.$messageBlock.append(voiceMessage.html)

    }

    selectRoom(id) {
        const chat = chatAndRoomList.querySelector(`[data-id="${id}"]`)
        chat.click()
    }
}


const chatBlock = new ChatBlock({selector: '#chat-block'})


function renderChatsAtConnection(chatAndRoom) {
    if(!chatAndRoom.length) {
        chatAndRoomList.innerHTML = '<div class="chat-list-span">Переписок еще нет</div>'
        return
    }
    chatAndRoomList.innerHTML = ''
    chatAndRoom.forEach(createChat);
}

function renderNewRoom(chat) {
    const node = document.createElement('div')
    node.classList.add('chat__item')
    node.dataset.id = chat.id
    node.dataset.type = chat.type ?? 'room'
    node.innerHTML = `
        <div class="chat__item--title">${chat.name}</div>
    `
    node.addEventListener('click', handleChat)
    const span = chatAndRoomList.querySelector('.chat-list-span')
    if(span) {
        span.remove()
    }
    chatAndRoomList.prepend(node)
}

function removeChat(id) {
    const chat = chatAndRoomList.querySelector(`[data-id='${id}']`)
    if(!chat) return
    chat.remove()
}

function createChat(chat) {
    const node = document.createElement('div')
    node.classList.add('chat__item')
    
    node.dataset.type = chat.type ?? 'room'
    if(chat.type === 'private-message') {
        node.dataset.id = chat.user.id
        node.innerHTML = `
            <div class="chat__item--title">${chat.user.username}</div>
        `
        node.addEventListener('click', handleChat)
    }else {
        node.dataset.id = chat.id
        node.innerHTML = `
            <div class="chat__item--title">${chat.name}</div>
        `
        node.addEventListener('click', handleChat)
    }
    
    chatAndRoomList.append(node)
}

function messageScrollDown() {
    chatBlock.$messageBlock.scrollTop = chatBlock.$messageBlock.scrollHeight
}

async function handleChat() {
    const id = this.dataset.id
    const type = this.dataset.type
    let messages
    const notf = this.querySelector('.chat__item--notifications')
    if(notf) notf.remove()

    const boolean = eventChat.selectedChat(id, type)
    if(!boolean) return
    chatBlock.$messageBlock.innerHTML = ''
    
    if(type === 'private-message') {
        const $name = this.querySelector('.chat__item--title')
        messages = await eventChat.chatMessages(id, 75, 1) /*  userId, limit, page*/
        chatBlock.roomName = $name.textContent
        chatBlock.show()
        chatBlock.$.querySelector('.chat__header--member').style.display = 'none'

    }else {
        const room = await eventChat.getInfoRoom(+id)
        messages = await eventChat.roomMessages(+id, 75, 1)
        chatBlock.countMember = room.usersCount
        chatBlock.roomName = room.name
        chatBlock.show()
    }

    
   
    messages[0].reverse().forEach(chatBlock.renderMessage) 
    setTimeout(messageScrollDown, 50)
    
}

function handleCreateRoom(event) {
    modal.innerHTML = `
    <form  class="modal__form">
        <input type="text" class="modal__form--input" placeholder="Название комнаты">
        <button class="btn btn-discord" type='submit'>Создать</button>
    </form>
    `
   modal.classList.add('open')
   modal.querySelector('form').addEventListener('submit', async function(event) {
        event.preventDefault()
        const input = modal.querySelector('input')
        const roomData = await eventChat.createRoom(input.value)
        renderNewRoom(roomData)
        this.innerHTML = `<span>Ссылка на вступление: ${roomData.link}</span>`
        chatBlock.selectRoom(roomData.id)
   },
   {once: true})
}


function handleJoinRoom(event) {
    modal.innerHTML = `
    <form class="modal__form">
        <input type="text" class="modal__form--input" placeholder="Ссылка на комнату">
        <button class="btn btn-discord" type='submit'>Вступить</button>
    </form>
    `

    modal.classList.add('open')
    modal.querySelector('form').addEventListener('submit', async function(event) {
        event.preventDefault()
        const input = modal.querySelector('input')
        const room = await eventChat.joinRoom(input.value.trim())
        if('error' in room) {
            this.innerHTML = `<span>${room.error}</span>`
            return
        }
        renderNewRoom(room)
        modal.classList.remove('open')
        chatBlock.selectRoom(room.id)
   },
   {once: true})
}


async function handleChatBtn(event) {
    modal.innerHTML = `
    <form class="modal__form">
        <input type="text" class="modal__form--input" placeholder="айди юзера">
        <input type="text" class="modal__form--input message-text" placeholder="Сообщение">
        <button class="btn btn-discord" type='submit'>Написать</button>
    </form>
    `
    modal.classList.add('open')
    modal.querySelector('form').addEventListener('submit', async function(event) {
        event.preventDefault()
        const $input = modal.querySelector('.modal__form--input')
        const $text = modal.querySelector('.message-text')
        const message = await eventChat.sendMessageUser($input.value, $text.value)
   },
   {once: true})
}


modal.addEventListener('click', event => {
    if(event.target.id === 'modal') modal.classList.remove('open')
})




