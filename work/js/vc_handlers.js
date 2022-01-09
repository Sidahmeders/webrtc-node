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

    otherPeer.addIceCandidate(newIceCandidate)
      .then(() => console.log('ice candidate added successfully.'))
      .catch((err) => console.log(err))
  }
}

export function setDescriptionError(error) {
  console.log(getPeerName(), 'set Description error:', error)
}

export function setDescriptionSuccess(peerConnection) {
  console.log(getPeerName(peerConnection), 'set description success')
}


function getOtherPeer(peerConnection) {
  return (peerConnection === localPeerConnection) ? remotePeerConnection : localPeerConnection
}

function getPeerName(peerConnection) {
  return (peerConnection === localPeerConnection) ? 'localPeerConnection' : 'remotePeerConnection'
}