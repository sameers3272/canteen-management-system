const fs = require('fs');

exports.deleteFile = (path) => {

    fs.unlinkSync(path);


}