# Use Node 22 on Debian Bookworm as the base image
FROM node:22-bookworm

# Install pnpm globally
RUN npm install -g pnpm@11.3.0

# Set working directory
WORKDIR /app

# Copy dependency definition and lock files
COPY package.json pnpm-lock.yaml tsconfig.json eslint.config.js ./

# Install all dependencies (including devDependencies for linting/typechecking)
RUN pnpm install --frozen-lockfile

# Install Playwright Chromium browser and its system dependencies
RUN pnpm exec playwright install --with-deps chromium

# Copy the rest of the application code
COPY src ./src

# Run the linting checks during image build
RUN pnpm run lint

# Expose the application port (defaults to 3000)
EXPOSE 3000

# Set environment variable defaults
ENV PORT=3000
ENV HOST=0.0.0.0

# Start the application
CMD ["pnpm", "start"]
