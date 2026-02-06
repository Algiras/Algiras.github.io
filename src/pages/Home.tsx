import {
  Badge,
  Box,
  Button,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  ChevronDown,
  CreditCard,
  ExternalLink,
  FileText,
  Github,
  Home,
  Landmark,
  Linkedin,
  Mail,
  MapPin,
  PiggyBank,
  RefreshCw,
  Scale,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useDocumentTitle } from '../utils/documentUtils';

// Gradient Mesh Background
const GradientMesh: React.FC<{ isDark: boolean; isMobile: boolean }> = ({ isDark, isMobile }) => {
  const blobCount = isMobile ? 2 : 4;
  const blobs = [
    { color: 'rgba(6, 182, 212, 0.15)', delay: '0s', left: '10%', top: '20%' },
    { color: 'rgba(59, 130, 246, 0.12)', delay: '5s', left: '70%', top: '30%' },
    { color: 'rgba(139, 92, 246, 0.10)', delay: '10s', left: '40%', top: '60%' },
    { color: 'rgba(56, 190, 201, 0.13)', delay: '15s', left: '80%', top: '70%' },
  ].slice(0, blobCount);

  return (
    <Box
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {blobs.map((blob, idx) => (
        <Box
          key={idx}
          className="animated-gradient-bg"
          style={{
            background: `radial-gradient(circle, ${blob.color}, transparent 70%)`,
            left: blob.left,
            top: blob.top,
            animationDelay: blob.delay,
            opacity: isDark ? 1 : 0.5,
          }}
        />
      ))}
    </Box>
  );
};

