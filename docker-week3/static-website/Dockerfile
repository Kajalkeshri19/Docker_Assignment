# Static Website Dockerfile
# Base image: Nginx on Alpine (very small footprint)
FROM nginx:1.27-alpine

# Copy custom Nginx configuration (SPA routing, caching, health, security)
COPY nginx.conf /etc/nginx/nginx.conf

# Copy production build files into Nginx's web root
COPY build/ /usr/share/nginx/html/

# Adjust ownership and permissions for non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

# Run as non-root user for security
USER nginx

# Expose HTTP port
EXPOSE 80

# Health check: simple HTTP GET on /
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

# Metadata labels
LABEL maintainer="your-email@example.com"
LABEL description="Static website served by Nginx Alpine"
LABEL version="1.0"
