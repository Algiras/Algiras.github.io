# Lithuanian Real Estate Tax Calculator

A React application for calculating Lithuanian real estate taxes under current and proposed systems.

## Features

- Compare current (2023-2025) and proposed (2026+) Lithuanian real estate tax systems
- Calculate taxes based on property values, ownership status, and other factors
- Multilingual support (English, Lithuanian, German)
- Detailed tax calculation explanations

## Development

### Prerequisites

- Node.js (v18 or later recommended)
- Yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lithuanian-real-estate-calculator.git
cd lithuanian-real-estate-calculator

# Install dependencies
yarn install
```

### Running the application

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

### Testing

The project uses Jest for testing. Run tests with:

```bash
yarn test
```

## Continuous Integration

This project uses GitHub Actions for continuous integration. The workflow automatically runs tests on:

- Push to the main branch
- Pull requests to the main branch

The CI workflow includes:

1. Setting up Node.js environment
2. Installing dependencies with Yarn
3. Running Jest tests

You can view the workflow configuration in `.github/workflows/test.yml`.

## License

This project is open source and available under the MIT License.
