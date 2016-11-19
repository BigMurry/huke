import EventEmitter from 'events'
import http from 'http'
import url from 'url'

export default class Hook extends EventEmitter {
  constructor () {
    super()
  }
  subscribe (event, href) {
    this.on(event, (data) => {
      request(href, data)
    })
  }
  triger (event, data) {
    this.emit(event, data)
  }
}

function request (href, data) {
  const urlObj = url.parse(href)
  const opt = {
    hostname: urlObj.hostname,
    method: 'POST',
    port: urlObj.port,
    path: urlObj.path,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }
  const req = http.request(opt)
  req.on('error', (error) => {
    console.log(`reply to hook url failed: ${error}`)
  })
  req.write(JSON.stringify(data))
  req.end()
}
