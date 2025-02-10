export function updateParticipantCountInterface(participantCount) {
  document.getElementById('participantCount').textContent = 
    `(${participantCount} connecté${participantCount > 1 ? 's' : ''})`;
}