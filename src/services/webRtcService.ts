// src/services/webRtcService.ts

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export interface WebRtcServiceCallbacks {
  onSendOffer: (targetSocketId: string, offer: RTCSessionDescriptionInit) => void;
  onSendAnswer: (targetSocketId: string, answer: RTCSessionDescriptionInit) => void;
  onSendIceCandidate: (targetSocketId: string, candidate: RTCIceCandidateInit) => void;
  onRemoteStream: (socketId: string, stream: MediaStream) => void;
  onPeerDisconnected: (socketId: string) => void;
}

export class WebRtcService {
  private peers = new Map<string, RTCPeerConnection>();
  private localStream: MediaStream | null = null;
  private callbacks: WebRtcServiceCallbacks;

  // Cola de candidatos ICE que llegaron ANTES de tener remoteDescription
  // Clave: socketId del peer que los envió
  private iceCandidateQueue = new Map<string, RTCIceCandidateInit[]>();

  constructor(callbacks: WebRtcServiceCallbacks) {
    this.callbacks = callbacks;
  }

  // ─────────────────────────────────────────────────────────────
  // STREAM LOCAL
  // ─────────────────────────────────────────────────────────────

  setLocalStream(stream: MediaStream): void {
    this.localStream = stream;
  }

  // ─────────────────────────────────────────────────────────────
  // CREAR PEER
  // ─────────────────────────────────────────────────────────────

  private buildPeerConnection(remoteSocketId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Añadir tracks del stream local
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Stream remoto llega
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        this.callbacks.onRemoteStream(remoteSocketId, remoteStream);
      }
    };

    // Candidatos ICE propios → enviar al peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.callbacks.onSendIceCandidate(remoteSocketId, event.candidate.toJSON());
      }
    };

    // Estado de conexión
    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        this.callbacks.onPeerDisconnected(remoteSocketId);
        this.closePeer(remoteSocketId);
      }
    };

    return pc;
  }

  // Llamado cuando NOSOTROS somos el iniciador (el que ya estaba en la sala)
  async createPeerAsInitiator(remoteSocketId: string): Promise<void> {
    // FIX: Si no tenemos stream aún, esperamos hasta 5 segundos
    if (!this.localStream) {
      await this.waitForLocalStream(5000);
    }

    // Cerrar peer anterior si existía
    this.closePeer(remoteSocketId);

    const pc = this.buildPeerConnection(remoteSocketId);
    this.peers.set(remoteSocketId, pc);

    // Crear y enviar oferta
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.callbacks.onSendOffer(remoteSocketId, offer);
  }

  // ─────────────────────────────────────────────────────────────
  // RECIBIR OFERTA — el otro peer nos manda la oferta
  // (este usuario NO es el iniciador)
  // ─────────────────────────────────────────────────────────────

  async handleOffer(
    fromSocketId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<void> {
    // FIX: Si no tenemos stream aún, esperamos
    if (!this.localStream) {
      await this.waitForLocalStream(5000);
    }
    
    // FIX: Si ya existe un peer en estado incorrecto, cerrarlo y recrear
    if (this.peers.has(fromSocketId)) {
    const existing = this.peers.get(fromSocketId)!;
    const state = existing.signalingState;

    if (state === "have-local-offer") {
        // Glare (los dos enviaron oferta al mismo tiempo)
        // El que tiene el socketId lexicográficamente menor cede
        // Cerramos y respondemos a la oferta del otro
        this.closePeer(fromSocketId);
    } else if (state !== "stable" && state !== "have-remote-offer") {
        // Si ya tenemos remote description o cualquier otro estado inválido,
        // lo cerramos para empezar limpio
        this.closePeer(fromSocketId);
    }
    }


    // Si no existe, lo creamos
    if (!this.peers.has(fromSocketId)) {
      const pc = this.buildPeerConnection(fromSocketId);
      this.peers.set(fromSocketId, pc);
    }

    const pc = this.peers.get(fromSocketId)!;

    // FIX: Solo procesamos si estamos en estado correcto
    if (pc.signalingState !== "stable" && pc.signalingState !== "have-remote-offer") {
      console.warn(`[WebRTC] Ignorando oferta de ${fromSocketId}, estado: ${pc.signalingState}`);
      return;
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.callbacks.onSendAnswer(fromSocketId, answer);

    // Aplicar candidatos ICE que llegaron antes que la oferta
    await this.flushIceCandidateQueue(fromSocketId);
  }

  // ─────────────────────────────────────────────────────────────
  // RECIBIR RESPUESTA
  // ─────────────────────────────────────────────────────────────

  async handleAnswer(
    fromSocketId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    const pc = this.peers.get(fromSocketId);
    if (!pc) {
      console.warn(`[WebRTC] handleAnswer: no existe peer para ${fromSocketId}`);
      return;
    }

    // FIX: Solo aplicar si estamos esperando respuesta
    if (pc.signalingState !== "have-local-offer") {
      console.warn(`[WebRTC] handleAnswer ignorado, estado: ${pc.signalingState}`);
      return;
    }

    await pc.setRemoteDescription(new RTCSessionDescription(answer));

    // Aplicar candidatos ICE encolados
    await this.flushIceCandidateQueue(fromSocketId);
  }

  // ─────────────────────────────────────────────────────────────
  // RECIBIR CANDIDATO ICE
  // ─────────────────────────────────────────────────────────────

  async handleIceCandidate(
    fromSocketId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    const pc = this.peers.get(fromSocketId);

    // FIX: Si no hay remoteDescription todavía, encolar el candidato
    if (!pc || !pc.remoteDescription) {
      if (!this.iceCandidateQueue.has(fromSocketId)) {
        this.iceCandidateQueue.set(fromSocketId, []);
      }
      this.iceCandidateQueue.get(fromSocketId)!.push(candidate);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn("[WebRTC] Error añadiendo candidato ICE:", err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // APLICAR CANDIDATOS ICE ENCOLADOS
  // ─────────────────────────────────────────────────────────────

  private async flushIceCandidateQueue(socketId: string): Promise<void> {
    const queue = this.iceCandidateQueue.get(socketId);
    if (!queue || queue.length === 0) return;

    const pc = this.peers.get(socketId);
    if (!pc) return;

    for (const candidate of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("[WebRTC] Error aplicando candidato encolado:", err);
      }
    }

    this.iceCandidateQueue.delete(socketId);
  }

  // ─────────────────────────────────────────────────────────────
  // MUTE / CAMERA
  // ─────────────────────────────────────────────────────────────

  updateTrackState(kind: "audio" | "video", enabled: boolean): void {
    if (!this.localStream) return;
    this.localStream.getTracks()
      .filter((t) => t.kind === kind)
      .forEach((t) => { t.enabled = enabled; });
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────

  // Espera a que localStream esté disponible (polling con timeout)
  private waitForLocalStream(timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.localStream) { resolve(); return; }

      const interval = setInterval(() => {
        if (this.localStream) {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve();
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        reject(new Error("[WebRTC] Timeout esperando localStream"));
      }, timeoutMs);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // LIMPIEZA
  // ─────────────────────────────────────────────────────────────

  closePeer(socketId: string): void {
    const pc = this.peers.get(socketId);
    if (pc) {
      pc.close();
      this.peers.delete(socketId);
    }
    this.iceCandidateQueue.delete(socketId);
  }

  closeAll(): void {
    this.peers.forEach((pc) => pc.close());
    this.peers.clear();
    this.iceCandidateQueue.clear();
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
  }
}