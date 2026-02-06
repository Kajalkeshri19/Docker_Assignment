# Docker Assignment – Week 1

This repository contains my **Week 1 Docker assignment**, where I explored Docker fundamentals by running and configuring multiple containers, handling ports, health checks, and understanding real-world issues like PostgreSQL version upgrades.

---

##  Objectives

- Understand Docker basics (images, containers, ports, volumes)
- Run multiple services using Docker
- Configure volume mounts and port bindings
- Implement health checks

---

##  Services Used

| Service     | Docker Image              | Purpose                         | Port |
|------------|---------------------------|---------------------------------|------|
| Nginx      | `nginx`                   | Serve static HTML               | 8080 |
| Node.js    | `node:18`                 | Backend API & health endpoint   | 3000 |
| Redis      | `redis`                   | In-memory cache                 | 6379 |
| PostgreSQL | `postgres:18`             | Relational database             | 5432 |
| Portainer  | `portainer/portainer-ce`  | Docker UI management            | 9000 |


---

## How to Run
```bash
chmod +x docker-commands.sh
./docker-commands.sh
