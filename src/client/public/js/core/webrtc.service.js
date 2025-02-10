import { updateParticipantCountInterface } from '../ui/participantCount.js';

export class WebRTCService {
  constructor(wsClient) {
      this.wsClient = wsClient;
      this.peerConnections = new Map();
      this.localStream = null;
      this.mediaConstraints = {
          video: true,
          audio: true
      };
      this.participantCount = 0;
      this.remoteVideos = new Map();
  }

  setWsClient(wsClient) {
    this.wsClient = wsClient;
  }

  async init() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
      document.getElementById('localVideo').srcObject = this.localStream;
      this.updateParticipantCount(1);
    } catch (error) {
      console.error('Erreur d\'accès aux médias:', error);
    }
  }

  async createPeerConnection(targetUserId) {
      const configuration = {
          iceServers: [{
              urls: "stun:stun.l.google.com:19302"
          }]
      };

      const peerConnection = new RTCPeerConnection(configuration);
      this.peerConnections.set(targetUserId, peerConnection);

      peerConnection.ontrack = (event) => {
        const remoteVideo = document.createElement('video');
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;
        remoteVideo.srcObject = event.streams[0];
        document.getElementById('remoteVideos').appendChild(remoteVideo);
        this.remoteVideos.set(targetUserId, remoteVideo);
        this.updateParticipantCount(1);
      };

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

      peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
              this.wsClient.send({
                  type: 'iceCandidate',
                  targetUserId,
                  candidate: event.candidate
              });
          }
      };

      this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream);
      });

      return peerConnection;
  }

  updateParticipantCount(change){
    this.participantCount += change;
    updateParticipantCountInterface(this.participantCount);
  }

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

  async handleOffer(senderUserId, offer) {
    if (!this.localStream) {
      console.error('Local stream non initialisé');
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
      console.error('Erreur lors du traitement de l\'offre:', error);
    }
  }

  async handleAnswer(senderUserId, answer) {
      const peerConnection = this.peerConnections.get(senderUserId);
      if (peerConnection) {
          await peerConnection.setRemoteDescription(answer);
      }
  }

  async handleIceCandidate(senderUserId, candidate) {
    const peerConnection = this.peerConnections.get(senderUserId);
    if (peerConnection && peerConnection.remoteDescription) {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (error) {
        console.error('Erreur ICE candidate:', error);
      }
    }
  }

  toggleVideo() {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
      }
  }

  toggleAudio() {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
      }
  }
}