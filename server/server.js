const path = require('path')
const http = require('http')
const express = require('express') // requiring third party module express
const socketIO = require('socket.io') // requiring third party module socket.io

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
    socket.on('join', (params, callback) => {
        if(!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Username and Room ID are required.')
        } // User cant login if the Username or Room ID is not valid

        var usernameAlreadyTaken
        users.getUserList(params.room).forEach(username => {
            if(username === params.name) {
                usernameAlreadyTaken = true
            }
        })

        if(usernameAlreadyTaken) {
            return callback(`Username ${params.name} already taken`)
        }
        console.log(`${params.name} connected to ${params.room}`) // to acknowledge user that a user has been connected

        socket.join(params.room) // joining user by room
        users.removeUser(socket.id) // to make sure that the ID is unique
        users.addUser(socket.id, params.name, params.room) //adding user to server

        io.to(params.room).emit('updateUserList', users.getUserList(params.room))
        socket.emit('newMessage', generateMessage('Admin', `Welcome to ${params.room} chat room`))
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`))
        callback()
    })

    socket.on('createMessage', (message, callback) => {
        var user = users.getUser(socket.id)

        if(user && isRealString(message.text)) {
            socket.broadcast.to(user.room).emit('newMessage', generateMessage(user.name, message.text))
            socket.emit('newMessage', generateMessage('You', message.text))

            console.log(`${user.name} to ${user.room}: "${message.text}"`)
        }

        callback()
    })

    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id)

        if(user) {
            socket.broadcast.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude))
            socket.emit('newLocationMessage', generateLocationMessage('You', coords.latitude, coords.longitude))

            console.log(`${user.name} is sending location to ${user.room} [${coords.latitude},${coords.longitude}]`) // to acknowledge server that a user is sending location
        }
    })

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room))
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`))
            log
            console.log(`${user.name} disconnected from ${user.room}`) // to acknowledge server that a user has been disconnected
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})
