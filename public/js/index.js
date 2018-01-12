var socket = io();

socket.on('connect', function() {
    console.log('Connected to server')
})

socket.on('disconnect', function() {
    console.log('Disconnected from server')
})

socket.on('newMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a')
    var template = jQuery('#message-template').html()
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    })

    jQuery('#messages').append(html)
})

socket.on('newLocationMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a')
    var template = jQuery('#location-message-template').html()
    var html = Mustache.render(template, {
        from: message.from,
        createdAt: formattedTime,
        url: message.locationURL
    })

    jQuery('#messages').append(html)
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