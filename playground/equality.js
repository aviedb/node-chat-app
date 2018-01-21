const a = {
    value : 0,
    valueOf : function() {
        return this.value += 1
    }
}

const equality = (a==1 && a==2 && a==3)

console.log(equality)
