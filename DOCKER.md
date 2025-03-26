# Docker Deployment Guide for WhatsApp Web API

This guide covers how to deploy the WhatsApp Web API using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your system
- Basic knowledge of Docker and Docker Compose
- Port 3000 available on your host (or configure a different port in docker-compose.yml)

## Environment Configuration

1. Create a `.env` file in the root directory of the project (or copy from `.env.example`):

```bash
cp .env.example .env
```

2. Edit the `.env` file to configure your environment:

```
# Required
API_KEY=your_secure_api_key
BASE_WEBHOOK_URL=http://your-server-address:3000/webhook

# Optional (customize as needed)
SWAGGER_USER=admin
SWAGGER_PASSWORD=your_secure_password
```

## Deployment Options

### Option 1: Using Docker Compose (Recommended)

1. Build and start the container:

```bash
docker-compose up -d
```

2. Check container logs:

```bash
docker-compose logs -f
```

3. Stop the container:

```bash
docker-compose down
```

### Option 2: Using Docker Directly

1. Build the Docker image:

```bash
docker build -t whatsapp-web-api .
```

2. Run the container:

```bash
docker run -d \
  --name whatsapp-web-api \
  -p 3000:3000 \
  -v $(pwd)/sessions:/app/sessions \
  -v $(pwd)/assets:/app/assets \
  -e API_KEY=your_secure_api_key \
  -e BASE_WEBHOOK_URL=http://your-server-address:3000/webhook \
  --restart unless-stopped \
  whatsapp-web-api
```

## Accessing the API

Once deployed, you can access the API at:

- API Endpoints: `http://your-server-address:3000/`
- Swagger Documentation: `http://your-server-address:3000/api-docs`

## Volume Persistence

The following directories are persisted as volumes:

- `./sessions:/app/sessions` - WhatsApp session data
- `./assets:/app/assets` - Static assets

## Security Considerations

1. **Change Default Credentials**:
   - Set a strong API key in the `.env` file
   - Change the default Swagger UI credentials

2. **Use HTTPS in Production**:
   - Consider using a reverse proxy like Nginx with SSL/TLS

3. **Rate Limiting**:
   - Configure appropriate rate limits in the `.env` file

4. **Webhook Security**:
   - Ensure your webhook URL is properly secured

## Troubleshooting

1. **Container fails to start**:
   - Check logs: `docker-compose logs -f`
   - Verify environment variables are correctly set

2. **QR Code scanning issues**:
   - Ensure Chromium is working correctly in the container
   - Try restarting the container: `docker-compose restart`

3. **Permission issues with volumes**:
   - Check permissions on the host directories: `sessions` and `assets`
   - Run `chmod -R 777 sessions assets` if needed (use more restrictive permissions in production) 