// Connects with new peer candidate.
export function handleConnection(event) {
  const peerConnection = event.target
  const iceCandidate = event.candidate
  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate)
    const otherPeer = getOtherPeer(peerConnection)
    otherPeer.addIceCandidate(newIceCandidate).then(onAddIceCandidateSuccess, onAddIceCandidateError)
  }
}

function onAddIceCandidateSuccess() {
  console.log('AddIceCandidate success.')
}

function onAddIceCandidateError(error) {
  console.log('Failed to add Ice Candidate: ' + error.toString())
}

function getOtherPeer(peerConnection) {
  return (peerConnection === localPeerConnection) ? remotePeerConnection : localPeerConnection
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

function sendMessage(payload) {
  socket.emit('message', payload)
}

export function onOffer(payload) {
  if (!isInitiator && !isStarted) maybeStart()
  peerConnection.setRemoteDescription(new RTCSessionDescription(payload))
  doAnswer()
}
function doAnswer() {
  peerConnection.createAnswer().then(setLocalAndSendMessage, err => alert(err.message))
}

export function onAnswer(payload) {
  if (isStarted) peerConnection.setRemoteDescription(new RTCSessionDescription(payload))
}

export function onCandidate(payload) {
  if (isStarted) {
    let candidate = new RTCIceCandidate({
      sdpMLineIndex: payload.sdpMLineIndex,
      candidate: payload.candidate
    })
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
    if (isInitiator) doCall()
  }
}
function doCall() {
  peerConnection.createOffer(setLocalAndSendMessage, err => alert(err.message))
}

function setLocalAndSendMessage(sessionDescription) {
  peerConnection.setLocalDescription(sessionDescription)
  sendMessage(sessionDescription)
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

function handleRemoteTrackAdded(event) {
  remoteStream = event.streams[0]
  remoteVideo.srcObject = remoteStream
}
