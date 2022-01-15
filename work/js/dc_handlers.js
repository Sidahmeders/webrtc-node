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

// Logs offer creation and sets peer connection session descriptions.
export function createdOffer(desc) {
  localPeerConnection.setLocalDescription(desc)
  remotePeerConnection.setRemoteDescription(desc)
  remotePeerConnection.createAnswer().then(createdAnswer)
}

// Logs answer to offer creation and sets peer connection session descriptions.
function createdAnswer(desc) {
  remotePeerConnection.setLocalDescription(desc)
  localPeerConnection.setRemoteDescription(desc)
}