export default class Middleware {
  constructor () {
    this.fns = []
  }
  add (fn) {
    if (typeof fn === 'function') this.fns.push(fn)
  }
  run (obj) {
    act(this, obj)
  }
}

function act (ctx, obj) {
  const fns = ctx.fns.slice()
  function next () {
    if (fns.length > 0) {
      const fn = fns.shift()
      fn(obj)
      next()
    }
  }
  next()
}
