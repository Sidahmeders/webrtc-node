
if (room !== '') {
  socket.emit('create or join', room)
}

socket.on('created', (room) => {
  isInitiator = true
})

socket.on('full', (room) => {
  console.log('Room ' + room + ' is full')
})

socket.on('join', (room) => {
  isChannelReady = true
})

socket.on('joined', (room) => {
  isChannelReady = true
})

function sendMessage(message) {
  socket.emit('message', message)
}

// This client receives a message
socket.on('message', (message) => {
  if (message === 'got user media') maybeStart()
  else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) maybeStart()
    pc.setRemoteDescription(new RTCSessionDescription(message))
    doAnswer()
  } 
  else if (message.type === 'answer' && isStarted) pc.setRemoteDescription(new RTCSessionDescription(message))
  else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    })
    pc.addIceCandidate(candidate)
  }
  else if (message === 'bye' && isStarted) handleRemoteHangup()
})

navigator.mediaDevices
.getUserMedia({ audio: false, video: true })
.then(gotStream)
.catch(err => alert('getUserMedia() error: ' + err.name))

function gotStream(stream) {
  localStream = stream
  localVideo.srcObject = stream
  sendMessage('got user media')
  if (isInitiator) maybeStart()
}

if (location.hostname !== 'localhost')
  requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913')

function maybeStart() {
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    createPeerConnection()
    pc.addStream(localStream)
    isStarted = true
    if (isInitiator) doCall()
  }
}

window.onbeforeunload = () => sendMessage('bye')

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(null)
    pc.onicecandidate = handleIceCandidate
    pc.onaddstream = handleRemoteStreamAdded
    pc.onremovestream = handleRemoteStreamRemoved
  } catch (err) {
    alert('Cannot create RTCPeerConnection object.', err.message)
    return
  }
}

function handleIceCandidate(event) {
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    })
  } else {
    console.log('End of candidates.')
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event)
}

function doCall() {
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError)
}

function doAnswer() {
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  )
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription)
  console.log('setLocalAndSendMessage sending message', sessionDescription)
  sendMessage(sessionDescription)
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString())
}

function requestTurn(turnURL) {
  var turnExists = false
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
      turnExists = true
      turnReady = true
      break
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText)
        pcConfig.iceServers.push({
          'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        })
        turnReady = true
      }
    }
    xhr.open('GET', turnURL, true)
    xhr.send()
  }
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.')
  remoteStream = event.stream
  remoteVideo.srcObject = remoteStream
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event)
}

function hangup() {
  stop()
  sendMessage('bye')
}

function handleRemoteHangup() {
  stop()
  isInitiator = false
}

function stop() {
  isStarted = false
  pc.close()
  pc = null
}