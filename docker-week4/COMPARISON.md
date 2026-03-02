# Manual vs Docker Compose Workflow

- Manual (single service):
  - Start individual containers with `docker run`.
  - Manually configure networks, volumes, and environment variables.
  - Harder to reproduce; more manual steps for dependencies.

- Docker Compose (this project):
  - Single `docker-compose up` to bring entire stack.
  - Named volumes and network declared in YAML for reproducibility.
  - Healthchecks and `depends_on` configured so services wait for dependencies.
  - Easier to run tests using `docker-compose run` against the running stack.
