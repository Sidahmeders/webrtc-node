const mediaStreamConstraints = { video: true}
const offerOptions = { offerToReceiveVideo: 1 }
const STUNServers = null
let localStream, remoteStream
let localPeerConnection, remotePeerConnection

// Define peer connections, streams and video elements, and action buttons.
const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
const startButton = document.getElementById('startBtn')
const callButton = document.getElementById('callBtn')
const hangupButton = document.getElementById('hangupBtn')

startButton.addEventListener('click', startAction)
callButton.addEventListener('click', callAction)
hangupButton.addEventListener('click', hangupAction)

function handleLocalMediaStream(mediaStream) {
  localVideo.srcObject = mediaStream
  localStream = mediaStream
}

function handleRemoteMediaStream(event) {
  const mediaStream = event.streams[0]
  remoteVideo.srcObject = mediaStream
  remoteStream = mediaStream
}

// Connects with new peer candidate.
function handleConnection(event) {
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

// Logs offer creation and sets peer connection session descriptions.
function createdOffer(description) {

  localPeerConnection
    .setLocalDescription(description)
    .then(() => console.log('set local description success...'))
    .catch(err => console.log(err))

  remotePeerConnection
    .setRemoteDescription(description)
    .then(() => console.log('set remote description success'))
    .catch(err => console.log(err))

  remotePeerConnection
    .createAnswer()
    .then(createdAnswer)
    .catch(err => console.log(err))
}

// Logs answer to offer creation and sets peer connection session descriptions.
function createdAnswer(description) {
  remotePeerConnection.setLocalDescription(description)
    .then(() => console.log('set local description success...'))
    .catch(err => console.log(err))

  localPeerConnection.setRemoteDescription(description)
    .then(() => console.log('set remote description success'))
    .catch(err => console.log(err))
}

// Set up initial action buttons status: disable call and hangup.
callButton.disabled = true
hangupButton.disabled = true


// Handles start button action: creates local MediaStream.
function startAction() {
  startButton.disabled = true
  callButton.disabled = false

  navigator.mediaDevices
    .getUserMedia(mediaStreamConstraints)
    .then(handleLocalMediaStream)
    .catch(err => console.log(err))
}

// Handles call button action: creates peer connection.
function callAction() {
  callButton.disabled = true
  hangupButton.disabled = false

  // Create peer connections and add behavior.
  localPeerConnection = new RTCPeerConnection(STUNServers)
  localPeerConnection.onicecandidate = handleConnection

  remotePeerConnection = new RTCPeerConnection(STUNServers)
  remotePeerConnection.onicecandidate = handleConnection
  remotePeerConnection.ontrack = handleRemoteMediaStream

  // Add local stream to connection and create offer to connect.
  
  console.log(localStream)
  localStream.getTracks().forEach((track) => localPeerConnection.addTrack(track, localStream))
  localPeerConnection.createOffer(offerOptions).then(createdOffer).catch(err => console.log(err))
}

// Handles hangup action: ends up call, closes connections and resets peers.
function hangupAction() {
  localPeerConnection.close()
  remotePeerConnection.close()
  localPeerConnection = null
  remotePeerConnection = null
  hangupButton.disabled = true
  callButton.disabled = false
}

// Gets the "other" peer connection.
function getOtherPeer(peerConnection) {
  return (peerConnection === localPeerConnection) ? remotePeerConnection : localPeerConnection
}