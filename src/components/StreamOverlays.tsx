import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

type DetectionBox = {
    x: number;
    y: number;
    w: number;
    h: number;
    label?: string;
    score?: number;
    color?: string;
};

interface Props {
    wsUrl: string;
    streamId: string;
    iframeSrc: string;
    width: number;
    height: number;
}

export default function StreamOverlays({
    wsUrl,
    streamId,
    iframeSrc,
    width,
    height,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [boxes, setBoxes] = useState<DetectionBox[]>([]);

    useEffect(() => {
        const socket = io("ws://192.168.10.160:3001", { transports: ["websocket"] });
        socket.on("detections", (msg) => {
            if (msg?.streamId === streamId) {
                setBoxes(msg.boxes || []);
            }
        });
        return () => {
            socket.disconnect();
        };

    }, [wsUrl, streamId]);

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         const randomBoxes: DetectionBox[] = [];
    //         const count = Math.floor(Math.random() * 3) + 1;
    //         for (let i = 0; i < count; i++) {
    //             randomBoxes.push({
    //                 x: Math.random() * 0.7,
    //                 y: Math.random() * 0.7,
    //                 w: 0.2 + Math.random() * 0.2,
    //                 h: 0.2 + Math.random() * 0.2,
    //                 label: `obj${i + 1}`,
    //                 score: Math.random(),
    //                 color: ["#00FF00", "#FF0000", "#00AAFF"][i % 3],
    //             });
    //         }
    //         setBoxes(randomBoxes);
    //     }, 1000);
    //     return () => clearInterval(interval);
    // }, []);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 2;
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "top";

        for (const b of boxes) {
            const x = b.x * width;
            const y = b.y * height;
            const w = b.w * width;
            const h = b.h * height;

            ctx.strokeStyle = b.color || "#00FF00";
            ctx.fillStyle = b.color || "#00FF00";
            ctx.strokeRect(x, y, w, h);

            if (b.label) {
                ctx.fillText(b.label, x, y - 14);
            }
        }
    }, [boxes, width, height]);

    return (
        <div style={{ position: "relative" }} className="bg-red-500  h-[480px]">
            <iframe
                src={iframeSrc}
                className="object-fill"

                allow="autoplay; fullscreen"

                style={{
                    transformOrigin: "center",
                    transition: "transform 0.3s ease",
                    width: "100%",
                    height: "100%",
                }}
            />
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    pointerEvents: "none",
                }}
            />
        </div>
    );
}
