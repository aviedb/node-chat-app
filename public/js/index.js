var socket = io();

socket.on('connect', function() {
    console.log('Connected to server')
})

socket.on('disconnect', function() {
    console.log('Disconnected from server')
})

socket.on('newMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a')
    console.log('New Message from server:', message)
    var li = jQuery('<li></li>')
    li.text(`${message.from} (${formattedTime}): ${message.text}`)

    jQuery('#messages').append(li)
})

socket.on('newLocationMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a')
    var li = jQuery('<li></li>')
    var a = jQuery('<a target="_blank">Open location</a>')

    li.text(`${message.from} (${formattedTime}): `)
    a.attr('href', message.locationURL)
    li.append(a)
    jQuery('#messages').append(li)
})

jQuery('#message-form').on('submit', function(e) {
    e.preventDefault()

    messageTextBox = jQuery('[name=message]')

    socket.emit('createMessage', {
        from: 'Anonymous',
        text: messageTextBox.val()
    }, function() {
        messageTextBox.val('')
    })
})

var locationButton = jQuery('#share-loct')
locationButton.on('click', function () {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser.');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...')

  navigator.geolocation.getCurrentPosition(function (position) {
    locationButton.removeAttr('disabled').text('Share location')
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    })
  }, function () {
    locationButton.removeAttr('disabled').text('Share location')
    alert('Unable to fetch location.')
  })
})