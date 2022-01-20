
export function onRemoteMediaStream(event, peerUuid = '9892kdjf') {
  //assign stream to new HTML video element
  const remoteVideosContainer = document.getElementById('videos')
  const vidElement = document.createElement('video')
  vidElement.autoplay = true
  vidElement.id = peerUuid
  vidElement.srcObject = event.streams[0]
  
  remoteVideosContainer.append(vidElement)
}