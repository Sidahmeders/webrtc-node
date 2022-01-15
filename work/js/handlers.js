
function sendMessage(payload) {
  socket.emit('message', room, payload)
}

export function onOffer(payload) {
  if (!isInitiator && !isStarted) maybeStart()
  peerConnection.setRemoteDescription(new RTCSessionDescription(payload))
  peerConnection.createAnswer().then(setLocalAndSendMessage)
}

export function onAnswer(payload) {
  if (isStarted) peerConnection.setRemoteDescription(new RTCSessionDescription(payload))
}

export function onCandidate(payload) {
  if (isStarted) {
    let candidate = new RTCIceCandidate(payload)
    peerConnection.addIceCandidate(candidate)
  }
}

export function onLocalMediaStream(stream) {
  localStream = stream
  localVideo.srcObject = stream
  sendMessage({ type: 'user-media' })
  if (isInitiator) maybeStart()
}

export function maybeStart() {
  if (!isStarted && typeof localStream !== undefined && isChannelReady) {
    createPeerConnection()
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream))
    isStarted = true
    if (isInitiator) peerConnection.createOffer().then(setLocalAndSendMessage)
  }
}

function setLocalAndSendMessage(sessionDescription) {
  peerConnection.setLocalDescription(sessionDescription)
  sendMessage(sessionDescription)
}

function createPeerConnection() {
  peerConnection = new RTCPeerConnection(null)
  peerConnection.onicecandidate = handleIceCandidate
  peerConnection.ontrack = event =>  remoteVideo.srcObject = event.streams[0]
}

function handleIceCandidate(event) {
  const offerCandidates = event.candidate
  if (offerCandidates) sendMessage(offerCandidates)
}
