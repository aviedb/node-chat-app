const expect = require('expect')

const {generateMessage, generateLocationMessage} = require('./message')

describe('generateMessage', () => {
    it('should generate correct message object', () => {
        var from = 'avied'
        var text = 'texty text'

        var ObjMessage = generateMessage(from, text)

        expect(ObjMessage.from).toBe(from)
        expect(ObjMessage.text).toBe(text)
    })
})

describe('generateLocationMessage', () => {
    it('should generate correct location object', () => {
        var from = 'avied'
        var latitude = 123123
        var longitude = 321123

        var ObjLocation = generateLocationMessage(from, latitude, longitude)

        expect(ObjLocation.from).toBe(from)
        expect(ObjLocation.locationURL).toBe(`https://www.google.com/maps?q=${latitude},${longitude}`)
    })
})