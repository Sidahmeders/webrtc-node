import requestTurn from "./requestTURN.js"

if (room !== '') {
  socket.emit('create or join', room)
}

socket.on('created', () => {
  isInitiator = true
})

socket.on('join', () => {
  isChannelReady = true
})

socket.on('joined', () => {
  isChannelReady = true
})

socket.on('full', (room) => {
  console.log('Room ' + room + ' is full')
})

function sendMessage(message) {
  socket.emit('message', message)
}

// This client receives a message
socket.on('message', (message) => {
  if (message === 'user-media') maybeStart()
  else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) maybeStart()
    peerConnection.setRemoteDescription(new RTCSessionDescription(message))
    doAnswer()
  }
  else if (message.type === 'answer' && isStarted) peerConnection.setRemoteDescription(new RTCSessionDescription(message))
  else if (message.type === 'candidate' && isStarted) {
    let candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    })
    peerConnection.addIceCandidate(candidate)
  }
  else if (message === 'bye' && isStarted) handleRemoteHangup()
})

navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(gotStream)

function gotStream(stream) {
  localStream = stream
  localVideo.srcObject = stream
  sendMessage('user-media')
  if (isInitiator) maybeStart()
}

if (location.hostname !== 'localhost') requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913')

function maybeStart() {
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    createPeerConnection()
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream))
    isStarted = true
    if (isInitiator) doCall()
  }
}

window.onbeforeunload = () => sendMessage('bye')

function createPeerConnection() {
  try {
    peerConnection = new RTCPeerConnection(null)
    peerConnection.onicecandidate = handleIceCandidate
    peerConnection.ontrack = handleRemoteTrackAdded
  } catch (err) {
    alert('Cannot create RTCPeerConnection object.', err.message)
    return
  }
}

function handleIceCandidate(event) {
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    })
  } else {
    console.log('End of candidates.')
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event)
}

function doCall() {
  peerConnection.createOffer(setLocalAndSendMessage, handleCreateOfferError)
}

function doAnswer() {
  peerConnection.createAnswer().then(setLocalAndSendMessage)
}

function setLocalAndSendMessage(sessionDescription) {
  peerConnection.setLocalDescription(sessionDescription)
  sendMessage(sessionDescription)
}

function handleRemoteTrackAdded(event) {
  remoteStream = event.streams[0]
  remoteVideo.srcObject = remoteStream
}

// Hangups. Close peer connections
function hangup() {
  stop()
  sendMessage('bye')
}

function handleRemoteHangup() {
  stop()
  isInitiator = false
}

function stop() {
  isStarted = false
  peerConnection.close()
  peerConnection = null
}
