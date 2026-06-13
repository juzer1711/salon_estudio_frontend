import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
} from "lucide-react";

import VideoCard from "../VideoGrid/VideoCard";
import { useAuthStore } from "../../store/useAuthStore";

import "./RoomPreview.css";

export default function RoomPreview() {

    const { roomId } = useParams();

    const navigate = useNavigate();

    const [stream, setStream] = useState<MediaStream | null>(null);

    const [isCameraOn, setIsCameraOn] = useState(true);

    const [isMicOn, setIsMicOn] = useState(true);

    const { profile } = useAuthStore();

    useEffect(() => {

        const startCamera = async () => {

            try {

                const mediaStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true,
                    });

                setStream(mediaStream);

            } catch (error) {

                console.error(error);

            }

        };

        startCamera();

        return () => {

            stream?.getTracks().forEach(track => track.stop());

        };

    }, []);

    const handleJoin = () => {

        navigate(`/room/${roomId}`, {
        state: {
            isCameraOn,
            isMicOn,
        },
        });

    };

    const handleCancel = () => {
        navigate(-1);
    };

    const toggleMicrophone = () => {

        if (!stream) return;

        stream.getAudioTracks().forEach(track => {

            track.enabled = !track.enabled;

        });

        setIsMicOn(previous => !previous);

    };

    const toggleCamera = () => {

        if (!stream) return;

        stream.getVideoTracks().forEach(track => {

            track.enabled = !track.enabled;

        });

        setIsCameraOn(previous => !previous);

    };

    const previewParticipant = {
        uid: profile?.uid ?? "preview",
        username: profile?.username ?? "Tú",
        avatarUrl: profile?.avatarUrl ?? "",
        socketId: "preview",
    };

    return (

        <main className="room-preview">

            <section className="room-preview__card">

                <h1 className="room-preview__title">
                    Vista previa
                </h1>

                <p className="room-preview__subtitle">
                    Comprueba tu cámara y micrófono antes de entrar.
                </p>

                <div className="room-preview__video-container">

                    <VideoCard
                        participant={previewParticipant}
                        stream={stream}
                        isLocal
                        preview
                        isMuted={!isMicOn}
                        isCameraOff={!isCameraOn}
                    />

                </div>

                <div className="room-preview__controls">

                    <button
                        className="room-preview__control"
                        onClick={toggleMicrophone}
                    >

                        {
                            isMicOn
                                ? <Mic size={22}/>
                                : <MicOff size={22}/>
                        }

                    </button>

                    <button
                        className="room-preview__control"
                        onClick={toggleCamera}
                    >

                        {
                            isCameraOn
                                ? <Video size={22}/>
                                : <VideoOff size={22}/>
                        }

                    </button>

                </div>

                <div className="room-preview__actions">

                    <button
                        className="room-preview__cancel"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>

                    <button
                        className="room-preview__join"
                        onClick={handleJoin}
                    >
                        Unirme ahora
                    </button>

                </div>

            </section>

        </main>

    );
}