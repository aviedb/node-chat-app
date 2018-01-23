const path = require('path')
const http = require('http')
const express = require('express') // Requiring third party module express
const socketIO = require('socket.io') // Requiring third party module socket.io

const {generateMessage, generateLocationMessage} = require('./utils/message')
const {isRealString} = require('./utils/validations')
const {Users} = require('./utils/users')

const publicPath = path.join(__dirname, '../public')
const app = express()
const port = process.env.PORT || 3000
const server = http.createServer(app)
const io = socketIO(server)
const users = new Users()

app.use(express.static(publicPath))

io.on('connection', (socket) => {
    // Listener of 'join' event sent by user
    socket.on('join', (params, callback) => {
        if(!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Username and Room ID are required.')
        } // If the username or room ID is not valid, user'll be sent back to homepage

        var usernameAlreadyTaken
        users.getUserList(params.room).forEach(username => {
            if(username === params.name) {
                usernameAlreadyTaken = true
            }
        })

        if(usernameAlreadyTaken) {
            return callback(`Username ${params.name} already taken`)
        } // If the username selected by user is alredy taken, user'll be sent back to homepage

        // Acknowledge server that a user has been connected
        console.log(`${params.name} connected to ${params.room}`)

        socket.join(params.room) // Joining user by room
        users.removeUser(socket.id) // To make sure that the ID is unique
        users.addUser(socket.id, params.name, params.room) // Adding user to server

        // Sending 'updateUserList' event to all user (including current user)
        io.to(params.room).emit('updateUserList', users.getUserList(params.room))

        // Sending 'newMessage' event to current user only
        socket.emit('newMessage', generateMessage('Admin', `Welcome to ${params.room} chat room`))

        // Sending 'newMessage' event to all user except current user
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`))
        
        callback() // Calling callback function with no args means nothing went wrong
    })

    // Listener of 'createMessage' event sent by user
    socket.on('createMessage', (message, callback) => {
        var user = users.getUser(socket.id)

        // Check if user exist and the text message is valid
        if(user && isRealString(message.text)) {
            // Sending 'newMessage' event to all user except current user
            socket.broadcast.to(user.room).emit('newMessage', generateMessage(user.name, message.text))
            
            // Sending 'newMessage' event to current user only
            socket.emit('newMessage', generateMessage('You', message.text))

            // Ackowledge server that message has been sent
            console.log(`${user.name} to ${user.room}: "${message.text}"`)
        }

        callback()
    })

    // Listener of 'createLocationMessage' event sent by user
    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id)

        // Check if user exist
        if(user) {
            // Sending 'newLocationMessage' event to all user except current user
            socket.broadcast.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude))

            //Sending 'newLocationMessage' event to current user only
            socket.emit('newLocationMessage', generateLocationMessage('You', coords.latitude, coords.longitude))

            // Acknowledge server that a user is sending location
            console.log(`${user.name} is sending location to ${user.room} [${coords.latitude},${coords.longitude}]`)
        }
    })

    // When user is disconnected from server
    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id)

        // Check if user exist
        if(user) {
            // Sending 'updageUserList' event to all user (including current user)
            io.to(user.room).emit('updateUserList', users.getUserList(user.room))

            // Sending 'newMessage' event to all user
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`))
            
            // Acknowledge server that a user has been disconnected
            console.log(`${user.name} disconnected from ${user.room}`)
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})
