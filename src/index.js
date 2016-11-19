import EventEmitter from 'events'
import http from 'http'
import https from 'https'
import url from 'url'
import Middleware from './middleware'

export default class Hook extends EventEmitter {
  constructor () {
    super()
    const args = Array.prototype.slice.call(arguments)
    this.middleware = new Middleware()
    init(this, args)
  }
  subscribe (event, href) {
    this.on(event, (data) => {
      // if failed retry 5 times
      const send = request(this, 5)
      send(href, data)
    })
  }
  use (fn) {
    this.middleware.add(fn)
  }
  triger (event, data) {
    this.emit(event, data)
  }
}

function isObj (obj) {
  return !!obj && obj.toString() === '[object Object]'
}

function init (ctx, args) {
  if (args.length === 0) return
  let opt = args[0]
  if (typeof opt === 'function') {
    opt = opt.apply(ctx, args.slice(1))
  }
  if (!isObj(opt)) return
  for (let key in opt) {
    if (opt.hasOwnProperty(key)) {
      ctx.subscribe(key, opt[key])
    }
  }
}

function request (ctx, times) {
  let retry = 0
  const send = (protocol, opt, data) => {
    const req = protocol.request(opt)
    req.on('error', (error) => {
      ++retry
      if (retry > times) {
        console.log(`reply to hook url failed: ${error}`)
        return
      }
      send(protocol, opt, data)
    })
    req.write(JSON.stringify(data))
    req.end()
  }
  return function notify (href, data) {
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
    ctx.middleware.run(opt)
    const protocol = urlObj.protocol === 'https:' ? https : http
    send(protocol, opt, data)
  }
}
