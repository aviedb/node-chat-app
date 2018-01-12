const expect = require('expect')

const {generateMessage} = require('./message')

describe('generateMessage', () => {
    it('should generate correct message object', () => {
        // not important

        var from = 'avied'
        var text = 'texty text'

        var ObjMessage = generateMessage(from, text)

        expect(ObjMessage.from).toBe(from)
        expect(ObjMessage.text).toBe(text)
    })
})