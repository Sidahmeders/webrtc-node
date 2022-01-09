// Logs changes to the connection state.
export function handleConnectionChange(event) {
  const peerConnection = event.target
  console.log('ICE state change event: ', event)
  console.log(`ICE state: ${peerConnection.iceConnectionState}.`)
}

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

export function setDescriptionError(error) {
  console.log(getPeerName(), 'Failed to create session description: ', error)
}

export function setDescriptionSuccess(peerConnection) {
  console.log(getPeerName(peerConnection), 'set description success')
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

function getPeerName(peerConnection) {
  return (peerConnection === localPeerConnection) ? 'localPeerConnection' : 'remotePeerConnection'
}
