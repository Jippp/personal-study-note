import fs from 'fs'
import path from 'path'

const versionPath = path.join('.env.production')
const versionFilePath = path.join('./public/release.json')
const date = new Date()
const version = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.${date.getTime()}`

if(fs.existsSync(versionPath)) {
  fs.unlinkSync(versionPath)
}
fs.writeFileSync(versionPath, `VITE_VERSION=${version}`, 'utf-8')

if(fs.existsSync(versionFilePath)) {
  fs.unlinkSync(versionFilePath)
}
fs.writeFileSync(versionFilePath, `{"version":"${version}"}`)

