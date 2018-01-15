var socket = io();

function scrollToBottom() {
    // Selectors
    var messages = jQuery('#messages')
    var newMessage = messages.children('li:last-child')

    //Heights
    var clientHeight = messages.prop('clientHeight')
    var scrollTop = messages.prop('scrollTop')
    var scrollHeight = messages.prop('scrollHeight')
    var newMessageHeight = newMessage.innerHeight()
    var lastMessageHeight = newMessage.prev().innerHeight()

    if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight)
    }
}

socket.on('connect', function() {
    var params = jQuery.deparam(window.location.search)

    socket.emit('join', params, function(err) {
        if(err) {
            alert(err)
            window.location.href = '/'
        } else {
            jQuery('#share-loct').removeAttr('disabled')

            var messagePlaceholder = jQuery(`<input type="text" name="message" placeholder="Send as ${params.name}" autofocus id="message-form-body"><button>Send</button>`)
            jQuery('#message-form').html(messagePlaceholder)
            jQuery('#message-form-body').focus()

            var setSideBarRoomName = jQuery('<h3></h3>').text(params.room)
            jQuery('#side-bar__room-name').html(setSideBarRoomName)
        }
    })
})

socket.on('disconnect', function() {
    console.log('Disconnected from server')
})

socket.on('updateUserList', function(users) {
    var ol = jQuery('<ol></ol>')

    users.forEach(function(user) {
        ol.append(jQuery('<li></li>').text(user))
    })

    jQuery('#users').html(ol)
})

// socket.on('setMessageFormButtonName', function(name) {
//     var input = jQuery(`<input type="text" name="message" placeholder="Send as ${name}" autofocus id="message-form-body"><button>Send</button>`)
//     jQuery('#message-form').html(input)
//     jQuery('#message-form-body').focus()
    
//     // var messageFormSelect = jQuery('#send-button')
//     // var template = messageFormSelect.html()
//     // var html = Mustache.render(template, {name: `Send as ${name}`})
//     // messageFormSelect.html(html)
// })

// socket.on('setSideBarRoomName', function(room) {
//     var html = jQuery('<h3></h3>').text(room)
//     jQuery('#side-bar__room-name').html(html)

//     // var sidebarSelect = jQuery('#side-bar__room-name')
//     // var template = sidebarSelect.html()
//     // var html = Mustache.render(template, {room})
//     // sidebarSelect.html(html)
// })

socket.on('newMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a')
    var template = jQuery('#message-template').html()
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    })

    jQuery('#messages').append(html)
    scrollToBottom()
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
    scrollToBottom()
})

jQuery('#message-form').on('submit', function(e) {
    e.preventDefault()

    messageTextBox = jQuery('[name=message]')

    socket.emit('createMessage', {
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