/**
 * Retrieves the list of active users from the API.
 * @returns {Promise<Array>} A promise that resolves with an array of active user objects.
 * @throws {Error} If the HTTP response is not ok.
 */
export async function getActiveUsers() {
  const response = await fetch(`/api/users`);
  if (!response.ok) {
    throw new Error(`Error fetching users: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Retrieves a specific user by their userId from the API.
 * @param {string} userId - The identifier of the user to fetch.
 * @returns {Promise<Object>} A promise that resolves with the user object.
 * @throws {Error} If the HTTP response is not ok.
 */
export async function getUser(userId) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`Error fetching user: ${response.statusText}`);
  }
  return await response.json();
}
