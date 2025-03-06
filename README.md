# Ulixee Scraper API

A web scraping API service that uses Ulixee Hero and Express.js.

## Prerequisites

- Docker and Docker Compose installed on your server
- A secure network environment (the API uses key-based authentication)

## Deployment Instructions

### 1. Configure Environment Variables

Make sure to set your API key by either:
- Editing the `.env` file directly (for development environments)
- Setting environment variables when deploying (recommended for production)

```bash
# Copy example env file and modify with your secure API key
cp .env.example .env
# Edit .env file to set a secure API_KEY
```

### 2. Build and Run with Docker Compose

```bash
# Build and start the service in detached mode
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 3. Stopping the Service

```bash
# Stop the service
docker-compose down
```

## API Usage

### Health Check

```
GET /
```

Response:
```json
{
  "status": "ok",
  "message": "Service is running"
}
```

### Scrape a URL

```
POST /api/scrape
Header: X-API-Key: your_api_key_here
Content-Type: application/json

{
  "url": "https://example.com"
}
```

Response:
```json
{
  "success": true,
  "url": "https://example.com",
  "title": "Example Domain",
  "contentLength": 1234,
  "timestamp": "2023-06-01T12:34:56.789Z"
}
```

## Production Deployment Best Practices

1. Use a reverse proxy (like Nginx) in front of this service
2. Enable HTTPS for all traffic to the service
3. Set a strong API key
4. Consider using Docker Swarm or Kubernetes for high availability
5. Set up monitoring and logging