
interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'rectangular' | 'circular';
}

export default function Skeleton({
    className = "",
    width,
    height,
    variant = 'rectangular'
}: SkeletonProps) {
    const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700";

    // Determine rounding based on variant
    let roundedClass = "rounded";
    if (variant === 'circular') roundedClass = "rounded-full";
    if (variant === 'text') roundedClass = "rounded";
    if (variant === 'rectangular') roundedClass = "rounded-md";

    const style = {
        width: width,
        height: height
    };

    return (
        <div
            className={`${baseClasses} ${roundedClass} ${className}`}
            style={style}
        />
    );
}
