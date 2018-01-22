var socket = io();

// Function for autoscrolling
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

    // Sending 'join' event to server when a new user connected
    socket.emit('join', params, function(err) {
        if(err) {
            // If there's an error, user'll be sent back to homepage
            alert(err)
            window.location.href = '/'
        } else {
            jQuery('#share-loct').removeAttr('disabled')

            // Changing the message text box placeholder to match user's username
            var messagePlaceholder = jQuery(`<input type="text" name="message" placeholder="Send as ${params.name}" autofocus id="message-form-body"><button>Send</button>`)
            jQuery('#message-form').html(messagePlaceholder)
            jQuery('#message-form-body').focus()

            // Changing the side bar room name to match user's room ID
            var setSideBarRoomName = jQuery('<h3></h3>').text(params.room)
            jQuery('#side-bar__room-name').html(setSideBarRoomName)
        }
    })
})

socket.on('disconnect', function() {
    console.log('Disconnected from server')
}) // To acknowledge user that they have been disconnected from server


// Listener of 'updateUserList' event that was sent by server
socket.on('updateUserList', function(users) {
    var ol = jQuery('<ol></ol>')

    users.forEach(function(user) {
        ol.append(jQuery('<li></li>').text(user))
    })

    jQuery('#users').html(ol)
}) // Updating the User list on the side bar


// Listener of 'newMessage' event that was sent by server
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

// Listener of 'newLocationMessage' event that was sent by server
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


// Do something when the 'send' button / enter key clicked
jQuery('#message-form').on('submit', function(e) {
    e.preventDefault() // To prevent the default behaviour that refresh the page

    messageTextBox = jQuery('[name=message]')

    // Sending 'createMessage' event to server
    socket.emit('createMessage', {
        text: messageTextBox.val()
    }, function() {
        messageTextBox.val('') // To erase the sent message from the text box
    })
})

// Do something when the 'share location' button clicked
var locationButton = jQuery('#share-loct')
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser.')
    }

    // Acknowlege user that it is sending location
    locationButton.attr('disabled', 'disabled').text('Sending location...')

    navigator.geolocation.getCurrentPosition(function (position) {
        locationButton.removeAttr('disabled').text('Share location')
        
        // Sending 'createLocationMessage' event to server
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
    }, function () {
        // If there's something wrong, like location is not allowed by the browser or no internet
        locationButton.removeAttr('disabled').text('Share location')
        alert('Unable to fetch location.')
    })
})