var localPeerConnection 
var remotePeerConnection

var peersMap = {}
var localUuid
var localStream
var localVideo = document.getElementById('localVideo')

var turnReady
var STUNServers = null
var socket = io()
var room = prompt("Enter room name:")

var mediaConstraint = { audio: false, video: true }
var peerConfig = {
  iceServers: [{
    urls: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302'
    ]
  }],
  iceCandidatePoolSize: 10
}
