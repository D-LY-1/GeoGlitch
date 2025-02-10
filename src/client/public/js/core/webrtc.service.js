import { updateParticipantCountInterface } from '../ui/participantCount.js';

export class WebRTCService {
  /**
   * Constructs the WebRTCService instance.
   * @param {Object} wsClient - The WebSocket client used for signaling.
   */
  constructor(wsClient) {
      this.wsClient = wsClient;
      this.peerConnections = new Map();  // Map of RTCPeerConnection objects keyed by targetUserId
      this.localStream = null;           // The local media stream (audio/video)
      this.mediaConstraints = {          // Constraints for getUserMedia
          video: true,
          audio: true
      };
      this.participantCount = 0;         // Counter for the number of participants
      this.remoteVideos = new Map();     // Map of remote video elements keyed by targetUserId
  }

  /**
   * Updates the WebSocket client instance.
   * @param {Object} wsClient - The new WebSocket client.
   */
  setWsClient(wsClient) {
    this.wsClient = wsClient;
  }

  /**
   * Initializes the local media stream.
   * Requests user media, sets the local video element's source,
   * and updates the participant count.
   */
  async init() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
      document.getElementById('localVideo').srcObject = this.localStream;
      this.updateParticipantCount(1);
    } catch (error) {
      console.error('Error accessing local media:', error);
    }
  }

  /**
   * Creates and configures a new RTCPeerConnection for a target user.
   * Sets up event handlers for track reception, ICE candidates, and connection state changes.
   * Adds local media tracks to the connection.
   * @param {string} targetUserId - The identifier of the remote user.
   * @returns {RTCPeerConnection} The configured RTCPeerConnection instance.
   */
  async createPeerConnection(targetUserId) {
      const configuration = {
          iceServers: [{
              urls: "stun:stun.l.google.com:19302"
          }]
      };

      const peerConnection = new RTCPeerConnection(configuration);
      this.peerConnections.set(targetUserId, peerConnection);

      // When remote tracks are received, create a video element to display the remote stream.
      peerConnection.ontrack = (event) => {
        const remoteVideo = document.createElement('video');
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;
        remoteVideo.srcObject = event.streams[0];
        document.getElementById('remoteVideos').appendChild(remoteVideo);
        this.remoteVideos.set(targetUserId, remoteVideo);
        this.updateParticipantCount(1);
      };

      // Monitor connection state and remove remote video when connection is closed.
      peerConnection.onconnectionstatechange = () => {
        if (['disconnected', 'failed', 'closed'].includes(peerConnection.connectionState)) {
          const video = this.remoteVideos.get(targetUserId);
          if (video) {
            video.remove();
            this.remoteVideos.delete(targetUserId);
            this.updateParticipantCount(-1);
          }
        }
      };

      // Send any ICE candidates to the remote peer via the signaling channel.
      peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
              this.wsClient.send({
                  type: 'iceCandidate',
                  targetUserId,
                  candidate: event.candidate
              });
          }
      };

      // Add each track from the local media stream to the connection.
      this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream);
      });

      return peerConnection;
  }

  /**
   * Updates the participant count and refreshes the UI.
   * @param {number} change - The value to add (or subtract) from the current count.
   */
  updateParticipantCount(change) {
    this.participantCount += change;
    updateParticipantCountInterface(this.participantCount);
  }

  /**
   * Creates an SDP offer for a connection to a target user and sends it via the signaling channel.
   * @param {string} targetUserId - The identifier of the remote user.
   */
  async createOffer(targetUserId) {
      const peerConnection = await this.createPeerConnection(targetUserId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      this.wsClient.send({
          type: 'offer',
          targetUserId,
          offer
      });
  }

  /**
   * Handles an incoming SDP offer from a remote user.
   * Sets the received offer as the remote description, creates an answer,
   * and sends the answer back via the signaling channel.
   * @param {string} senderUserId - The identifier of the remote user who sent the offer.
   * @param {RTCSessionDescriptionInit} offer - The SDP offer.
   */
  async handleOffer(senderUserId, offer) {
    if (!this.localStream) {
      console.error('Local stream not initialized');
      return;
    }
  
    const peerConnection = await this.createPeerConnection(senderUserId);
    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      this.wsClient.send({
        type: 'answer',
        targetUserId: senderUserId,
        answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  /**
   * Handles an incoming SDP answer from a remote user.
   * Sets the received answer as the remote description of the corresponding peer connection.
   * @param {string} senderUserId - The identifier of the remote user who sent the answer.
   * @param {RTCSessionDescriptionInit} answer - The SDP answer.
   */
  async handleAnswer(senderUserId, answer) {
      const peerConnection = this.peerConnections.get(senderUserId);
      if (peerConnection) {
          await peerConnection.setRemoteDescription(answer);
      }
  }

  /**
   * Handles an incoming ICE candidate from a remote user.
   * Adds the candidate to the corresponding peer connection.
   * @param {string} senderUserId - The identifier of the remote user who sent the ICE candidate.
   * @param {RTCIceCandidateInit} candidate - The ICE candidate.
   */
  async handleIceCandidate(senderUserId, candidate) {
    const peerConnection = this.peerConnections.get(senderUserId);
    if (peerConnection && peerConnection.remoteDescription) {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (error) {
        console.error('ICE candidate error:', error);
      }
    }
  }

  /**
   * Toggles the local video track on or off.
   */
  toggleVideo() {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
      }
  }

  /**
   * Toggles the local audio track on or off.
   */
  toggleAudio() {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
      }
  }
}