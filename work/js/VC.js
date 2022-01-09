import { handleConnection, handleConnectionChange } from './handlers.js'
import createdOffer from './createdOffer.js'

let mediaStreamConstraints = { video: true }
let offerOptions = { offerToReceiveVideo: 1 }
let localStream, remoteStream

// Define peer connections, streams and video elements, and action buttons.
const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
const startButton = document.getElementById('VC_startBtn')
const callButton = document.getElementById('VC_callBtn')
const hangupButton = document.getElementById('VC_hangupBtn')

startButton.onclick = startAction
callButton.onclick = callAction
hangupButton.onclick = hangupAction

function handleLocalMediaStream(mediaStream) {
  localVideo.srcObject = mediaStream
  localStream = mediaStream
}

function handleRemoteMediaStream(event) {
  const mediaStream = event.streams[0]
  remoteVideo.srcObject = mediaStream
  remoteStream = mediaStream
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
}

// Handles call button action: creates peer connection.
function callAction() {
  callButton.disabled = true
  hangupButton.disabled = false

  // Create peer connections and add behavior.
  localPeerConnection = new RTCPeerConnection(STUNServers)
  localPeerConnection.onicecandidate = handleConnection
  localPeerConnection.oniceconnectionstatechange = handleConnectionChange

  remotePeerConnection = new RTCPeerConnection(STUNServers)
  remotePeerConnection.onicecandidate = handleConnection
  remotePeerConnection.ontrack = handleRemoteMediaStream

  // Add local stream to connection and create offer to connect.
  localStream.getTracks().forEach((track) => localPeerConnection.addTrack(track, localStream))
  localPeerConnection.createOffer(offerOptions).then(createdOffer)
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
