import { onRemoteMediaStream } from "./utils.js"

function sendMessage(payload) {
  const message = JSON.stringify({ room, payload })
  socket.emit('message', message)
}

export async function userJoinedHandler(payload) {
  try {
    const { socketID, numClients } = JSON.parse(payload)
    localUuid = socketID
    localStream = await navigator.mediaDevices.getUserMedia(mediaConstraint)
    localVideo.srcObject = localStream
    
    peersMap[localUuid] = { id: localUuid, pc: new RTCPeerConnection(peerConfig) }
    peersMap[localUuid].pc.onicecandidate = event => event.candidate ? sendMessage(event.candidate) : null
    peersMap[localUuid].pc.ontrack = event => onRemoteMediaStream(event, undefined)
    localStream.getTracks().forEach(track => peersMap[localUuid].pc.addTrack(track, localStream))
    
    if (numClients) sendMessage({ type: 'call' })
  } catch(err) {
    console.log(err.message)
  }
}

export async function setupPeer() {
  try {
    const offerDescription = await peersMap[localUuid].pc.createOffer()
    await peersMap[localUuid].pc.setLocalDescription(new RTCSessionDescription(offerDescription)) 
    sendMessage(offerDescription)
  } catch(err) {
    console.log(err.message)
  }
}

export async function onOffer(payload) {
  try {
    await peersMap[localUuid].pc.setRemoteDescription(new RTCSessionDescription(payload))
    const answerDescription = await peersMap[localUuid].pc.createAnswer()
    await peersMap[localUuid].pc.setLocalDescription(new RTCSessionDescription(answerDescription))
    sendMessage(answerDescription)
  } catch (err) {
    console.log(err.message)
  }
}

export async function onAnswer(payload) {
  try {
    await peersMap[localUuid].pc.setRemoteDescription(new RTCSessionDescription(payload))
  } catch(err) {
    console.log(err.message)
  }
}

export async function onCandidate(payload) {
  try {
    await peersMap[localUuid].pc.addIceCandidate(new RTCIceCandidate(payload))
  } catch(err) {
    console.log(err.message)
  }
}