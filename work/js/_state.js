var localPeerConnection 
var remotePeerConnection

var peerConnection
var isChannelReady = false
var isInitiator = false
var isStarted = false
var turnReady

var localStream
var localVideo = document.getElementById('localVideo')
var remoteVideo = document.getElementById('remoteVideo')

var STUNServers = null
var socket = io()
var room = prompt("Enter room name:")

var pcConfig = {
  iceServers: [{
    urls: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302'
    ]
  }],
  iceCandidatePoolSize: 10
}
