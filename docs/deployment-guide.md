# Deployment Guide for Passport Reader AI

## Overview
This guide covers deployment options for the Passport Reader AI system for production use.

## Deployment Options

### Option 1: Cloud-Based Deployment (Recommended)

#### Google Cloud Platform
1. **Create a Google Cloud Project**
   ```bash
   gcloud projects create passport-reader-vietnam
   gcloud config set project passport-reader-vietnam
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable vision.googleapis.com
   gcloud services enable cloudstorage.googleapis.com
   ```

3. **Deploy to App Engine**
   ```bash
   gcloud app deploy
   ```

#### Benefits:
- Automatic scaling
- Built-in security
- 99.95% uptime SLA
- Global CDN

### Option 2: On-Premise Deployment

#### Requirements:
- Ubuntu 20.04+ or Windows Server 2019+
- 4GB RAM minimum
- 20GB storage
- SSL certificate

#### Installation Steps:
1. Clone repository
2. Install dependencies
3. Configure API keys
4. Set up reverse proxy (nginx/Apache)
5. Configure SSL
6. Set up monitoring

### Option 3: Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t passport-reader .
docker run -p 3000:3000 passport-reader
```

## API Configuration

### Google Vision API
1. Create service account
2. Download credentials JSON
3. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/credentials.json"
   ```

### AWS Textract
1. Create IAM user
2. Generate access keys
3. Configure AWS CLI:
   ```bash
   aws configure
   ```

## Security Considerations

1. **Data Privacy**
   - Process images in memory only
   - Don't store passport data
   - Use HTTPS everywhere
   - Implement rate limiting

2. **Access Control**
   - Implement authentication
   - Use API keys
   - Whitelist IP addresses
   - Enable CORS properly

3. **Compliance**
   - Follow GDPR guidelines
   - Implement data retention policies
   - Maintain audit logs
   - Regular security updates

## Performance Optimization

1. **Caching**
   - Use CDN for static assets
   - Implement Redis for session data
   - Cache OCR models

2. **Load Balancing**
   - Use nginx or HAProxy
   - Implement health checks
   - Auto-scaling policies

## Monitoring

1. **Metrics to Track**
   - Processing time per passport
   - Success/failure rates
   - API usage and costs
   - System resources

2. **Tools**
   - Prometheus + Grafana
   - ELK Stack
   - Cloud provider monitoring

## Backup and Recovery

1. **Backup Strategy**
   - Daily configuration backups
   - API key rotation
   - Disaster recovery plan

2. **Testing**
   - Regular restore tests
   - Failover procedures
   - Load testing

## Support

For deployment assistance:
- Open an issue on GitHub
- Contact: support@passportreader.ai
- Documentation: docs.passportreader.ai