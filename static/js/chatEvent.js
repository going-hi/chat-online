class EventChat {
    EVENTS = {
        PRIVATE_MESSAGES: 'PRIVATE_MESSAGE',
        ROOM_MESSAGES: 'ROOM_MESSAGES',
        RECEIVE_MESSAGES: 'RECEIVE_MESSAGE',
        JOIN_ROOM: 'JOIN_ROOM',
        LEAVE_ROOM: 'LEAVE_ROOM',
        CREATE_ROOM: 'CREATE_ROOM',
        USERS_ROOM: 'USERS_ROOM',
        GET_MESSAGES_ROOM: 'GET_MESSAGES_ROOM',
        GET_MESSAGES_CHAT: 'GET_MESSAGES_CHAT',
        GET_OLD_MESSAGES: 'GET_OLD_MESSAGES',
        CONNECTED: 'connected',
        ROOMS_AND_CHATS: 'ROOMS_AND_CHATS',
        INFO_ROOM: 'INFO_ROOM'
    }

    token = localStorage.getItem('token')
    selectChatId = 0
    selectType = ''
    constructor() {
        this.connection()
        this.#setup()
    }

    connection() {
        this.socket = io('http://localhost:3000', {
            auth: { token: this.token }
        });

        this.socket.on('connect', () => console.log('Connection'))
    }

    #setup() {
        this.socket.on(this.EVENTS.RECEIVE_MESSAGES, this.#eventReceiveMessages)
        this.socket.on(this.EVENTS.USERS_ROOM, this.#eventUsersRooms)
        this.socket.on(this.EVENTS.CONNECTED, this.#eventConnected)
        this.socket.on(this.EVENTS.ROOMS_AND_CHATS, this.#eventRoomsAndChats)
    }

    #eventConnected = data => {
        console.log(data);
        renderChatsAtConnection([...data.rooms, ...data.chats])
    }

    selectedChat(id, type) {
        if((id === this.selectChatId) && (type === this.selectType)) return false
        this.selectChatId = id
        this.selectType = type 
        return true
    }

    getInfoRoom(id) {
        return new Promise((resolve, reject) => {
            this.socket.emit(this.EVENTS.INFO_ROOM, {id}, resolve)
        })
    }

    #eventReceiveMessages = data => {
        let type = 'private-message'
        let id = data.message.user.id
        
        if(!data.message.chat.id) {
            type = 'room'
            id = data.message.room.id
        }
        
        

        if((this.selectChatId == id) && (this.selectType === type)) {

            if(data.message.userCount) {
                document.querySelector('.chat__header--member--count').textContent = data.message.userCount
            }   

            chatBlock.renderMessage({...data.message, user: data.user ?? data.message.user})


        }else {
            const chatArray = chatAndRoomList.querySelectorAll(`[data-id="${id}"]`)
            let chat
            Array.from(chatArray).forEach(chatE => {
                if(chatE.dataset.type == type) chat = chatE
            })
            if(!chat) return
            const notf = chat.querySelector('.chat__item--notifications')
            if(!notf) {
                chat.insertAdjacentHTML('beforeend', '<div class="chat__item--notifications">1</div>')
                return
            }
            notf.textContent = +notf.textContent + 1
        }
    }

    #eventUsersRooms = data => {
        const usersCount = data.users.length
        if((this.selectChatId === data.roomId) && (this.selectType === 'room')) {
            chatBlock.countMember = usersCount
        }
    }

    roomMessages(roomId, limit, page) {
        return new Promise((resolve, reject) => {
            this.socket.emit(this.EVENTS.GET_MESSAGES_ROOM, {roomId, limit, page}, resolve)
        })
    }

    chatMessages(userId, limit, page) {
        return new Promise((resolve, reject) => {
            this.socket.emit(this.EVENTS.GET_MESSAGES_CHAT, {userId, limit, page}, resolve)
        })
    }


    #eventRoomsAndChats = data => {
        renderNewRoom(data)
    }

    joinRoom(link) {
        return new Promise((resolve, reject) => {
            this.socket.emit(this.EVENTS.JOIN_ROOM, {link}, resolve)
        })
    }

    leaveRoom(roomId) {
        return new Promise((resolve, reject) => {
            this.socket.emit(this.EVENTS.LEAVE_ROOM, {roomId}, resolve)
        })
    }


    sendMessageRoom(roomId, text) {
        return new Promise((resolve, reject) => {
            this.socket.emit(this.EVENTS.ROOM_MESSAGES, {text, roomId}, resolve)
        })
    }

    
    sendMessageUser(userId, text) {
        return new Promise((resolve, reject) => {
            this.socket.emit(this.EVENTS.PRIVATE_MESSAGES, {text, userId: userId.toString()}, resolve)
        })
    }


    createRoom(name) {
        return new Promise((resolve, reject) => {
            this.socket.emit(this.EVENTS.CREATE_ROOM, {name}, resolve)   
        })
    }

    sendAudioMessageRoom(roomId, audio){
        return new Promise((resolve, reject) => {
            this.socket.emit(this.EVENTS.ROOM_MESSAGES, {audio, roomId}, resolve)
        })
    }
    sendAudioMessageChat(userId, audio){
        return new Promise((resolve, reject) => {
            this.socket.emit(this.EVENTS.PRIVATE_MESSAGES, {audio, userId}, resolve)
        })
    }

}