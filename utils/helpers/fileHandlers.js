const fs = require('fs')

const readFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) reject(err)
      else resolve(JSON.parse(data))
    })
  })
}

const writeFile = (path, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(content), (err) => {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

module.exports = { readFile, writeFile }