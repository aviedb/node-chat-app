var socket = io();

socket.on('connect', function() {
    console.log('Connected to server')
})

socket.on('disconnect', function() {
    console.log('Disconnected from server')
})

socket.on('newMessage', function(message) {
    console.log('New Message from server:', message)
})

socket.emit('createMessage', {
    from: 'avied',
    text: 'Hi!'
}, function(res) {
    console.log(res)
})