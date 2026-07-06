// HorizontalCardCarousel.tsx
"use client";

import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NetworkCard } from './NetworkCard'; // Assuming this is where NetworkCard is exported
import { SuggestedUserDto } from '@/lib/types/connections';

// Note: NetworkCardProps interface is redundant here if NetworkCard is imported 
// and its props are inferred, but keeping it for completeness:
interface NetworkCardProps {
    user: SuggestedUserDto;
    onConnectClick: (receiverId: string) => Promise<void>;
    isConnected?: boolean;
}

interface HorizontalCardCarouselProps {
    title: string;
    data: SuggestedUserDto[];
    onConnectClick: (receiverId: string) => Promise<void>;
    actionText?: string;
}

const HorizontalCardCarousel: React.FC<HorizontalCardCarouselProps> = ({ 
    title, 
    data, 
    onConnectClick, 
    actionText = 'View All' 
}) => {
    // 1. FIX: Explicitly type the ref as HTMLDivElement
    const scrollContainerRef = useRef<HTMLDivElement>(null); 
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightState] = useState(true);

    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const isAtStart = container.scrollLeft < 1;
            // Calculate if we are at the end (allowing for minor floating point error)
            const isAtEnd = Math.abs(container.scrollWidth - container.clientWidth - container.scrollLeft) < 1;
            
            setShowLeftButton(!isAtStart);
            
            // 2. IMPROVEMENT: Only show the right button if scroll is possible AND we aren't at the end.
            const canScroll = container.scrollWidth > container.clientWidth;
            setShowRightState(canScroll && !isAtEnd);
        }
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (container && container.children.length > 0) {
            const firstItem = container.children[0] as HTMLElement;
            const itemWidth = firstItem.offsetWidth;
            
            // 3. FIX: Handle potential NaN from parseInt by using a safe fallback
            const gapStyle = window.getComputedStyle(container).gap;
            const gap = parseInt(gapStyle) || 0; // If parsing fails or is invalid, gap is 0
            
            const scrollAmount = itemWidth + gap;
    
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        // 4. FIX: The CRITICAL type guard ensures 'container' is an HTMLDivElement
        if (!container) return; 

        handleScroll();
        container.addEventListener('scroll', handleScroll); // Now safe due to type guard

        const resizeObserver = new ResizeObserver(() => handleScroll());
        resizeObserver.observe(container);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            resizeObserver.unobserve(container);
        };
    }, [handleScroll]); // Dependency is fine

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4 px-4 sm:px-0"> 
                <h2 className="text-[#1F2937] text-lg font-medium">{title}</h2>
                <button className="text-[#0096c7] text-sm font-medium">{actionText}</button>
            </div>
            
            <div className="relative">
                <div className="relative">
                    {/* Fading Gradients */}
                    <div className={`absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#EEF0F4] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeftButton ? 'opacity-100' : 'opacity-0'}`} />

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto snap-x snap-proximity scrollbar-hide sm:scroll-p-4 sm:px-4 sm:-mx-4"
                    >
                        {data && data.length > 0 ? (
                            data.map((user, index) => (
                                <div key={user.id || index} className="w-full sm:w-[46%] lg:w-[32%] shrink-0 snap-start sm:snap-center">
                                    <NetworkCard user={user} onConnectClick={onConnectClick} isConnected={false} />
                                </div>
                            ))
                        ) : (
                            <p className="px-4 text-[#6B7280]">No profiles found.</p>
                        )}
                    </div>

                    <div className={`absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#EEF0F4] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showRightButton ? 'opacity-100' : 'opacity-0'}`} />
                </div>

                {/* Scroll Buttons (Desktop/Tablet) */}
                <button 
                    onClick={() => scroll('left')} 
                    className={`hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white rounded-full shadow-md items-center justify-center z-20 transition-opacity duration-300 ${showLeftButton ? 'opacity-100' : 'opacity-0'}`}
                >
                    <ChevronLeft size={20} className="text-[#6B7280]" />
                </button>
                <button 
                    onClick={() => scroll('right')} 
                    className={`hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white rounded-full shadow-md items-center justify-center z-20 transition-opacity duration-300 ${showRightButton ? 'opacity-100' : 'opacity-0'}`}
                >
                    <ChevronRight size={20} className="text-[#6B7280]" />
                </button>
            </div>
        </div>
    );
};
export default HorizontalCardCarousel;