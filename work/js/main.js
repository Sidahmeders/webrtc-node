import requestTurn from "./requestTURN.js"

if (room !== '') socket.emit('create-join', room)

socket.on('created', () => isInitiator = true)

socket.on('join', () => isChannelReady = true)

socket.on('joined', () => isChannelReady = true)

socket.on('full', (room) => console.log('Room ' + room + ' is full'))

function sendMessage(payload) {
  socket.emit('message', payload)
}

socket.on('user-media', () => maybeStart())

socket.on('offer', (payload) => {
  if (!isInitiator && !isStarted) maybeStart()
  peerConnection.setRemoteDescription(new RTCSessionDescription(payload))
  doAnswer()
})

socket.on('answer', (payload) => {
  if (isStarted) peerConnection.setRemoteDescription(new RTCSessionDescription(payload))
})

socket.on('candidate', (payload) => {
  if (isStarted) {
    let candidate = new RTCIceCandidate({
      sdpMLineIndex: payload.sdpMLineIndex,
      candidate: payload.candidate
    })
    peerConnection.addIceCandidate(candidate)
  }
})

navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(handleLocalMediaStream)

function handleLocalMediaStream(stream) {
  localStream = stream
  localVideo.srcObject = stream
  sendMessage({ type: 'user-media' })
  if (isInitiator) maybeStart()
}

if (location.hostname !== 'localhost') requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913')

function maybeStart() {
  if (!isStarted && typeof localStream !== undefined && isChannelReady) {
    createPeerConnection()
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream))
    isStarted = true
    if (isInitiator) doCall()
  }
}

function createPeerConnection() {
  try {
    peerConnection = new RTCPeerConnection(null)
    peerConnection.onicecandidate = handleIceCandidate
    peerConnection.ontrack = handleRemoteTrackAdded
  } catch (err) {
    alert('Cannot create RTCPeerConnection object: ', err.message)
    return
  }
}

function handleIceCandidate(event) {
  const offerCandidates = event.candidate
  if (offerCandidates) sendMessage(offerCandidates)
  else console.log('End of candidates.')
}

function doCall() {
  peerConnection.createOffer(setLocalAndSendMessage, err => alert(err.message))
}

function doAnswer() {
  peerConnection.createAnswer().then(setLocalAndSendMessage, err => alert(err.message))
}

function setLocalAndSendMessage(sessionDescription) {
  peerConnection.setLocalDescription(sessionDescription)
  sendMessage(sessionDescription)
}

function handleRemoteTrackAdded(event) {
  remoteStream = event.streams[0]
  remoteVideo.srcObject = remoteStream
}
