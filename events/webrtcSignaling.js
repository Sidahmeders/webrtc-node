import os from 'os'

export default function handleWebRtcSignaling({ socket, io }) {
  socket.on('message', (room, payload) => {
    const event = payload?.type ? payload.type : 'candidate'
    socket.to(room).emit(event, payload) //sending to sender client, only if they are in 'game' room(channel)
  })

  socket.on('create-join', (room) => {
    const clientsInRoom = socket.adapter.rooms.get(room)
    const numClients = clientsInRoom ? clientsInRoom.size : 0

    if (numClients === 0) {
      socket.join(room)
      socket.emit('created', room, socket.id)
    } else if (numClients < 3) {
      io.sockets.in(room).emit('join', room)
      socket.join(room)
      socket.emit('joined', room, socket.id)
    } else { // max two clients
      socket.emit('full', room)
    }
  })

  socket.on('ipaddr', () => {
    const ifaces = os.networkInterfaces()
    for (let dev in ifaces) {
      let devIfcae = ifaces[dev]
      devIfcae.forEach(details => {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address)
        }
      })
    }
  })
}