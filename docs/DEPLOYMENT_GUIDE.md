# Enterprise Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying SYMBI Resonate in an enterprise production environment with high availability, security, and scalability.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Configuration](#database-configuration)
4. [Application Deployment](#application-deployment)
5. [Security Configuration](#security-configuration)
6. [Monitoring Setup](#monitoring-setup)
7. [Backup & Disaster Recovery](#backup--disaster-recovery)
8. [Scaling Guidelines](#scaling-guidelines)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Services
- **Database**: PostgreSQL 14+ (via Supabase or self-hosted)
- **Cache**: Redis 6+ (for session storage and caching)
- **CDN**: CloudFront, Cloudflare, or similar
- **Load Balancer**: AWS ALB, NGINX, or similar
- **Container Orchestration**: Kubernetes 1.24+ (recommended) or Docker Swarm

### Required Tools
- Docker 20.10+
- kubectl 1.24+
- Terraform 1.3+ (for IaC)
- Node.js 18+ (for local development)

### Access Requirements
- AWS/GCP/Azure account with appropriate permissions
- Domain name with DNS management access
- SSL/TLS certificates
- Monitoring service accounts (Sentry, DataDog, etc.)

## Infrastructure Setup

### Redis Cache Configuration

#### Upstash (Recommended)
1. Create a Redis database at [upstash.com](https://upstash.com)
2. Get your REST URL and token from the dashboard
3. Configure environment variables:
```bash
REDIS_URL=https://your-redis-url.upstash.io
REDIS_PASSWORD=your_redis_token
REDIS_TLS=true
```

#### AWS ElastiCache
1. Launch an ElastiCache Redis instance in your VPC
2. Configure security groups to allow access from your functions
3. Set environment variables:
```bash
REDIS_URL=redis://your-elasticache-endpoint:6379
REDIS_PASSWORD=your_redis_auth_token  # if using auth
REDIS_TLS=false  # unless using in-transit encryption
```

#### Local Development
For local development without Redis, the application falls back to an in-memory cache. To test Redis locally:
```bash
docker run -d -p 6379:6379 redis:7-alpine
export REDIS_URL=redis://localhost:6379
```

### 1. Cloud Infrastructure (AWS Example)

#### Using Terraform

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Review planned changes
terraform plan -var-file="production.tfvars"

# Apply infrastructure
terraform apply -var-file="production.tfvars"
```

#### Manual Setup

**VPC Configuration:**
- Create VPC with public and private subnets across 3 availability zones
- Configure NAT gateways for private subnet internet access
- Set up security groups for application, database, and cache layers

**Database (RDS PostgreSQL):**
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier symbi-resonate-prod \
  --db-instance-class db.r6g.xlarge \
  --engine postgres \
  --engine-version 14.7 \
  --master-username admin \
  --master-user-password <secure-password> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --multi-az \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --vpc-security-group-ids sg-xxxxx
```

**Redis (ElastiCache):**
```bash
# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id symbi-resonate-cache \
  --replication-group-description "SYMBI Resonate Cache" \
  --engine redis \
  --cache-node-type cache.r6g.large \
  --num-cache-clusters 3 \
  --automatic-failover-enabled \
  --at-rest-encryption-enabled \
  --transit-encryption-enabled \
  --auth-token <secure-token>
```

### 2. Kubernetes Cluster Setup

```bash
# Create EKS cluster
eksctl create cluster \
  --name symbi-resonate-prod \
  --version 1.28 \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.xlarge \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 10 \
  --managed \
  --asg-access \
  --external-dns-access \
  --full-ecr-access \
  --alb-ingress-access

# Configure kubectl
aws eks update-kubeconfig --name symbi-resonate-prod --region us-east-1
```

## Database Configuration

### 1. Run Migrations

```bash
# Connect to database
psql -h <database-host> -U admin -d symbi_resonate

# Run migration scripts
\i src/database/schema.sql
\i src/database/migrations/001_enterprise_security.sql
```

### 2. Configure Connection Pooling

```sql
-- Set connection pool parameters
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '20MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Reload configuration
SELECT pg_reload_conf();
```

### 3. Create Database Users

```sql
-- Create application user
CREATE USER symbi_app WITH PASSWORD '<secure-password>';
GRANT CONNECT ON DATABASE symbi_resonate TO symbi_app;
GRANT USAGE ON SCHEMA public TO symbi_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO symbi_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO symbi_app;

-- Create read-only user for analytics
CREATE USER symbi_readonly WITH PASSWORD '<secure-password>';
GRANT CONNECT ON DATABASE symbi_resonate TO symbi_readonly;
GRANT USAGE ON SCHEMA public TO symbi_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO symbi_readonly;
```

## Application Deployment

### 1. Build Docker Image

```dockerfile
# Dockerfile.production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY src/package*.json ./src/

# Install dependencies
RUN npm ci --only=production
RUN cd src && npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["node", "build/index.js"]
```

```bash
# Build image
docker build -f Dockerfile.production -t symbi-resonate:latest .

# Tag for registry
docker tag symbi-resonate:latest <registry>/symbi-resonate:latest

# Push to registry
docker push <registry>/symbi-resonate:latest
```

### 2. Deploy to Kubernetes

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: symbi-resonate
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: symbi-resonate
  template:
    metadata:
      labels:
        app: symbi-resonate
    spec:
      containers:
      - name: symbi-resonate
        image: <registry>/symbi-resonate:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: symbi-resonate-secrets
        - configMapRef:
            name: symbi-resonate-config
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /readyz
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

```bash
# Apply Kubernetes manifests
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml
kubectl apply -f kubernetes/hpa.yaml
```

### 3. Configure Horizontal Pod Autoscaling

```yaml
# kubernetes/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: symbi-resonate-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: symbi-resonate
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Security Configuration

### 1. Generate Encryption Keys

```bash
# Generate encryption key
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 64

# Generate session secret
openssl rand -base64 64

# Generate API key salt
openssl rand -base64 32
```

### 2. Configure Secrets in Kubernetes

```bash
# Create secrets
kubectl create secret generic symbi-resonate-secrets \
  --from-literal=ENCRYPTION_KEY=<base64-key> \
  --from-literal=JWT_SECRET=<jwt-secret> \
  --from-literal=SESSION_SECRET=<session-secret> \
  --from-literal=DATABASE_URL=<database-url> \
  --from-literal=REDIS_URL=<redis-url> \
  --namespace=production
```

### 3. Configure SSL/TLS

```yaml
# kubernetes/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: symbi-resonate-ingress
  namespace: production
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - symbi-resonate.com
    - api.symbi-resonate.com
    secretName: symbi-resonate-tls
  rules:
  - host: symbi-resonate.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: symbi-resonate
            port:
              number: 3000
```

## Monitoring Setup

### 1. Prometheus & Grafana

```bash
# Install Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

### 2. Configure Application Metrics

```yaml
# kubernetes/servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: symbi-resonate
  namespace: production
spec:
  selector:
    matchLabels:
      app: symbi-resonate
  endpoints:
  - port: metrics
    interval: 30s
```

### 3. Set Up Alerts

```yaml
# prometheus-alerts.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: symbi-resonate-alerts
  namespace: production
spec:
  groups:
  - name: symbi-resonate
    interval: 30s
    rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "High error rate detected"
    - alert: HighResponseTime
      expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High response time detected"
```

## Backup & Disaster Recovery

### 1. Database Backups

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/symbi_resonate_$TIMESTAMP.sql.gz"

# Create backup
pg_dump -h <database-host> -U admin symbi_resonate | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://symbi-resonate-backups/postgres/

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### 2. Configure Automated Backups

```yaml
# kubernetes/cronjob-backup.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: production
spec:
  schedule: "0 2 * * *" # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:14
            command:
            - /bin/sh
            - -c
            - |
              pg_dump $DATABASE_URL | gzip | aws s3 cp - s3://symbi-resonate-backups/postgres/backup-$(date +%Y%m%d).sql.gz
            env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: symbi-resonate-secrets
                  key: DATABASE_URL
          restartPolicy: OnFailure
```

## Scaling Guidelines

### Vertical Scaling
- **Small**: 2 vCPU, 4GB RAM (up to 1000 users)
- **Medium**: 4 vCPU, 8GB RAM (up to 10,000 users)
- **Large**: 8 vCPU, 16GB RAM (up to 100,000 users)
- **X-Large**: 16 vCPU, 32GB RAM (100,000+ users)

### Horizontal Scaling
- Minimum 3 replicas for high availability
- Scale based on CPU (70%) and memory (80%) utilization
- Maximum 10 replicas per deployment

### Database Scaling
- Use read replicas for read-heavy workloads
- Implement connection pooling (PgBouncer)
- Consider sharding for very large datasets

## Troubleshooting

### Common Issues

**High Memory Usage:**
```bash
# Check pod memory
kubectl top pods -n production

# Restart pods
kubectl rollout restart deployment/symbi-resonate -n production
```

**Database Connection Issues:**
```bash
# Check database connectivity
kubectl exec -it <pod-name> -n production -- psql $DATABASE_URL

# Check connection pool
kubectl logs <pod-name> -n production | grep "connection"
```

**Performance Issues:**
```bash
# Check application logs
kubectl logs -f <pod-name> -n production

# Check metrics
kubectl port-forward -n production svc/symbi-resonate 9090:9090
```

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL/TLS certificates installed
- [ ] Monitoring and alerting configured
- [ ] Backup automation verified
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Team trained on operations
- [ ] Incident response plan in place

## Support

For deployment support, contact:
- Email: ops@symbi-resonate.com
- Slack: #deployment-support
- Documentation: https://docs.symbi-resonate.com