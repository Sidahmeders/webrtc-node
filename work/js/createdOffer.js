// Logs offer creation and sets peer connection session descriptions.
export default function createdOffer(desc) {
  localPeerConnection.setLocalDescription(desc)
  remotePeerConnection.setRemoteDescription(desc)
  remotePeerConnection.createAnswer().then(createdAnswer)
}

// Logs answer to offer creation and sets peer connection session descriptions.
function createdAnswer(desc) {
  remotePeerConnection.setLocalDescription(desc)
  localPeerConnection.setRemoteDescription(desc)
}