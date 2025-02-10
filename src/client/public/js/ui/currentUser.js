/**
 * Updates the current user's information in the UI.
 * It sets the text content of the elements with IDs 'userId' and 'nickname' to display
 * the current user's ID and nickname.
 *
 * @param {string} userId - The current user's identifier.
 * @param {string} nickname - The current user's nickname.
 */
export async function updateCurrentUser(userId, nickname) {
  try {
    document.getElementById('userId').textContent = userId;
    document.getElementById('nickname').textContent = nickname;
  } catch (error) {
    console.error('Error updating current user info:', error);
  }
}