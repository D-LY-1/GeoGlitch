export async function updateCurrentUser(userId, nickname) {
  try {
    document.getElementById('userId').textContent = userId;
    document.getElementById('nickname').textContent = nickname;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l`utilisateur actuel:', error);
  }
}
