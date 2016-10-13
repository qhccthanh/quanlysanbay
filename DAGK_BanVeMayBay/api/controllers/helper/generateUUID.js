'user strict'

module.exports = {generate};
var arrayUUIDBase = ["111111"];

function isInArray(array, search)
{
    return array.indexOf(search) >= 0;
}

function generate(count) {
    
    var _sym = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
    var str = '';

    while (true) {

        for(var i = 0; i < count; i++) {
            str += _sym[parseInt(Math.random() * (_sym.length))];
        }

        if ( !isInArray(arrayUUIDBase, str) ) {

            arrayUUIDBase.push(str);

            break;
        }
    }
    
    return str
}

