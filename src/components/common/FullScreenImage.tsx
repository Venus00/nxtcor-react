import React, { useState, useEffect } from 'react';

const FullScreenImage: React.FC<{ src: string }> = ({ src }) => {
    const [scale, setScale] = useState(1);

    const zoomIn = () => {
        setScale((prevScale) => prevScale + 0.2);
    };

    const zoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - 0.2, 1));
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === '+') {
            zoomIn();
        } else if (event.key === '-') {
            zoomOut();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div style={styles.container}>
            <img
                src={src}
                alt="Zoomable"
                style={{ ...styles.image, transform: `scale(${scale})` }}
            />
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed' as 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    image: {
        maxWidth: '100%',
        maxHeight: '100%',
        transition: 'transform 0.3s ease',
    },
};

export default FullScreenImage;