// Enhanced Particles with shooting stars
const Particles: React.FC<{ isMobile: boolean; isDark: boolean }> = ({ isMobile, isDark }) => {
  const particleCount = isMobile ? 12 : 30;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const sizeCategory = i % 3;
    let size: number;
    let opacity: number;
    let glow: string;

    if (sizeCategory === 0) {
      // Tiny dust
      size = 1 + Math.random();
      opacity = 0.3 + Math.random() * 0.2;
      glow = '0 0 2px rgba(56, 190, 201, 0.3)';
    } else if (sizeCategory === 1) {
      // Medium dots
      size = 3 + Math.random() * 2;
      opacity = 0.4 + Math.random() * 0.3;
      glow = '0 0 6px rgba(56, 190, 201, 0.5)';
    } else {
      // Large orbs
      size = 6 + Math.random() * 2;
      opacity = 0.5 + Math.random() * 0.3;
      glow = '0 0 10px rgba(56, 190, 201, 0.7)';
    }

    return {
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      opacity,
      glow,
    };
  });

  const shootingStars = isMobile ? [] : [
    { delay: '2s', duration: '3s' },
    { delay: '7s', duration: '2.5s' },
    { delay: '12s', duration: '3.5s' },
  ];

  return (
    <Box
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {particles.map(p => (
        <Box
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: isDark ? 'rgba(56, 190, 201, 0.8)' : 'rgba(59, 130, 246, 0.6)',
            boxShadow: p.glow,
            opacity: p.opacity,
            animation: `particleDrift ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      {shootingStars.map((star, idx) => (
        <Box
          key={`star-${idx}`}
          className="shooting-star"
          style={{
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </Box>
  );
};

// Morphing Blob Background
const MorphingBlob: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <Box
    className="morphing-blob"
    style={{
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      background: isDark
        ? 'radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 70%)'
        : 'radial-gradient(circle, rgba(59, 130, 246, 0.05), transparent 70%)',
      zIndex: 0,
    }}
  />
);

// Animated Counter Component
const AnimatedCounter: React.FC<{ target: number; duration: number; isVisible: boolean }> = ({
  target,
  duration,
  isVisible
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // EaseOut curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(startValue + (target - startValue) * easeOut);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, isVisible]);

  return <>{count}</>;
};

// Text Scramble Effect (Subtle)
const ScrambleText: React.FC<{ text: string; isActive: boolean }> = ({ text, isActive }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  useEffect(() => {
    if (!isActive) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplayText(text);
      }

      iteration += 1;
    }, 50);

    return () => clearInterval(interval);
  }, [text, isActive]);

  return <>{displayText}</>;
};

// Mouse Particle Trail
const useMouseTrail = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    let particles: HTMLDivElement[] = [];
    let rafId: number;
    let lastX = 0;
    let lastY = 0;
    let throttle = 0;

    const createParticle = (x: number, y: number) => {
      const particle = document.createElement('div');
      particle.className = 'particle-trail';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      document.body.appendChild(particle);
      particles.push(particle);

      setTimeout(() => {
        particle.remove();
        particles = particles.filter(p => p !== particle);
      }, 800);
    };

    const handleMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;

      throttle++;
      if (throttle % 3 === 0) {
        createParticle(e.clientX, e.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      particles.forEach(p => p.remove());
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [enabled]);
};

// Spotlight Cursor
const useSpotlightCursor = (enabled: boolean) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled]);

  return position;
};

// Magnetic Attraction Effect
const useMagneticEffect = (strength: number = 0.3, disabled: boolean = false) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      const maxDistance = 200;

      if (distance < maxDistance) {
        const pull = (maxDistance - distance) / maxDistance;
        const translateX = distanceX * strength * pull;
        const translateY = distanceY * strength * pull;
        element.style.transform = `translate(${translateX}px, ${translateY}px)`;
      } else {
        element.style.transform = 'translate(0, 0)';
      }
    };

    const handleMouseLeave = () => {
      element.style.transform = 'translate(0, 0)';
    };

    window.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, disabled]);

  return ref;
};

// Button Ripple Effect
const useRipple = () => {
  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    circle.style.position = 'absolute';
    circle.style.borderRadius = '50%';
    circle.style.background = 'rgba(255, 255, 255, 0.6)';
    circle.style.animation = 'ripple 0.6s ease-out';
    circle.style.pointerEvents = 'none';

    button.appendChild(circle);

    setTimeout(() => circle.remove(), 600);
  };

  return createRipple;
};

// 3D Tilt Hook
const useTiltEffect = (disabled: boolean = false) => {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (disabled) return;

    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out',
      });
    };

    const handleMouseLeave = () => {
      setStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.3s ease-out',
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [disabled]);

  return { ref, style };
};

// Section wrapper with scroll animation
const AnimatedSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
  animationType?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scaleIn' | 'flipUp';
}> = ({ children, delay = 0, animationType = 'fadeUp' }) => {
  const { ref, style } = useScrollAnimation({ delay, animationType });
  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
};

const HomePage: React.FC = () => {
  useDocumentTitle('Free Financial Tools - Calculators & Trackers');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [isLoaded, setIsLoaded] = useState(false);
  const [orbVisible, setOrbVisible] = useState(false);
  const supportsHover = useMediaQuery('(hover: hover)');
  const createRipple = useRipple();

  // Advanced Effects
  useMouseTrail(!isMobile && supportsHover);
  const spotlightPos = useSpotlightCursor(!isMobile && supportsHover);

  useEffect(() => {
    // Trigger hero entrance
    setIsLoaded(true);
    const orbTimer = setTimeout(() => setOrbVisible(true), 1100);
    return () => clearTimeout(orbTimer);
  }, []);

  const tools = [
    {
      title: 'Mortgage Calculator',
      description: 'Calculate monthly payments, amortization schedules, and total interest for any mortgage.',
      path: '/finance/mortgage-calculator',
      icon: Home,
      color: 'blue',
      tech: ['Amortization', 'Charts', 'Export'],
    },
    {
      title: 'Investment Calculator',
      description: 'Model compound interest growth with regular contributions and see your money grow over time.',
      path: '/finance/investment-calculator',
      icon: TrendingUp,
      color: 'teal',
      tech: ['Compound Interest', 'Projections'],
    },
    {
      title: 'Loan Comparison',
      description: 'Compare up to 4 loan offers side-by-side with interactive visualizations.',
      path: '/finance/loan-comparison',
      icon: Scale,
      color: 'violet',
      tech: ['Side-by-Side', 'Charts'],
    },
    {
      title: 'ROI Calculator',
      description: 'Calculate return on investment across multiple scenarios with annualized returns.',
      path: '/finance/roi-calculator',
      icon: BarChart3,
      color: 'cyan',
      tech: ['Multi-Scenario', 'Annualized'],
    },
    {
      title: 'Retirement Planner',
      description: 'Plan your retirement savings with withdrawal strategy modeling and inflation adjustments.',
      path: '/finance/retirement-planner',
      icon: PiggyBank,
      color: 'orange',
      tech: ['Withdrawals', 'Inflation'],
    },
    {
      title: 'Investment Tracker',
      description: 'Track your portfolio performance with interactive charts and detailed analytics.',
      path: '/finance/investment-tracker',
      icon: Calculator,
      color: 'indigo',
      tech: ['Portfolio', 'Analytics'],
    },
    {
      title: 'Debt Payoff',
      description: 'Compare snowball vs. avalanche payoff strategies and find the fastest path to debt freedom.',
      path: '/finance/debt-payoff',
      icon: CreditCard,
      color: 'red',
      tech: ['Snowball', 'Avalanche'],
    },
    {
      title: 'Refinance Calculator',
      description: 'Analyze whether refinancing your mortgage saves money with break-even analysis.',
      path: '/finance/refinance',
      icon: RefreshCw,
      color: 'green',
      tech: ['Break-Even', 'Savings'],
    },
  ];

  const moreTools = [
    {
      title: 'Markdown to PDF',
      description: 'Convert Markdown documents to beautifully styled PDFs with live preview and MathJax support.',
      path: '/documents/markdown-to-pdf',
      icon: FileText,
      color: 'teal',
      tech: ['Markdown', 'PDF', 'MathJax'],
    },
  ];

  return (
    <Box>
      {/* Spotlight Cursor Effect */}
      {!isMobile && supportsHover && (
        <Box
          className="spotlight-cursor"
          style={{
            transform: `translate(${spotlightPos.x - 300}px, ${spotlightPos.y - 300}px)`,
          }}
        />
      )}

      {/* ===== HERO SECTION ===== */}
      <Box
        style={{
          minHeight: 'calc(100vh - 60px)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Animated Background Layers */}
        <Box
          style={{
            opacity: isLoaded ? (isDark ? 0.15 : 0.08) : 0,
            transition: 'opacity 0.8s ease-out',
          }}
        >
          <GradientMesh isDark={isDark} isMobile={isMobile} />
        </Box>

        {!isMobile && <MorphingBlob isDark={isDark} />}

        <Box
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: `opacity 0.8s ease-out ${isMobile ? '0.75s' : '1.5s'}`,
          }}
        >
          <Particles isMobile={isMobile} isDark={isDark} />
        </Box>

        <Container size="lg" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            {/* Left: Text content with staggered entrance */}
            <Stack gap="xl" justify="center" py={{ base: 'xl', md: 0 }}>
              <Box>
                {/* Badge - 200ms delay */}
                <Badge
                  size="lg"
                  variant="outline"
                  color={isDark ? 'cyan' : 'blue'}
                  mb="md"
                  style={{
                    borderColor: isDark ? 'rgba(56, 190, 201, 0.4)' : undefined,
                    opacity: isLoaded ? 1 : 0,
                    transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.6s ease-out ${isMobile ? '0.1s' : '0.2s'}, transform 0.6s ease-out ${isMobile ? '0.1s' : '0.2s'}`,
                  }}
                >
                  100% Free & Open Source
                </Badge>

                {/* Title - 400ms delay with scramble effect */}
                <Title
                  className="hero-gradient-text"
                  style={{
                    fontSize: isMobile ? '2.5rem' : '4rem',
                    lineHeight: 1.05,
                    marginBottom: '1rem',
                    opacity: isLoaded ? 1 : 0,
                    filter: isLoaded ? 'blur(0)' : 'blur(20px)',
                    transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${isMobile ? '0.2s' : '0.4s'}`,
                  }}
                >
                  <ScrambleText text="Financial Tools That Work For You" isActive={isLoaded} />
                </Title>

                {/* Subtitle - 700ms delay */}
                <Text
                  size="lg"
                  c="dimmed"
                  lh={1.6}
                  maw={500}
                  style={{
                    opacity: isLoaded ? 1 : 0,
                    transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.6s ease-out ${isMobile ? '0.35s' : '0.7s'}, transform 0.6s ease-out ${isMobile ? '0.35s' : '0.7s'}`,
                  }}
                >
                  Free calculators and trackers to help you make smarter financial decisions.
                  No sign-up, no ads, no data collection.
                </Text>
              </Box>

              {/* CTA Buttons - 900ms delay with ripple effects */}
              <Group
                gap="md"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                  transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${isMobile ? '0.45s' : '0.9s'}, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${isMobile ? '0.45s' : '0.9s'}`,
                }}
              >
                <Button
                  component={Link}
                  to="/finance"
                  size="lg"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                  rightSection={<ArrowRight size={18} />}
                  className="custom-button-hover ripple-effect"
                  onClick={createRipple}
                >
                  Explore All Tools
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="custom-button-hover ripple-effect"
                  onClick={(e) => {
                    createRipple(e);
                    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    borderColor: isDark ? 'rgba(56, 190, 201, 0.4)' : undefined,
                    color: isDark ? '#38bec9' : undefined,
                  }}
                >
                  See What's Available
                </Button>
              </Group>
            </Stack>

            {/* Right: Glowing orb with floating icons - 1100ms delay */}
            {!isMobile && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'scale(1)' : 'scale(0.5)',
                  transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.1s',
                }}
              >
                {/* Floating finance icons - staggered 1200ms + */}
                {[
                  { Icon: TrendingUp, top: '10%', left: '15%', delay: 1.2, color: 'blue' },
                  { Icon: PiggyBank, top: '20%', right: '10%', delay: 1.3, color: 'cyan' },
                  { Icon: CreditCard, bottom: '25%', left: '8%', delay: 1.4, color: 'violet' },
                  { Icon: Landmark, bottom: '15%', right: '20%', delay: 1.5, color: 'teal' },
                ].map(({ Icon, delay, color, ...pos }, idx) => (
                  <Box
                    key={idx}
                    style={{
                      position: 'absolute',
                      ...pos,
                      opacity: isLoaded ? 1 : 0,
                      transform: isLoaded ? 'scale(1)' : 'scale(0)',
                      transition: `opacity 0.4s ease-out ${delay}s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s`,
                      animation: isLoaded ? `float 6s ease-in-out ${idx * 0.5}s infinite` : 'none',
                    }}
                  >
                    <ThemeIcon size="lg" radius="md" variant="light" color={color}>
                      <Icon size={20} />
                    </ThemeIcon>
                  </Box>
                ))}

                {/* Main Orb with pulse animation and rotating rings */}
                <Box
                  style={{
                    position: 'relative',
                    width: 280,
                    height: 280,
                  }}
                >
                  {/* Rotating Ring 1 - Outer */}
                  <Box
                    className={orbVisible ? 'rotating-ring' : ''}
                    style={{
                      position: 'absolute',
                      inset: -20,
                      border: '2px solid rgba(56, 190, 201, 0.2)',
                      borderRadius: '50%',
                      borderTopColor: isDark ? 'rgba(56, 190, 201, 0.6)' : 'rgba(59, 130, 246, 0.6)',
                      borderRightColor: 'transparent',
                      opacity: orbVisible ? 1 : 0,
                      transition: 'opacity 0.6s ease-out',
                    }}
                  />

                  {/* Rotating Ring 2 - Inner */}
                  <Box
                    className={orbVisible ? 'rotating-ring-reverse' : ''}
                    style={{
                      position: 'absolute',
                      inset: -40,
                      border: '1px solid rgba(139, 92, 246, 0.15)',
                      borderRadius: '50%',
                      borderLeftColor: isDark ? 'rgba(139, 92, 246, 0.5)' : 'rgba(99, 102, 241, 0.5)',
                      borderBottomColor: 'transparent',
                      opacity: orbVisible ? 1 : 0,
                      transition: 'opacity 0.6s ease-out 0.2s',
                    }}
                  />

                  {/* Skill Badges floating around orb */}
                  {[
                    { label: 'React', color: 'cyan', angle: 0, delay: '0s' },
                    { label: 'TS', color: 'blue', angle: 120, delay: '0.5s' },
                    { label: 'Vite', color: 'violet', angle: 240, delay: '1s' },
                  ].map((skill, idx) => (
                    <Badge
                      key={skill.label}
                      size="sm"
                      variant="filled"
                      color={skill.color}
                      className="floating-skill"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) rotate(${skill.angle}deg) translateY(-180px) rotate(-${skill.angle}deg)`,
                        opacity: orbVisible ? 1 : 0,
                        transition: `opacity 0.4s ease-out ${1.6 + idx * 0.2}s`,
                        animationDelay: skill.delay,
                        boxShadow: '0 0 20px rgba(56, 190, 201, 0.3)',
                      }}
                    >
                      {skill.label}
                    </Badge>
                  ))}

                  {/* Main Orb */}
                  <Box
                    className={orbVisible ? 'animate-orb-pulse' : ''}
                    style={{
                      width: 280,
                      height: 280,
                      borderRadius: '50%',
                      background: isDark
                        ? 'radial-gradient(circle at 30% 30%, rgba(56, 190, 201, 0.3), rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.15))'
                        : 'linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-cyan-5), var(--mantine-color-indigo-6))',
                      boxShadow: isDark
                        ? '0 0 60px rgba(56, 190, 201, 0.2), 0 0 120px rgba(59, 130, 246, 0.1)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), transparent 50%)',
                      }}
                    />
                    <Stack align="center" gap="xs" style={{ zIndex: 1 }}>
                      <Calculator
                        size={48}
                        color={isDark ? '#38bec9' : 'white'}
                        className={orbVisible ? 'neon-icon' : ''}
                      />
                      <Text
                        size="xl"
                        fw={700}
                        c="white"
                        style={{
                          fontSize: '2.5rem',
                          lineHeight: 1,
                        }}
                      >
                        <AnimatedCounter target={8} duration={1500} isVisible={orbVisible} />
                      </Text>
                      <Text size="sm" fw={600} c="white" opacity={0.9}>
                        Free Tools
                      </Text>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            )}
          </SimpleGrid>

          {/* Scroll indicator - 1800ms delay */}
          <Box
            ta="center"
            mt="xl"
            style={{
              opacity: isLoaded ? 0.5 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(-10px)',
              transition: `opacity 0.6s ease-out ${isMobile ? '0.9s' : '1.8s'}, transform 0.6s ease-out ${isMobile ? '0.9s' : '1.8s'}`,
              animation: isLoaded ? 'float 3s ease-in-out infinite' : 'none',
            }}
          >
            <ChevronDown size={24} color={isDark ? '#38bec9' : undefined} />
          </Box>
        </Container>
      </Box>

      {/* ===== TOOLS SECTION ===== */}
      <Box py={{ base: 60, md: 80 }} id="tools">
        <Container size="lg">
          <AnimatedSection animationType="flipUp">
            <Box ta="center" mb="xl">
              <Title order={2} mb="sm">
                <Text component="span" inherit className="glow-text">
                  Free
                </Text>{' '}
                Financial Calculators
              </Title>
              <Text size="md" c="dimmed" maw={500} mx="auto">
                All tools run in your browser. Your data stays on your device.
              </Text>
              <Box
                mx="auto"
                mt="md"
                style={{
                  width: 60,
                  height: 3,
                  background: 'linear-gradient(90deg, #3b82f6, #38bec9)',
                  borderRadius: 2,
                  boxShadow: isDark ? '0 0 10px rgba(56, 190, 201, 0.5)' : undefined,
                }}
              />
            </Box>
          </AnimatedSection>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {tools.map((tool, index) => {
              const ToolIcon = tool.icon;
              const tiltDisabled = !supportsHover;
              const { ref: tiltRef, style: tiltStyle } = useTiltEffect(tiltDisabled);
              const magneticRef = useMagneticEffect(0.3, !supportsHover || isMobile);
              const animationType = index % 2 === 0 ? 'fadeLeft' : 'fadeRight';

              return (
                <AnimatedSection key={tool.title} delay={index * (isMobile ? 50 : 100)} animationType={animationType}>
                  <Box
                    ref={(node) => {
                      // Combine refs
                      if (typeof tiltRef === 'function') tiltRef(node);
                      else if (tiltRef) (tiltRef as any).current = node;
                      if (magneticRef) (magneticRef as any).current = node;
                    }}
                    component={Link}
                    to={tool.path}
                    className="glass-card tilt-card magnetic-item card-content-reveal"
                    p="md"
                    style={{
                      borderRadius: 12,
                      display: 'block',
                      textDecoration: 'none',
                      color: 'inherit',
                      borderTop: `3px solid var(--mantine-color-${tool.color}-6)`,
                      height: '100%',
                      ...tiltStyle,
                    }}
                  >
                    <Stack gap="sm">
                      <ThemeIcon
                        size="xl"
                        radius="md"
                        variant="light"
                        color={tool.color}
                        className="neon-icon"
                      >
                        <ToolIcon size={24} />
                      </ThemeIcon>

                      <Title order={4} size="h5">
                        {tool.title}
                      </Title>

                      <Text size="xs" c="dimmed" lh={1.5}>
                        {tool.description}
                      </Text>

                      <Group gap={4} mt="auto">
                        {tool.tech.map(t => (
                          <Badge
                            key={t}
                            size="xs"
                            variant={isDark ? 'outline' : 'light'}
                            color={tool.color}
                          >
                            {t}
                          </Badge>
                        ))}
                      </Group>

                      <Text
                        size="xs"
                        fw={500}
                        c={tool.color}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        Try it free <ArrowRight size={12} />
                      </Text>
                    </Stack>
                  </Box>
                </AnimatedSection>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ===== MORE TOOLS SECTION ===== */}
      <Box py={{ base: 40, md: 60 }}>
        <Container size="lg">
          <AnimatedSection animationType="flipUp">
            <Box ta="center" mb="xl">
              <Title order={2} mb="sm" size="h3">
                More{' '}
                <Text component="span" inherit className="glow-text">
                  Tools
                </Text>
              </Title>
            </Box>
          </AnimatedSection>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" style={{ maxWidth: 600, margin: '0 auto' }}>
            {moreTools.map((tool, index) => {
              const ToolIcon = tool.icon;
              const tiltDisabled = !supportsHover;
              const { ref: tiltRef, style: tiltStyle } = useTiltEffect(tiltDisabled);
              const magneticRef = useMagneticEffect(0.3, !supportsHover || isMobile);
              return (
                <AnimatedSection key={tool.title} delay={index * 100} animationType="scaleIn">
                  <Box
                    ref={(node) => {
                      if (typeof tiltRef === 'function') tiltRef(node);
                      else if (tiltRef) (tiltRef as any).current = node;
                      if (magneticRef) (magneticRef as any).current = node;
                    }}
                    component={Link}
                    to={tool.path}
                    className="glass-card tilt-card magnetic-item card-content-reveal"
                    p="lg"
                    style={{
                      borderRadius: 12,
                      display: 'block',
                      textDecoration: 'none',
                      color: 'inherit',
                      borderTop: `3px solid var(--mantine-color-${tool.color}-6)`,
                      height: '100%',
                      ...tiltStyle,
                    }}
                  >
                    <Stack gap="md">
                      <Group gap="sm">
                        <ThemeIcon
                          size="xl"
                          radius="md"
                          variant="light"
                          color={tool.color}
                          className="neon-icon"
                        >
                          <ToolIcon size={24} />
                        </ThemeIcon>
                        <Title order={3} size="h4">
                          {tool.title}
                        </Title>
                      </Group>

                      <Text size="sm" c="dimmed" lh={1.6}>
                        {tool.description}
                      </Text>

                      <Group gap="xs">
                        {tool.tech.map(t => (
                          <Badge
                            key={t}
                            size="sm"
                            variant={isDark ? 'outline' : 'light'}
                            color={tool.color}
                          >
                            {t}
                          </Badge>
                        ))}
                      </Group>

                      <Text
                        size="sm"
                        fw={500}
                        c={tool.color}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        Try it free <ArrowRight size={14} />
                      </Text>
                    </Stack>
                  </Box>
                </AnimatedSection>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ===== CONTACT SECTION ===== */}
      <Box py={{ base: 60, md: 80 }} id="contact">
        <Container size="md">
          <AnimatedSection animationType="scaleIn">
            {(() => {
              const tiltEffect = useTiltEffect(!supportsHover);
              const magneticRef = useMagneticEffect(0.2, !supportsHover || isMobile);
              return (
                <Box
                  className="glass-card tilt-card magnetic-item card-content-reveal"
                  p={{ base: 'lg', md: 'xl' }}
                  style={{
                    borderRadius: 16,
                    animation: isDark ? 'borderGlow 4s ease-in-out infinite' : undefined,
                    ...tiltEffect.style,
                  }}
                  ref={(node) => {
                    if (typeof tiltEffect.ref === 'function') tiltEffect.ref(node);
                    else if (tiltEffect.ref) (tiltEffect.ref as any).current = node;
                    if (magneticRef) (magneticRef as any).current = node;
                  }}
                >
                  <Stack gap="xl" align="center">
                    <Box ta="center">
                      <Title order={2} mb="xs">
                        Built by{' '}
                        <Text component="span" inherit className="glow-text">
                          Algimantas K.
                        </Text>
                      </Title>
                      <Text size="sm" c="dimmed">
                        Senior Software Engineer based in Vilnius, Lithuania
                      </Text>
                    </Box>

                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" style={{ width: '100%' }}>
                  <Button
                    component="a"
                    href="mailto:algiras.dev@gmail.com"
                    variant={isDark ? 'outline' : 'light'}
                    size="lg"
                    fullWidth
                    leftSection={<Mail size={20} />}
                    rightSection={<ExternalLink size={14} />}
                    className="custom-button-hover"
                    color={isDark ? 'cyan' : 'blue'}
                    style={{
                      borderColor: isDark ? 'rgba(56, 190, 201, 0.3)' : undefined,
                    }}
                  >
                    Email
                  </Button>

                  <Button
                    component="a"
                    href="https://www.linkedin.com/in/asimplek"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant={isDark ? 'outline' : 'light'}
                    size="lg"
                    fullWidth
                    leftSection={<Linkedin size={20} />}
                    rightSection={<ExternalLink size={14} />}
                    className="custom-button-hover"
                    color={isDark ? 'cyan' : 'blue'}
                    style={{
                      borderColor: isDark ? 'rgba(56, 190, 201, 0.3)' : undefined,
                    }}
                  >
                    LinkedIn
                  </Button>

                  <Button
                    component="a"
                    href="https://github.com/Algiras"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant={isDark ? 'outline' : 'light'}
                    size="lg"
                    fullWidth
                    leftSection={<Github size={20} />}
                    rightSection={<ExternalLink size={14} />}
                    className="custom-button-hover"
                    color={isDark ? 'cyan' : 'blue'}
                    style={{
                      borderColor: isDark ? 'rgba(56, 190, 201, 0.3)' : undefined,
                    }}
                  >
                    GitHub
                  </Button>
                </SimpleGrid>

                <Badge
                  size="lg"
                  variant="outline"
                  leftSection={<MapPin size={14} />}
                  color={isDark ? 'cyan' : 'blue'}
                  style={{
                    borderColor: isDark ? 'rgba(56, 190, 201, 0.3)' : undefined,
                  }}
                >
                  Vilnius, Lithuania
                </Badge>
              </Stack>
                </Box>
              );
            })()}
          </AnimatedSection>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
