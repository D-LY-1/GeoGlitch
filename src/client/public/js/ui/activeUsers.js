import { getActiveUsers } from '../services/user.api.js';

export async function updateActiveUsersList() {
  try {
    const users = await getActiveUsers();
    const usersListEl = document.getElementById('usersList');
    usersListEl.innerHTML = '';

    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = `${user.nickname} (${user.position ? `${user.position.lat.toFixed(4)}, ${user.position.lng.toFixed(4)}` : 'Position inconnue'})`;
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        console.log(`Clic sur ${user.nickname}`);
      });
      usersListEl.appendChild(li);
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la liste des utilisateurs:', error);
  }
}
