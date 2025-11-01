import { createTheme, rem } from '@mantine/core';

// Define custom color palette
export const theme = createTheme({
  // Custom color palettes (10 shades each)
  colors: {
    corporate: [
      '#eef6ff', '#d9eaff', '#b7d6ff', '#8bbcff', '#5ea2ff',
      '#3e8dff', '#1f78ff', '#0f64e6', '#0a54bf', '#08479f'
    ],
    accent: [
      '#e9fffb', '#ccfff6', '#9cfced', '#66f3e1', '#3be6d3',
      '#1fd2c1', '#12b3a6', '#0d9188', '#0b796f', '#096459'
    ],
  },
  // Font configuration
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace:
    'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

  // Primary color - use blue as corporate color
  primaryColor: 'blue',

  // Primary shade configuration for light/dark modes
  primaryShade: { light: 6, dark: 8 },

  // Spacing configuration
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(20),
    xl: rem(24),
    xxl: rem(32),
  },

  // Font sizes
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),
    xxl: rem(24),
  },

  // Line heights
  lineHeights: {
    xs: '1.2',
    sm: '1.35',
    md: '1.5',
    lg: '1.6',
    xl: '1.65',
  },

  // Headings configuration
  headings: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
    textWrap: 'pretty',
    sizes: {
      h1: {
        fontSize: rem(36),
        lineHeight: '1.1',
        fontWeight: '800',
      },
      h2: {
        fontSize: rem(28),
        lineHeight: '1.2',
        fontWeight: '700',
      },
      h3: {
        fontSize: rem(22),
        lineHeight: '1.3',
        fontWeight: '600',
      },
      h4: {
        fontSize: rem(18),
        lineHeight: '1.4',
        fontWeight: '600',
      },
      h5: {
        fontSize: rem(16),
        lineHeight: '1.5',
        fontWeight: '500',
      },
      h6: {
        fontSize: rem(14),
        lineHeight: '1.5',
        fontWeight: '500',
      },
    },
  },

  // Radius configuration
  radius: {
    xs: rem(2),
    sm: rem(4),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },

  // Default radius
  defaultRadius: 'md',

  // Shadows - Enhanced for dark/light modes
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Breakpoints
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '64em',
    lg: '80em',
    xl: '96em',
  },

  // Auto contrast for better accessibility
  autoContrast: true,
  luminanceThreshold: 0.3,

  // Enhanced focus styles
  focusRing: 'auto',

  // Cursor type
  cursorType: 'pointer',

  // Respect reduced motion
  respectReducedMotion: true,

  // Default gradient - Corporate
  defaultGradient: {
    from: 'corporate',
    to: 'accent',
    deg: 135,
  },

  // Custom theme extensions
  other: {
    // Custom font weights
    fontWeights: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    // Custom z-index values
    zIndex: {
      hide: -1,
      auto: 'auto',
      base: 0,
      docked: 10,
      dropdown: 1000,
      sticky: 1100,
      banner: 1200,
      overlay: 1300,
      modal: 1400,
      popover: 1500,
      skipLink: 1600,
      toast: 1700,
      tooltip: 1800,
    },

    // Animation durations
    transitions: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
  },

  // Component-specific overrides
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },

    ActionIcon: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        root: {
          // Ensure size prop is always a string
        },
      },
    },

    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
        padding: 'md',
      },
    },

    Input: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },

    Container: {
      defaultProps: {
        sizes: {
          xs: rem(540),
          sm: rem(720),
          md: rem(960),
          lg: rem(1140),
          xl: rem(1320),
        },
      },
    },
  },
});

 