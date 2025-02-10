/**
 * The interval (in milliseconds) used to update user information.
 */
export const USER_UPDATE_INTERVAL = 5_000;

/**
 * An object containing WebSocket event names used for signaling.
 */
export const WS_EVENTS = {
  CONNECTION: 'connection',          // Fired when a new WebSocket connection is established.
  POSITION_UPDATE: 'positionUpdate', // Fired when a user's position is updated.
  USER_DISCONNECTED: 'userDisconnected' // Fired when a user disconnects.
};
