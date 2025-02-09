export async function getActiveUsers() {
  const response = await fetch(`/api/users`); 
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des utilisateurs: ${response.statusText}`);
  }
  return await response.json();
}

export async function getUser(userId) {
  const response = await fetch(`/api/users/${userId}`); 
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des utilisateurs: ${response.statusText}`);
  }
  return await response.json();
}
