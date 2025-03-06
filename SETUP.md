# Setting Up Ulixee Scraper Without Docker

This guide will help you set up and run the Ulixee Scraper application directly on your server without using Docker.

## Prerequisites

1. **Node.js**: Version 16.x or newer (18.x recommended)
   ```bash
   # Check your Node.js version
   node -v
   
   # If you need to update Node.js, consider using NVM (Node Version Manager)
   # Install NVM
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
   source ~/.bashrc
   
   # Install Node.js 18
   nvm install 18
   nvm use 18
   ```

2. **Google Chrome**: Required for Ulixee Hero
   ```bash
   # Install Chrome on Ubuntu/Debian
   wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
   sudo apt install ./google-chrome-stable_current_amd64.deb
   ```

3. **Chrome dependencies**:
   ```bash
   sudo apt-get update && sudo apt-get install -y \
       fonts-liberation \
       libasound2 \
       libatk-bridge2.0-0 \
       libatk1.0-0 \
       libatspi2.0-0 \
       libcairo2 \
       libcups2 \
       libdbus-1-3 \
       libdrm2 \
       libgbm1 \
       libglib2.0-0 \
       libgtk-3-0 \
       libnspr4 \
       libnss3 \
       libpango-1.0-0 \
       libxcomposite1 \
       libxdamage1 \
       libxfixes3 \
       libxkbcommon0 \
       libxrandr2 \
       xdg-utils
   ```

## Installation Steps

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/your-username/ulixee-scraper.git
   cd ulixee-scraper
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit the .env file with your API key and other settings
   nano .env
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Test browser compatibility**:
   ```bash
   # Check if Chrome is installed properly
   google-chrome --version
   ```

## Running the Application

1. **Start the application**:
   ```bash
   npm start
   ```

2. **Run in background using PM2** (recommended for production):
   ```bash
   # Install PM2 if not already installed
   npm install -g pm2
   
   # Start the application with PM2
   pm2 start app.js --name "ulixee-scraper"
   
   # Make PM2 auto-start on system reboot
   pm2 startup
   pm2 save
   
   # View logs
   pm2 logs ulixee-scraper
   ```

## Troubleshooting

### Issue: Error with @ulixee/chrome packages

If you encounter errors related to the Chrome package, try these solutions:

1. **Make sure you have a compatible Node.js version**:
   The error `SyntaxError: Unexpected token '.'` usually indicates you're using an older Node.js version that doesn't support optional chaining (`?.`). Update to Node.js 16 or newer.

2. **Use the system Chrome**:
   If the bundled Chrome installation fails, you can use the system Chrome by adding this environment variable to your .env file:
   ```
   ULIXEE_CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
   ```

3. **Check Chrome installation**:
   Make sure Chrome is properly installed and all dependencies are available:
   ```bash
   # Test Chrome
   google-chrome --version
   ```

### Issue: CloudNode connection problems

If the Ulixee Hero cannot connect to CloudNode:

1. **Check ports**:
   Make sure port 1818 (or your configured CLOUD_PORT) is not blocked by a firewall.

2. **Check the CloudNode logs**:
   Look for specific error messages when CloudNode starts.

## Security Considerations

1. **API Key**: Always use a strong, randomly generated API key in production.

2. **Firewall**: Consider restricting access to the API endpoint with a firewall.

3. **HTTPS**: For production use, set up an HTTPS proxy (like Nginx) in front of the application.