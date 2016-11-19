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
})
