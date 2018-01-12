var socket = io();

socket.on('connect', function() {
    console.log('Connected to server')

    socket.emit('createMessage', {
        from: 'me@filkom.com',
        text: 'you are a failure!'
    })
})

socket.on('disconnect', function() {
    console.log('Disconnected from server')
})

socket.on('newMessage', function(message) {
    console.log('New Message from server:', message)
})