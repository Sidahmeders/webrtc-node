import requestTurn from "./requestTURN.js"
import { userJoinedHandler, setupPeer, onOffer, onAnswer } from './handlers.js'

if (room !== '') socket.emit('join', room)
if (location.hostname !== 'localhost') requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913')

socket.on('joined', (payload) => userJoinedHandler(payload))

socket.on('call', (payload) => setupPeer(payload))

socket.on('offer', (payload) => onOffer(payload))
socket.on('answer', (payload) => onAnswer(payload))
socket.on('candidate', (payload) => onCandidate(payload))
