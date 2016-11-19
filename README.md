# huke
[![NPM](https://nodei.co/npm/huke.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/huke/)

A simple webhook module

## Install and test
```shell
# install from npm
npm install huke

# run all the tests
npm install
npm test
```
## Basic Logic

By subscribing an event with the webhook and providing a url, when the webhook triger the corresponding event, a POST request is sent to the binding url.

## Quick Usage
```javascript
import Hook from 'huke'
const hook = new Hook()
hook.subscribe('event1', 'http://localhost/aftertriger')
hook.triger('event1', {a: 1, b: 2})
```

## Reference
### `constructor`
```javascript
// create empty hook instance
const hook0 = new Hook()

// can pass a object
const hook1 = new Hook({event1: 'http://localhost/aftertriger'})

// or pass a function to return the configure object
const hook2 = new Hook((fullObj) => {
  assert.deepEqual(fullObj, {a: 1, b: 2, events: {event1: 'http://localhost/aftertriger'}})
  return fullObj.events
}, {a: 1, b: 2, events: {event1: 'http://localhost/aftertriger'}})
```

### `subscribe`
```javascript
const hook = new Hook()
hook.subscribe('event1', 'http://localhost/aftertriger')
```
### `triger`
```javascript
hook.triger('event1', {a: 1, b: 2})
```
### `use`
```javascript
// configure the post request options before send the request
hook.use((opt) => {
  opt.headers.Cookie = 'a=b&c=d&e=f'
})
hook.use((opt) => {
  opt.auth = 'user:passphase'
})
```
