import { cn } from '@/lib/utils';

export type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoaderVariant = 'spinner' | 'dots' | 'pulse';

interface LoaderProps {
  /**
   * The size of the loader
   * @default 'md'
   */
  size?: LoaderSize;
  /**
   * The variant/style of the loader
   * @default 'spinner'
   */
  variant?: LoaderVariant;
  /**
   * Optional text to display below the loader
   */
  text?: string;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Additional className for the loader element itself
   */
  loaderClassName?: string;
  /**
   * Additional className for the text
   */
  textClassName?: string;
}

const sizeClasses = {
  sm: {
    spinner: 'h-4 w-4 border-2',
    dots: 'h-1.5 w-1.5',
    pulse: 'h-4 w-4',
    text: 'text-xs'
  },
  md: {
    spinner: 'h-6 w-6 border-2',
    dots: 'h-2 w-2',
    pulse: 'h-6 w-6',
    text: 'text-sm'
  },
  lg: {
    spinner: 'h-8 w-8 border-4',
    dots: 'h-3 w-3',
    pulse: 'h-8 w-8',
    text: 'text-base'
  },
  xl: {
    spinner: 'h-12 w-12 border-4',
    dots: 'h-4 w-4',
    pulse: 'h-12 w-12',
    text: 'text-lg'
  }
};

export function Loader({
  size = 'md',
  variant = 'spinner',
  text,
  className,
  loaderClassName,
  textClassName
}: LoaderProps) {
  const sizeClass = sizeClasses[size];

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div
            className={cn(
              'animate-spin rounded-full border-primary border-t-transparent',
              sizeClass.spinner,
              loaderClassName
            )}
          />
        );
      case 'dots':
        return (
          <div className={cn('flex space-x-1', loaderClassName)}>
            <div
              className={cn(
                'rounded-full bg-primary animate-bounce [animation-delay:-0.3s]',
                sizeClass.dots
              )}
            />
            <div
              className={cn(
                'rounded-full bg-primary animate-bounce [animation-delay:-0.15s]',
                sizeClass.dots
              )}
            />
            <div
              className={cn(
                'rounded-full bg-primary animate-bounce',
                sizeClass.dots
              )}
            />
          </div>
        );
      case 'pulse':
        return (
          <div
            className={cn(
              'rounded-full bg-primary/30 relative flex items-center justify-center',
              sizeClass.pulse,
              loaderClassName
            )}
          >
            <div
              className={cn(
                'rounded-full bg-primary/70 animate-ping absolute',
                sizeClass.pulse
              )}
            />
            <div
              className={cn(
                'rounded-full bg-primary',
                size === 'sm'
                  ? 'h-2 w-2'
                  : size === 'md'
                    ? 'h-3 w-3'
                    : size === 'lg'
                      ? 'h-4 w-4'
                      : 'h-6 w-6'
              )}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {renderLoader()}
      {text && (
        <p
          className={cn(
            'font-medium text-muted-foreground',
            sizeClass.text,
            textClassName
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}

// Convenience components for common use cases
export function SpinnerLoader(props: Omit<LoaderProps, 'variant'>) {
  return <Loader {...props} variant="spinner" />;
}

export function DotsLoader(props: Omit<LoaderProps, 'variant'>) {
  return <Loader {...props} variant="dots" />;
}

export function PulseLoader(props: Omit<LoaderProps, 'variant'>) {
  return <Loader {...props} variant="pulse" />;
}
