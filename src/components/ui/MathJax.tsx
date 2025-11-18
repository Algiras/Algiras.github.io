import { useMantineColorScheme } from '@mantine/core';
import React, { useEffect, useRef } from 'react';

interface MathJaxProps {
  children: string;
  display?: boolean;
  className?: string;
}

const MathJax: React.FC<MathJaxProps> = ({
  children,
  display = false,
  className = '',
}) => {
  const mathRef = useRef<HTMLDivElement>(null);
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    const loadMathJax = async () => {
      if (typeof window !== 'undefined') {
        // Check if MathJax is already loaded
        if (!(window as any).MathJax) {
          // Configure MathJax with theme-aware colors
          const isDark = colorScheme === 'dark';
          const textColor = isDark ? '#c1c2c5' : '#212529';

          (window as any).MathJax = {
            tex: {
              inlineMath: [
                ['$', '$'],
                ['\\(', '\\)'],
              ],
              displayMath: [
                ['$$', '$$'],
                ['\\[', '\\]'],
              ],
              processEscapes: true,
              processEnvironments: true,
            },
            options: {
              skipHtmlTags: [
                'script',
                'noscript',
                'style',
                'textarea',
                'pre',
                'code',
              ],
              ignoreHtmlClass: 'tex2jax_ignore',
              processHtmlClass: 'tex2jax_process',
            },
            svg: {
              fontCache: 'global',
              scale: 1,
              minScale: 0.5,
              mtextInheritFont: false,
              merrorInheritFont: true,
              mathmlSpacing: false,
              skipAttributes: {},
              exFactor: 0.5,
              displayAlign: 'center',
              displayIndent: '0',
              fontURL:
                'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/svg/fonts/tex-woff-v2',
            },
            startup: {
              ready: () => {
                (window as any).MathJax.startup.defaultReady();
                // Apply theme colors after startup
                const style = document.createElement('style');
                style.textContent = `
                  .mathjax-container svg {
                    color: ${textColor} !important;
                  }
                  .mathjax-container mjx-container svg g {
                    fill: ${textColor} !important;
                    stroke: ${textColor} !important;
                  }
                  .mathjax-container mjx-container svg text {
                    fill: ${textColor} !important;
                  }
                  .mathjax-container mjx-container svg path {
                    fill: ${textColor} !important;
                    stroke: ${textColor} !important;
                  }
                `;
                document.head.appendChild(style);
              },
            },
          };

          // Load MathJax script
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
          script.async = true;
          document.head.appendChild(script);

          script.onload = () => {
            typesetMath();
          };
        } else {
          typesetMath();
        }
      }
    };

    const typesetMath = () => {
      if (
        (window as any).MathJax &&
        (window as any).MathJax.typesetPromise &&
        mathRef.current
      ) {
        (window as any).MathJax.typesetPromise([mathRef.current]).catch(
          (err: any) => {
            console.error('MathJax typeset error:', err);
          }
        );
      }
    };

    loadMathJax();
  }, [children, colorScheme]);

  // Update MathJax colors when theme changes
  useEffect(() => {
    if ((window as any).MathJax && (window as any).MathJax.startup) {
      const isDark = colorScheme === 'dark';
      const textColor = isDark ? '#c1c2c5' : '#212529';

      // Remove existing theme styles
      const existingStyles = document.querySelectorAll(
        'style[data-mathjax-theme]'
      );
      existingStyles.forEach(style => style.remove());

      // Apply new theme colors
      const style = document.createElement('style');
      style.setAttribute('data-mathjax-theme', 'true');
      style.textContent = `
        .mathjax-container svg {
          color: ${textColor} !important;
        }
        .mathjax-container mjx-container svg g {
          fill: ${textColor} !important;
          stroke: ${textColor} !important;
        }
        .mathjax-container mjx-container svg text {
          fill: ${textColor} !important;
        }
        .mathjax-container mjx-container svg path {
          fill: ${textColor} !important;
          stroke: ${textColor} !important;
        }
        .mathjax-container mjx-container svg rect {
          fill: ${textColor} !important;
          stroke: ${textColor} !important;
        }
        .mathjax-container mjx-container svg line {
          stroke: ${textColor} !important;
        }
        .mathjax-container mjx-container svg polygon {
          fill: ${textColor} !important;
          stroke: ${textColor} !important;
        }
      `;
      document.head.appendChild(style);

      // Re-render existing MathJax elements
      if ((window as any).MathJax.typesetPromise) {
        (window as any).MathJax.typesetPromise().catch((err: any) => {
          console.error('MathJax re-typeset error:', err);
        });
      }
    }
  }, [colorScheme]);

  const mathContent = display ? `$$${children}$$` : `$${children}$`;

  return (
    <div
      ref={mathRef}
      className={`mathjax-container ${className}`}
      dangerouslySetInnerHTML={{ __html: mathContent }}
    />
  );
};

export default MathJax;
