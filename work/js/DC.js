import { onAddIceCandidateError, onCreateSessionDescriptionError, onAddIceCandidateSuccess } from './dc_handlers.js'

var localConnection
var remoteConnection
var sendChannel
var receiveChannel
var pcConstraint
var dataConstraint

var dataChannelSend = document.querySelector('textarea#dataChannelSend')
var dataChannelReceive = document.querySelector('textarea#dataChannelReceive')
var startButton = document.getElementById('DC_startBtn')
var sendButton = document.getElementById('DC_sendBtn')
var closeButton = document.getElementById('DC_closeBtn')

startButton.onclick = createConnection
sendButton.onclick = sendData
closeButton.onclick = closeDataChannels

function createConnection() {
  dataChannelSend.placeholder = ''
  pcConstraint = null
  dataConstraint = null
  
  window.localConnection = localConnection = new RTCPeerConnection(STUNServers, pcConstraint)
  sendChannel = localConnection.createDataChannel('sendDataChannel', dataConstraint)

  localConnection.onicecandidate = iceCallback1
  sendChannel.onopen = onSendChannelStateChange
  sendChannel.onclose = onSendChannelStateChange

  window.remoteConnection = remoteConnection = new RTCPeerConnection(STUNServers, pcConstraint)
  remoteConnection.onicecandidate = iceCallback2
  remoteConnection.ondatachannel = receiveChannelCallback

  localConnection.createOffer().then(gotDescription1, onCreateSessionDescriptionError)
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
  
  localConnection.close()
  remoteConnection.close()
  localConnection = null
  remoteConnection = null

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
  localConnection.setLocalDescription(desc)
  remoteConnection.setRemoteDescription(desc)
  remoteConnection.createAnswer().then(gotDescription2, onCreateSessionDescriptionError)
}

function gotDescription2(desc) {
  remoteConnection.setLocalDescription(desc)
  localConnection.setRemoteDescription(desc)
}

function iceCallback1(event) {
  if (event.candidate) {
    remoteConnection.addIceCandidate(event.candidate)
    .then(onAddIceCandidateSuccess, onAddIceCandidateError)
  }
}

function iceCallback2(event) {
  if (event.candidate) {
    localConnection.addIceCandidate(event.candidate)
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
