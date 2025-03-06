FROM node:18-bullseye

# Install Chrome
RUN apt-get update && apt-get install -y wget gnupg && \
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    apt-get install -y \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    curl \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Create a non-root user for better security
RUN groupadd -r ulixeeuser && useradd -r -g ulixeeuser -G audio,video ulixeeuser \
    && mkdir -p /home/ulixeeuser/Downloads \
    && chown -R ulixeeuser:ulixeeuser /home/ulixeeuser

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install dependencies as root (will fix permissions later)
RUN npm install 

# Bundle app source
COPY . .

# Tell Ulixee Hero to use the system Chrome
ENV ULIXEE_CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Expose ports for Express and CloudNode
EXPOSE 3000
EXPOSE 1818

# Set proper permissions for the application files
RUN chown -R ulixeeuser:ulixeeuser /usr/src/app

# Switch to non-root user for better security
USER ulixeeuser

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV CLOUD_PORT=1818
# Note: API_KEY should be set when running the container

# Create a healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "app.js"]