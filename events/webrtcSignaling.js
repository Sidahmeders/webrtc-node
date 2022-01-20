
export default function handleWebRtcSignaling({ socket, io }) {
  socket.on('message', (message) => {
    const { room, payload } = JSON.parse(message)
    const event = payload?.type
    console.log(event, "+++++++")
    socket.to(room).emit(event, payload)
  })

  socket.on('join', (room) => {
    const clientsInRoom = socket.adapter.rooms.get(room)
    const numClients = clientsInRoom ? clientsInRoom.size : 0
    const payload = JSON.stringify({ socketID: socket.id, numClients })

    socket.join(room)
    socket.emit('joined', payload)
  })
}