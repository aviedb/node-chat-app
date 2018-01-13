const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const {generateMessage, generateLocationMessage} = require('./utils/message')
const {isRealString} = require('./utils/validations')
const publicPath = path.join(__dirname, '../public')
const app = express()
const port = process.env.PORT || 3000
var server = http.createServer(app)
var io = socketIO(server)

app.use(express.static(publicPath))

io.on('connection', (socket) => {
    console.log('New user connected')

    socket.on('join', (params, callback) => {
        if(!isRealString(params.name) || !isRealString(params.room)) {
            callback('Name and room name are required.')
        }

        socket.join(params.room)

        socket.emit('newMessage', generateMessage('Admin', `Welcome to ${params.room} chat room`))
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`))
        callback()
    })

    socket.on('createMessage', (message, callback) => {
        console.log('Create Message from client:', message)
        io.emit('newMessage', generateMessage(message.from, message.text))
        callback()
    })

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('Shared location', coords.latitude, coords.longitude))
    })

    socket.on('disconnect', () => {
        console.log('User was disconnected')
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})
