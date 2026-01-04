import { useEffect, useState } from 'react';

const SnowEffect = () => {
    const [flakes, setFlakes] = useState<{ id: number; left: string; animationDuration: string; animationDelay: string; opacity: number; size: string }[]>([]);

    useEffect(() => {
        // Generate flakes on mount to avoid hydration mismatch if SSR (though this is SPA)
        const newFlakes = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            animationDuration: Math.random() * 3 + 10 + 's', // Slower fall: 10-13s
            animationDelay: Math.random() * 5 + 's',
            opacity: Math.random() * 0.5 + 0.3,
            size: Math.random() * 4 + 2 + 'px',
        }));
        setFlakes(newFlakes);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
            {flakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute top-[-20px] bg-white rounded-full blur-[1px]"
                    style={{
                        left: flake.left,
                        width: flake.size,
                        height: flake.size,
                        opacity: flake.opacity,
                        animation: `snowfall ${flake.animationDuration} linear infinite`,
                        animationDelay: flake.animationDelay,
                    }}
                />
            ))}
        </div>
    );
};

export default SnowEffect;
