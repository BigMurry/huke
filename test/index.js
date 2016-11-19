import {assert} from 'chai'
import nock from 'nock'
import Hook from '..'

function assertNock (path, data, host, done) {
  const scope = nock(host || 'http://localhost')
    .post(path, (posted) => {
      !!data && assert.deepEqual(posted, data)
      return true
    })
    .reply(200, {
      ok: true
    })
  scope.on('replied', () => {
    typeof done === 'function' && done()
  })
}
describe('hook should work', () => {
  it('https', (done) => {
    const hook = new Hook()
    assertNock('/afterhook', {a: 1}, 'https://localhost', done)
    hook.subscribe('event1', 'https://localhost/afterhook')
    hook.triger('event1', {a: 1})
  })
  it('1 event, 1 url', (done) => {
    const hook = new Hook()
    assertNock('/afterhook', {a: 1, b: 2}, null, done)
    hook.subscribe('event1', 'http://localhost/afterhook')
    hook.triger('event1', {a: 1, b: 2})
  })
  it('1 event, 2 url', (done) => {
    const hook = new Hook()
    hook.subscribe('event1', 'http://localhost/afterhook1')
    hook.subscribe('event1', 'http://localhost/afterhook2')
    assertNock('/afterhook1', {a: 1}, null)
    assertNock('/afterhook2', {a: 1}, null, done)
    hook.triger('event1', {a: 1})
  })
  it('2 event, 1 url', (done) => {
    const hook = new Hook()
    hook.subscribe('event1', 'http://localhost/afterhook')
    hook.subscribe('event2', 'http://localhost/afterhook')
    assertNock('/afterhook', {a: 'from e1'}, null)
    hook.triger('event1', {a: 'from e1'})
    assertNock('/afterhook', {a: 'from e2'}, null, done)
    hook.triger('event2', {a: 'from e2'})
  })
  it('2 event, 2 url', (done) => {
    const hook = new Hook()
    hook.subscribe('event1', 'http://localhost/afterhook1')
    hook.subscribe('event2', 'http://localhost/afterhook2')
    assertNock('/afterhook1', {a: 1}, null)
    assertNock('/afterhook2', {a: 2}, null, done)
    hook.triger('event1', {a: 1})
    hook.triger('event2', {a: 2})
  })
  it('.constructor(object)', (done) => {
    const hook = new Hook({
      event1: 'http://localhost/afterhook1',
      event2: 'http://localhost/afterhook2'
    })
    assertNock('/afterhook1', {a: 1}, null)
    assertNock('/afterhook2', {a: 2}, null, done)
    hook.triger('event1', {a: 1})
    hook.triger('event2', {a: 2})
  })
  it('.constructor(fn, p1, p2)', (done) => {
    const complexDate = {
      a: 1,
      b: 2,
      events: {
        'event1': 'http://localhost/afterhook1'
      }
    }
    const hook = new Hook((data, p2) => {
      assert.deepEqual(data, complexDate)
      assert.deepEqual(p2, {a: 3})
      return data.events
    }, complexDate, {a: 3})
    assertNock('/afterhook1', {a: 1}, null, done)
    hook.triger('event1', {a: 1})
  })
  it('.use', (done) => {
    const hook = new Hook({
      event1: 'http://localhost/afterhook1'
    })
    hook.use((opt) => {
      opt.headers.Cookie = 'a=b&c=d'
    })
    const scope = nock('http://localhost')
    .matchHeader('Cookie', 'a=b&c=d')
    .post('/afterhook1', (posted) => {
      assert.deepEqual(posted, {a: 1})
      return true
    })
    .reply(200, {
      ok: true
    })
    hook.triger('event1', {a: 1})
    scope.on('replied', () => {
      done()
    })
  })

  it('.use throw', (done) => {
    const hook = new Hook({
      event1: 'http://localhost/afterhook1'
    })
    hook.use((opt) => {
      opt.headers.Cookie = 'a=b&c=d'
    })
    const scope = nock('http://localhost')
    .matchHeader('Cookie', 'a=b&c=m')
    .post('/afterhook1', (posted) => {
      assert.deepEqual(posted, {a: 1})
      return true
    })
    .reply(200, {
      ok: true
    })
    hook.triger('event1', {a: 1})
    setTimeout(() => {
      assert.throws(() => {
        scope.done()
      })
      done()
    }, 1500)
  })
})
