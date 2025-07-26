import React, { useEffect, useRef } from 'react';
import './FocusSpotlight.scss';

interface FocusSpotlightProps {
    image: string;
}

const FocusSpotlight: React.FC<FocusSpotlightProps> = ({ image }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);
    const animationFrame = useRef<number | null>(null);
    const position = useRef({ x: -9999, y: -9999 });

    const updateSpotlight = () => {
        if (spotlightRef.current) {
            spotlightRef.current.style.setProperty('--x', `${position.current.x}px`);
            spotlightRef.current.style.setProperty('--y', `${position.current.y}px`);
        }
    };

    const scheduleUpdate = () => {
        if (animationFrame.current !== null) {
            cancelAnimationFrame(animationFrame.current);
        }
        animationFrame.current = requestAnimationFrame(updateSpotlight);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
        let clientX = 0;
        let clientY = 0;

        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if ('clientX' in e) {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        position.current.x = clientX - rect.left;
        position.current.y = clientY - rect.top;

        scheduleUpdate();
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            if (animationFrame.current !== null) {
                cancelAnimationFrame(animationFrame.current);
            }
        };
    }, []);

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
