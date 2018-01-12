var generateMessage = (from, text) => {
    var date = new Date()

    return {
        from,
        text,
        createdAt: date.getTime()
    }
}

module.exports = {generateMessage}