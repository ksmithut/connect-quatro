---
theme: ./theme.json
---

# Server-Sent Events

A simple alternative to WebSockets

---

## What's the problem?

People want to when know things happen.

- HTTP requests are triggered from the client
- We need a way for the server to talk to the client

---

### What are some ways of accomplishing this?

#### Polling

```js
setInterval(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(body => {})
    .catch(error => {})
}, 1000)
```

- Fetching data on an interval
- Usually no change to server
- Inefficient

---

### What are some ways of accomplishing this?

#### Long-Polling

```js
function fetchData () {
  fetch('/api/data')
    .then(res => res.json())
    .then(body => {})
    .catch(error => {})
    .finally(() => fetchData())
}
```

- Server keeps request open until new data is available
- More efficient than polling

---

### What are some ways of accomplishing this?

#### WebSockets

```js
const socket = new WebSocket('wss://domain.tld/socket')
socket.onopen = () => {}
socket.onmessage = event => {
  const data = JSON.parse(event.data)
}
socket.onclose = error => {}
socket.onerror = error => {}
```

- Persistent connection
- Performant for real-time two-way communication
- Manage reconnection logic by instantiating new WebSocket
- Server has to be able to upgrade request

---

### What are some ways of accomplishing this?

#### Server-Sent Events

```js
const eventSource = new EventSource('/api/data')
eventSource.addEventListener('open', () => {})
eventSource.addEventListener('message', event => {
  const data = JSON.parse(event.data)
})
eventSource.addEventListener('error', error => {})
```

- Persistent connection
- No client-sent data (outside of normal http)
- Built-in retry on disconnect
- Use existing http middleware
- Requires polyfill for IE

---

## What does Server-Sent events look like from the server?

```
HTTP/2 200 OK
Content-Type: text/event-stream
Connection: keep-alive
Cache-Control: no-cache

: this is a comment

data: This is a message

data: This is a multiline message. Separate
data: distinct events with two newline characters.

event: custom-event
data: This is a custom event
```

---

## Node.js Example:

```js
import http from 'http'
const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache'
  })
  res.write('\n')
  const interval = setInterval(() => {
    res.write(`event: ping`)
    res.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`)
  }, 1000)
  res.on('close', () => clearInterval(interval))
})
server.listen(3000)
```

---

## Other directives

```
: If the client gets disconnected, they can send a `Last-Event-Id`
: header to start where they left off (if supported)
id: bf2b4121-1503-444c-a5bd-d7d8739d913a
: Custom event names can make it easy for the client to separate
: out events with different event listeners.
event: update
: Instructs the client to wait 3000 milliseconds to reconnect if
: the connection is lost for whatever reason.
retry: 3000
: Data can be encoded however you want.
data: {"foo":"bar"}
: Every line type is optional
: Lines starting with `:` are ignored. Just comments :)
: Comment-only "events" can be used to prevent connections from
: timing out.
```

---

## Limitations

- No client-sent events over same requests
  <br />
  <br />
- Low max number of open connections (except when using HTTP/2)
  <br />
  <br />
- `Last-Event-Id` header is only sent on reconnections
  <br />
  <br />
- Need polyfill for IE

---

## Limitations

- No client-sent events over same requests
  - You can still call normal APIs
    <br />
- Low max number of open connections (except when using HTTP/2)
  - Max is 6, but with HTTP/2 default is 100
    <br />
- `Last-Event-Id` header is only sent on reconnections
  - Store last event and pass as query parameter
    <br />
- Need polyfill for IE
  - Pretty lightweight polyfill

---

## What are Server-Sent Events good for?

- Web notifications
- Real-time data dashboards
- Chat applications
- Turn-based multiplayer games

## What are Server-Sent Events not good for?

- Real-time collaboration (a la Google Docs)
- Real-time multiplayer games
- Serverless

---

# Example
