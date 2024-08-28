import React, { useState, useEffect } from 'react';

const PTZVideoStream: React.FC = () => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const zoomIn = () => {
        setScale((prevScale) => prevScale + 0.2);
    };

    const zoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - 0.2, 1));
    };

    const move = (direction: 'up' | 'down' | 'left' | 'right') => {
        const movementStep = 20;
        setPosition((prevPosition) => {
            const videoElement = document.querySelector('video') as HTMLVideoElement;
            if (!videoElement) return prevPosition;

            const videoWidth = videoElement.videoWidth * scale;
            const videoHeight = videoElement.videoHeight * scale;
            const containerWidth = videoElement.parentElement!.offsetWidth;
            const containerHeight = videoElement.parentElement!.offsetHeight;

            let newX = prevPosition.x;
            let newY = prevPosition.y;

            switch (direction) {
                case 'up':
                    newY = Math.min(newY + movementStep, 0);
                    break;
                case 'down':
                    newY = Math.max(newY - movementStep, containerHeight - videoHeight);
                    break;
                case 'left':
                    newX = Math.min(newX + movementStep, 0);
                    break;
                case 'right':
                    newX = Math.max(newX - movementStep, containerWidth - videoWidth);
                    break;
                default:
                    break;
            }

            return { x: newX, y: newY };
        });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
            case '+':
                zoomIn();
                break;
            case '-':
                zoomOut();
                break;
            case 'ArrowUp':
                move('up');
                break;
            case 'ArrowDown':
                move('down');
                break;
            case 'ArrowLeft':
                move('left');
                break;
            case 'ArrowRight':
                move('right');
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [scale, position]);

    return (
        <div className="relative flex justify-center items-center mt-4 h-[calc(100vh-8rem)] bg-none videoWrapper">
            <video
                className="object-fill h-[calc(100vh-8rem)] w-full"
                loop
                autoPlay
                controls
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                style={{
                    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease',
                }}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default PTZVideoStream;
