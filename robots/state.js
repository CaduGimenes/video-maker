const fs = require('fs')
const contententFilePath = './content.json'

function save(content) {
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(contententFilePath, contentString)
}

function load() {
    const fileBuffer = fs.readFileSync(contententFilePath, 'utf-8')
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

module.exports = {
    save,
    load
}