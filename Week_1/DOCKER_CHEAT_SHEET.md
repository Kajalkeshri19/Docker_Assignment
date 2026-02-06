
## 1. Basic Docker Commands

docker --version            # Check Docker version
docker ps                   # Running containers
docker ps -a                # Show all containers
docker images               # List images
docker logs <container>     # View container logs
docker exec -it <container>    # Enter container
docker stop <container>     # Stop container
docker rm <container>       # Remove container
docker rmi <image>          # Remove image

## 2. Ports & Port Binding
docker run -p <host_port>:<container_port>
### Example:
docker run -p 8080:80 nginx   # Map host port 8080 to container port 80

## 3. Volumes & Mounts
$(pwd) -> Print working directory
Shows current directory path

### Bind mount example (Nginx HTML)
-v $(pwd)/html:/usr/share/nginx/html:ro





