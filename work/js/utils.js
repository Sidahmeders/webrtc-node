
export function onRemoteMediaStream(event, peerUuid) {
  //assign stream to new HTML video element
  const remoteVideosContainer = document.getElementById('videos')
  const vidElement = document.createElement('video')
  vidElement.autoplay = true
  vidElement.id = `remoteVideo-${peerUuid}`
  vidElement.srcObject = event.streams[0]
  
  remoteVideosContainer.append(vidElement)
}

export function onPeerDisconnect(event, peerUuid) {
  const state = peersMap[peerUuid].pc.iceConnectionState
  if (state === "failed" || state === "closed" || state === "disconnected") {
    delete peersMap[peerUuid]
    const remoteVideosContainer = document.getElementById('videos')
    const targetVideoElement = document.getElementById(`remoteVideo-${peerUuid}`)
    remoteVideosContainer.removeChild(targetVideoElement)
  }
}