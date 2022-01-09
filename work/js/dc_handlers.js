
export function onAddIceCandidateError(error) {
    console.log('Failed to add Ice Candidate: ' + error.toString())
}

export function onCreateSessionDescriptionError(error) {
    console.log('Failed to create session description: ' + error.toString())
}

export function onAddIceCandidateSuccess() {
    console.log('AddIceCandidate success.')
}
