import React, { useRef, useState, useEffect } from 'react';
import './FocusSpotlight.scss';

interface FocusSpotlightProps {
    image: string;
}

const FocusSpotlight: React.FC<FocusSpotlightProps> = ({ image }) => {
    const spotlightRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [position, setPosition] = useState({ x: -9999, y: -9999 });

    const updatePosition = (clientX: number, clientY: number) => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        setPosition({ x, y });
    };



    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            let clientX = 0;
            let clientY = 0;

            if (e instanceof TouchEvent && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if (e instanceof MouseEvent) {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            updatePosition(clientX, clientY);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
        };
    }, []);

    useEffect(() => {
        if (spotlightRef.current) {
            spotlightRef.current.style.setProperty('--x', `${position.x}px`);
            spotlightRef.current.style.setProperty('--y', `${position.y}px`);
        }
    }, [position]);

    return (
        <div className="spotlight-background">
            <div className="background-wrapper" ref={wrapperRef}>
                <img src={image} alt="Blurred background" className="background blurred" />
                <div ref={spotlightRef} className="spotlight">
                    <img src={image} alt="Focused background" className="background focused" />
                </div>
            </div>
        </div>
    );

};

export default FocusSpotlight;
