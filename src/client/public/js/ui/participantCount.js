/**
 * Updates the participant count display in the UI.
 * It sets the text content of the element with ID 'participantCount' to show the number
 * of connected participants.
 *
 * @param {number} participantCount - The current number of connected participants.
 */
export function updateParticipantCountInterface(participantCount) {
  document.getElementById('participantCount').textContent =
    `(${participantCount} connected${participantCount > 1 ? 's' : ''})`;
}