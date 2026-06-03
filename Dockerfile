# Use official Playwright image instead of plain Node
FROM mcr.microsoft.com/playwright:v1.54.0-jammy

# Install pnpm globally
RUN npm install -g pnpm@11.3.0

# Set working directory
WORKDIR /app

# Copy dependency definition, workspace configuration, and lock files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.json eslint.config.js ./

# Install all dependencies (including devDependencies for linting/typechecking)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY src ./src

# Run the linting checks during image build
RUN pnpm run lint

# Expose the application port (defaults to 3000)
EXPOSE 3000

# Set environment variable defaults
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "start"]
