
export function handleConnectionChange(event) {
  const peerConnection = event.target
  console.log('ICE state change event: ', event)
  console.log(`ICE state: ${peerConnection.iceConnectionState}.`)
}

