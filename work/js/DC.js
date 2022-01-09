import { onAddIceCandidateError, onCreateSessionDescriptionError, onAddIceCandidateSuccess } from './dc_handlers.js'

let sendChannel, receiveChannel
let pcConstraint = null, dataConstraint = null

let startButton = document.getElementById('DC_startBtn')
let sendButton = document.getElementById('DC_sendBtn')
let closeButton = document.getElementById('DC_closeBtn')
let dataChannelSend = document.querySelector('textarea#dataChannelSend')
let dataChannelReceive = document.querySelector('textarea#dataChannelReceive')

startButton.onclick = createConnection
sendButton.onclick = sendData
closeButton.onclick = closeDataChannels

function createConnection() {
  dataChannelSend.placeholder = ''
  
  localPeerConnection = new RTCPeerConnection(STUNServers, pcConstraint)
  sendChannel = localPeerConnection.createDataChannel('sendDataChannel', dataConstraint)

  localPeerConnection.onicecandidate = iceCallback1
  sendChannel.onopen = onSendChannelStateChange
  sendChannel.onclose = onSendChannelStateChange

  remotePeerConnection = new RTCPeerConnection(STUNServers, pcConstraint)
  remotePeerConnection.onicecandidate = iceCallback2
  remotePeerConnection.ondatachannel = receiveChannelCallback

  localPeerConnection.createOffer().then(gotDescription1, onCreateSessionDescriptionError)
  startButton.disabled = true
  closeButton.disabled = false
}

function sendData() {
  var data = dataChannelSend.value
  sendChannel.send(data)
}

function closeDataChannels() {
  sendChannel.close()
  receiveChannel.close()
  
  localPeerConnection.close()
  remotePeerConnection.close()
  localPeerConnection = null
  remotePeerConnection = null

  startButton.disabled = false
  sendButton.disabled = true
  closeButton.disabled = true
  dataChannelSend.value = ''
  dataChannelReceive.value = ''
  dataChannelSend.disabled = true
  sendButton.disabled = true
  startButton.disabled = false
}

function gotDescription1(desc) {
  localPeerConnection.setLocalDescription(desc)
  remotePeerConnection.setRemoteDescription(desc)
  remotePeerConnection.createAnswer().then(gotDescription2, onCreateSessionDescriptionError)
}

function gotDescription2(desc) {
  remotePeerConnection.setLocalDescription(desc)
  localPeerConnection.setRemoteDescription(desc)
}

function iceCallback1(event) {
  if (event.candidate) {
    remotePeerConnection.addIceCandidate(event.candidate)
    .then(onAddIceCandidateSuccess, onAddIceCandidateError)
  }
}

function iceCallback2(event) {
  if (event.candidate) {
    localPeerConnection.addIceCandidate(event.candidate)
    .then(onAddIceCandidateSuccess, onAddIceCandidateError)
  }
}

function receiveChannelCallback(event) {
  receiveChannel = event.channel
  receiveChannel.onmessage = onReceiveMessageCallback
  receiveChannel.onopen = onReceiveChannelStateChange
  receiveChannel.onclose = onReceiveChannelStateChange
}

function onReceiveMessageCallback(event) {
  dataChannelReceive.value = event.data
}

function onSendChannelStateChange() {
  var readyState = sendChannel.readyState
  if (readyState === 'open') {
    dataChannelSend.disabled = false
    dataChannelSend.focus()
    sendButton.disabled = false
    closeButton.disabled = false
  } else {
    dataChannelSend.disabled = true
    sendButton.disabled = true
    closeButton.disabled = true
  }
}

function onReceiveChannelStateChange() {
  var readyState = receiveChannel.readyState
  console.log('Receive channel state is: ' + readyState)
}
