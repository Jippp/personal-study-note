const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()

app.use(cors())

// Serve static files from the "static" directory
app.use(express.static(path.join(__dirname, 'static')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'))
})

const releaseFile = fs.readFileSync(path.join(__dirname, 'static', 'release.json'), 'utf-8')
const releaseJson = releaseFile ? JSON.parse(releaseFile) : {}

app.get('/release', (req, res) => {
  res.send({
    data: {
      version: releaseJson ? releaseJson.version : ''
    }
  })
})

app.listen(5174, () => {
  console.log(`Running in http://localhost:5174`)
})
