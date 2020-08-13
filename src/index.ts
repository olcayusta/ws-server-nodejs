import http from 'http'
import restana from 'restana'
import WebSocket, { Data } from 'ws'
import url from 'url'
import events from 'events'
import { Message } from './models/message.model'

const service = restana({
    server: http.createServer()
})

const chatServer = new WebSocket.Server({noServer: true})
const wss2 = new WebSocket.Server({noServer: true})

let wss = new WebSocket.Server({
    noServer: true
})

const map = new Map()

const eventEmitter = new events.EventEmitter()

const listener1 = () => {
    console.log('listener1 executed')
}

export interface SocketData {
    'event': string,
    'payload': any
}

eventEmitter.on('welcome', (msg: Message) => {
    /*  console.log('Welcome event emitted!', data)
     console.log('Hello from foo CHAT SERVER')
     sender = msg.sender
     map.set(sender, ws)
     console.log(`Received message ${msg} from user`)
     console.log('Size', map.size);
     chatServer.clients.forEach(client => {
         client.send(msg)
     }) */
})

chatServer.on('connection', (ws: WebSocket, request: http.IncomingMessage, client: any) => {
    let sender = null

    ws.on('message', (msg: Message) => {
        sender = msg.sender
        map.set(sender, ws)
        console.log(`Received message ${msg} from user`)
        // console.log('Size', map.size);
        chatServer.clients.forEach(client => {
            client.send(msg)
        })

        /*  const event = JSON.parse(msg).event
         const payload = JSON.parse(msg).payload
         eventEmitter.addListener(event, listener1)
         eventEmitter.emit(event, payload) */
    })

    ws.on('close', (id: any) => {
        map.delete(id)
    })
})

function getSocketById(id: number) {
    return map.get(id)
}

service.get('/', (req, res) => {
    res.send('Hello world!')
})

service.start(5000).then((server) => {
    console.log('Server starting!')
}).catch(err => console.log(err))


service.getServer().on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname

    if (pathname === '/chat') {
        chatServer.handleUpgrade(request, socket, head, function done(ws) {
            chatServer.emit('connection', ws, request)
        })
    } else if (pathname === '/notification') {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request)
        })
    } else {
        socket.destroy()
    }
})
