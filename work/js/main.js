import requestTurn from "./requestTURN.js"
import { onAnswer, onCandidate, onLocalMediaStream, onOffer, maybeStart } from './handlers.js'

if (room !== '') socket.emit('create-join', room)
if (location.hostname !== 'localhost') requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913')

socket.on('created', () => isInitiator = true)

socket.on('join', () => isChannelReady = true)

socket.on('joined', () => isChannelReady = true)

socket.on('full', (room) => alert('Room ' + room + ' is full'))

socket.on('user-media', () => maybeStart())

socket.on('offer', (payload) => onOffer(payload))

socket.on('answer', (payload) => onAnswer(payload))

socket.on('candidate', (payload) => onCandidate(payload))

navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(onLocalMediaStream)