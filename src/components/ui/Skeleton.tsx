import React from 'react';

interface SkeletonProps {
    count?: number;
    className?: string;
    height?: string | number;
    width?: string | number;
    circle?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
    count = 1,
    className = '',
    height,
    width,
    circle = false,
}) => {
    const skeletons = Array(count).fill(0);

    return (
        <>
            {skeletons.map((_, index) => (
                <div
                    key={index}
                    className={`animate-pulse bg-gray-200 rounded ${circle ? 'rounded-full' : ''} ${className}`}
                    style={{
                        height: height,
                        width: width,
                    }}
                ></div>
            ))}
        </>
    );
};

export default Skeleton;
