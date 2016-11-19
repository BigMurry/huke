import {assert} from 'chai'
import nock from 'nock'
import Hook from '..'

function assertNock (path, data, host) {
  nock(host || 'http://localhost')
    .post(path, (posted) => {
      !!data && assert.deepEqual(posted, data)
      return true
    })
    .reply(200, {
      ok: true
    })
}
describe('hook should work', () => {
  it('1 event, 1 url', () => {
    const hook = new Hook()
    assertNock('/afterhook', {a: 1, b: 2})
    hook.subscribe('event1', 'http://localhost/afterhook')
    hook.triger('event1', {a: 1, b: 2})
  })
  it('1 event, 2 url', () => {
    const hook = new Hook()
    hook.subscribe('event1', 'http://localhost/afterhook1')
    hook.subscribe('event1', 'http://localhost/afterhook2')
    assertNock('/afterhook1', {a: 1})
    assertNock('/afterhook2', {a: 1})
    hook.triger('event1', {a: 1})
  })
  it('2 event, 1 url', () => {
    const hook = new Hook()
    hook.subscribe('event1', 'http://localhost/afterhook')
    hook.subscribe('event2', 'http://localhost/afterhook')
    assertNock('/afterhook', {a: 'from e1'})
    hook.triger('event1', {a: 'from e1'})
    assertNock('/afterhook', {a: 'from e2'})
    hook.triger('event2', {a: 'from e2'})
  })
  it('2 event, 2 url', () => {
    const hook = new Hook()
    hook.subscribe('event1', 'http://localhost/afterhook1')
    hook.subscribe('event2', 'http://localhost/afterhook2')
    assertNock('/afterhook1', {a: 1})
    assertNock('/afterhook2', {a: 2})
    hook.triger('event1', {a: 1})
    hook.triger('event2', {a: 2})
  })
  it('.constructor(object)', () => {
    const hook = new Hook({
      event1: 'http://localhost/afterhook1',
      event2: 'http://localhost/afterhook2'
    })
    assertNock('/afterhook1', {a: 1})
    assertNock('/afterhook2', {a: 2})
    hook.triger('event1', {a: 1})
    hook.triger('event2', {a: 2})
  })
  it('.constructor(fn, p1, p2)', () => {
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
    assertNock('/afterhook1', {a: 1})
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
    setTimeout(() => {
      scope.done()
      done()
    }, 1500)
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
