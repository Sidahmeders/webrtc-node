import path from 'path'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

import webrtcSignaling from './events/webrtcSignaling.js'


const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(express.static(path.join(path.resolve(), '/work')))

app.get('/', (_, res) => res.render('index'))

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`app server running on port ${PORT}...`))

io.sockets.on('connection', (socket) => {
  webrtcSignaling({ socket, io })
})