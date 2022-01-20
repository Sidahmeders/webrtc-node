import { onRemoteMediaStream } from "./utils.js"

function sendMessage(payload) {
  const message = JSON.stringify({ room, payload })
  socket.emit('message', message)
}

export async function userJoinedHandler(payload) {
  const { socketID, numClients } = JSON.parse(payload)
  localUuid = socketID
  localStream = await navigator.mediaDevices.getUserMedia(mediaConstraint)
  localVideo.srcObject = localStream

  peersMap[localUuid] = { id: localUuid, pc: new RTCPeerConnection(peerConfig) }
  peersMap[localUuid].pc.ontrack = event => onRemoteMediaStream(event, undefined)
  localStream.getTracks().forEach(track => peersMap[localUuid].pc.addTrack(track, localStream))

  if (numClients) sendMessage({ type: 'call' })
}

export async function setupPeer() {
  const offerDescription = await peersMap[localUuid].pc.createOffer()
  await peersMap[localUuid].pc.setLocalDescription(new RTCSessionDescription(offerDescription))

  sendMessage(offerDescription)
}

export async function onOffer(payload) {
  await peersMap[localUuid].pc.setRemoteDescription(new RTCSessionDescription(payload))
  const answerDescription = await peersMap[localUuid].pc.createAnswer()
  await peersMap[localUuid].pc.setLocalDescription(new RTCSessionDescription(answerDescription))

  sendMessage(answerDescription)
}

export async function onAnswer(payload) {
  await peersMap[localUuid].pc.setRemoteDescription(new RTCSessionDescription(payload))
}
