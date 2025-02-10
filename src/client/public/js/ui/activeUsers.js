import { getActiveUsers } from '../services/user.api.js';

/**
 * Updates the active users list in the UI.
 * It fetches the list of active users from the API, clears the current list,
 * then creates a list item for each user. Each item displays the user's nickname
 * and position (if available) and sets up a click handler to focus the map on that user.
 *
 * @param {string} currentUserId - The current user's ID (unused in this implementation).
 */
export async function updateActiveUsersList(currentUserId) {
  try {
    const users = await getActiveUsers();
    const usersListEl = document.getElementById('usersList');
    usersListEl.innerHTML = '';

    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = `${user.nickname} (${user.position ? `${user.position.lat.toFixed(4)}, ${user.position.lng.toFixed(4)}` : 'Position inconnue'})`;
      li.style.cursor = 'pointer';
      
      li.addEventListener('click', () => {
        window.app.mapManager.focusOnUser(user.userId);
      });

      usersListEl.appendChild(li);
    });
  } catch (error) {
    console.error('Error updating active users list:', error);
  }
}