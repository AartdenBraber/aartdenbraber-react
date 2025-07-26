import React, { useRef, useEffect } from 'react';
import './FocusSpotlight.scss';

interface FocusSpotlightProps {
    image: string;
}

const FocusSpotlight: React.FC<FocusSpotlightProps> = ({ image }) => {
    const hasAnimated = useRef(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);
    const animationFrame = useRef<number | null>(null);

    const updateSpotlight = (x: number, y: number) => {
        if (!spotlightRef.current) return;

        if (animationFrame.current !== null) {
            cancelAnimationFrame(animationFrame.current);
        }

        animationFrame.current = requestAnimationFrame(() => {
            spotlightRef.current!.style.setProperty('--x', `${x}px`);
            spotlightRef.current!.style.setProperty('--y', `${y}px`);
        });
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
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        updateSpotlight(x, y);

        if (!hasAnimated.current) {
            hasAnimated.current = true;
            spotlightRef.current?.classList.add('animate-ring');
        }
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
