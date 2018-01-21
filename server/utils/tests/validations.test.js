const expect = require('expect')

const {isRealString} = require('./validations')

describe('isRealString', () => {
    it('should be a real string', () => {
        var str = '   ngehe   '
        expect(isRealString(str)).toBe(true)
    })

    it('should not be a real string', () => {
        var str = '     '
        expect(isRealString(str)).toBe(false)
    })
})