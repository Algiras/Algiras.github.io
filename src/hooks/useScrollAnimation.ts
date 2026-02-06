import { useCallback, useEffect, useRef, useState } from 'react';

type AnimationType = 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scaleIn' | 'flipUp';

interface UseScrollAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  delay?: number;
  animationType?: AnimationType;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { threshold = 0.1, triggerOnce = true, delay = 0, animationType = 'fadeUp' } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const callbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (ref.current) {
        // cleanup previous observer if any
      }
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    []
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            const timer = setTimeout(() => setIsVisible(true), delay);
            if (triggerOnce) observer.unobserve(element);
            return () => clearTimeout(timer);
          }
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(element);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, triggerOnce, delay, prefersReducedMotion]);

  const getTransform = (type: AnimationType, visible: boolean): string => {
    if (visible) return type === 'flipUp' ? 'perspective(1000px) rotateX(0) translateY(0)' :
                         type === 'scaleIn' ? 'scale(1)' :
                         'translateX(0) translateY(0)';

    switch (type) {
      case 'fadeLeft':
        return 'translateX(-60px)';
      case 'fadeRight':
        return 'translateX(60px)';
      case 'scaleIn':
        return 'scale(0.85)';
      case 'flipUp':
        return 'perspective(1000px) rotateX(15deg) translateY(30px)';
      case 'fadeUp':
      default:
        return 'translateY(40px)';
    }
  };

  const style: React.CSSProperties = prefersReducedMotion
    ? {}
    : {
        opacity: isVisible ? 1 : 0,
        transform: getTransform(animationType, isVisible),
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      };

  return { ref: callbackRef, internalRef: ref, isVisible, style };
};
