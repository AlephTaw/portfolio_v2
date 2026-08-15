# Docker and Docker Compose tutorial

An implementation-oriented guide to container images, containers, Dockerfiles,
Compose, testing, and production operations. Examples use the modern
`docker compose` subcommand and assume Docker Engine or Docker Desktop is
installed.

## Tutorial map

**Motivation:** Docker spans build, runtime, networking, storage, orchestration,
and operations, so a deliberate sequence prevents command memorization without
understanding.

**Goal:** Build, test, run, and operate a small multi-container application with
clear boundaries between development and production.

1. Container and image fundamentals
2. The Docker CLI lifecycle
3. Writing effective Dockerfiles
4. Build context, cache, tags, and registries
5. Networking, ports, volumes, and environment
6. Docker Compose fundamentals
7. Compose development workflows
8. Testing Docker containers
9. Security and image quality
10. Docker in production
11. Troubleshooting and operational commands

## Container and image fundamentals

**Motivation:** Images and containers are different objects with different
lifecycles; confusing them leads to lost data and brittle deployments.

**Goal:** Explain how an immutable image becomes a runnable, isolated container.

An image is a read-only package of files, binaries, libraries, and configuration.
It is built from layers. A container is a runtime instance of an image plus
configuration such as ports, mounts, environment variables, and its command.

```sh
docker pull nginx:alpine
docker image ls
docker run --name web nginx:alpine
docker ps
docker ps --all
docker stop web
docker rm web
```

Containers are disposable by default. Data written only to the container’s
writable layer disappears when the container is removed; use a volume or bind
mount for data that must outlive it.

## The Docker CLI lifecycle

**Motivation:** A predictable lifecycle makes local development repeatable and
makes failures easier to locate.

**Goal:** Create, inspect, interact with, stop, and remove containers safely.

```sh
docker run --detach --name web --publish 8080:80 nginx:alpine
docker logs --follow web
docker exec --interactive --tty web sh
docker inspect web
docker stats web
docker stop web
docker rm web
```

`docker run` creates and starts a container. `docker start` restarts an existing
stopped container. `docker exec` runs a new process inside a running container;
it does not change the image.

## Writing effective Dockerfiles

**Motivation:** A Dockerfile makes an environment reproducible, but its ordering
and contents affect build speed, image size, security, and correctness.

**Goal:** Build a small image with explicit dependencies, a non-root runtime,
and a clear startup command.

```dockerfile
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src ./src

RUN useradd --create-home appuser
USER appuser

EXPOSE 8080
CMD ["python", "-m", "src.main"]
```

Common instructions include `FROM`, `WORKDIR`, `COPY`, `RUN`, `ENV`, `ARG`,
`EXPOSE`, `USER`, `ENTRYPOINT`, and `CMD`. `EXPOSE` documents the intended
container port; it does not publish that port to the host.

Use a `.dockerignore` file to keep secrets, caches, virtual environments, Git
metadata, and unrelated files out of the build context:

```text
.git
.venv
__pycache__
*.pyc
.env
```

For compiled applications or dependency-heavy builds, use multi-stage builds so
the final image contains runtime artifacts rather than compilers and caches.

## Build context, cache, tags, and registries

**Motivation:** Build context, cache, and tags determine whether builds are fast,
reproducible, and identifiable after they leave a developer laptop.

**Goal:** Build an intentionally tagged image, understand cache boundaries, and
publish it to a registry.

```sh
docker build --tag example/web:0.1.0 .
docker image inspect example/web:0.1.0
docker tag example/web:0.1.0 registry.example.com/team/web:0.1.0
docker login registry.example.com
docker push registry.example.com/team/web:0.1.0
docker pull registry.example.com/team/web:0.1.0
```

Copy dependency manifests and install dependencies before copying frequently
changing source code. That ordering lets Docker reuse earlier layers when only
application code changes. Use immutable version tags or digests for deployment;
`latest` is a moving label, not a release strategy.

## Networking, ports, volumes, and environment

**Motivation:** Containers are isolated by default, so applications need explicit
interfaces for traffic, configuration, and durable state.

**Goal:** Distinguish container ports from host ports and choose the right form
of storage and configuration for each workload.

```sh
docker network create appnet
docker volume create appdata
docker run -d --name db --network appnet \
  --mount source=appdata,target=/var/lib/data \
  -e POSTGRES_PASSWORD=dev-only postgres:16
docker run --rm --network appnet -e DATABASE_HOST=db example/web:0.1.0
```

Containers on the same user-defined network can address one another by service
or container name. Publish a port with `HOST:CONTAINER`, such as `-p 8080:80`.
Bind mounts are useful for development source code; named volumes are usually a
better fit for Docker-managed persistent data. Do not bake secrets into images.

## Docker Compose fundamentals

**Motivation:** A real application often consists of an app, database, worker,
and supporting services that must be configured together.

**Goal:** Describe a multi-container application declaratively and operate it as
one project.

```yaml
services:
  web:
    build: .
    ports:
      - "8080:8080"
    environment:
      DATABASE_HOST: db
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: dev-only
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  db-data:
```

```sh
docker compose up --build --detach
docker compose ps
docker compose logs --follow web
docker compose exec web sh
docker compose down
```

Compose creates a project network and gives services discoverable names. A
healthcheck expresses readiness; `depends_on` alone expresses startup ordering,
not application readiness.

## Compose development workflows

**Motivation:** Development needs fast code iteration and debugging, while the
same service graph should remain understandable and reproducible.

**Goal:** Use Compose overrides, profiles, mounts, and one-off commands without
turning development configuration into production configuration.

```yaml
# compose.dev.yaml
services:
  web:
    volumes:
      - ./src:/app/src
    environment:
      LOG_LEVEL: debug
```

```sh
docker compose -f compose.yaml -f compose.dev.yaml up --build
docker compose run --rm web python -m pytest
docker compose config
```

The later Compose file overrides or extends values from the earlier one. Use
profiles for optional services such as debuggers or admin tools.

## Testing Docker containers

**Motivation:** A successful image build does not prove that the application
starts, serves traffic, persists data, or works with its dependencies.

**Goal:** Test the image and the composed system before publishing or deploying.

A practical test pyramid:

1. Run unit tests outside the image for fast feedback.
2. Build the image with the same Dockerfile used for release.
3. Run the image’s test suite in a clean container.
4. Start the Compose stack and test service-to-service behavior.
5. Verify health, logs, exit codes, ports, and persistence.

```sh
docker build --tag example/web:test .
docker run --rm example/web:test python -m pytest
docker run --detach --name web-test --publish 18080:8080 example/web:test
curl --fail http://localhost:18080/health
docker logs web-test
docker rm --force web-test
```

Compose integration test commands:

```sh
docker compose -f compose.yaml -f compose.test.yaml up \
  --build --abort-on-container-failure --exit-code-from web
docker compose -f compose.yaml -f compose.test.yaml down --volumes
```

In CI, build once, load or export the test image, run tests against that exact
artifact, and push only after the tests pass. Keep test data isolated and clean
up containers, networks, and volumes even after failures.

## Security and image quality

**Motivation:** Containers share a kernel with the host, so insecure images or
overly broad runtime permissions can turn application bugs into larger risks.

**Goal:** Reduce attack surface and make image provenance, permissions, and
configuration reviewable.

- Use trusted, maintained, and deliberately versioned base images.
- Run as a non-root user with only the capabilities the process needs.
- Keep secrets out of Dockerfiles, images, logs, and source-controlled Compose files.
- Use `.dockerignore` and multi-stage builds to reduce context and final size.
- Scan images and dependencies in CI; treat findings according to your risk policy.
- Pin release inputs where reproducibility matters and record the image digest.
- Set resource limits and avoid mounting the Docker socket into application containers.

## Docker in production

**Motivation:** Production requires repeatable releases, durable data, health
signals, recovery behavior, observability, and a clear ownership model.

**Goal:** Promote a tested image safely and operate it on infrastructure suited
to the application’s availability and scale needs.

For a single server, maintain a production-specific Compose override:

```yaml
# compose.production.yaml
services:
  web:
    image: registry.example.com/team/web:2026.08.13
    restart: always
    ports:
      - "80:8080"
    read_only: true
    tmpfs:
      - /tmp
```

```sh
docker compose -f compose.yaml -f compose.production.yaml pull
docker compose -f compose.yaml -f compose.production.yaml up -d
docker compose -f compose.yaml -f compose.production.yaml ps
```

Production changes commonly remove source-code bind mounts, use release-specific
environment configuration, add restart policies, and connect external logging
or managed data services. Rebuild and recreate the changed service when its
image changes:

```sh
docker compose -f compose.yaml -f compose.production.yaml build web
docker compose -f compose.yaml -f compose.production.yaml up --no-deps -d web
```

For higher availability or scale, use a platform designed for scheduling and
service management rather than treating one Compose host as a cluster. Plan
image promotion, rollback, migrations, backups, health checks, logs, metrics,
alerts, and access control before the first production incident.

## Troubleshooting and operational commands

**Motivation:** Most container failures become straightforward once you inspect
the correct layer: build, process, network, storage, configuration, or host.

**Goal:** Diagnose failures with evidence instead of repeatedly restarting.

```sh
docker compose config
docker compose ps --all
docker compose logs --tail=200 web
docker inspect web
docker image history example/web:0.1.0
docker system df
docker events
```

Check the container command and exit code first, then environment and mounted
paths, then network/service names, then healthcheck output and host resources.
Use `docker compose exec` only for diagnosis; make permanent fixes in the image,
Compose configuration, or deployment system.

## Comprehension checks

### Container and image fundamentals

1. **Check:** What is the difference between an image and a container?
   **Answer:** An image is a read-only package; a container is a configured runtime instance.
2. **Check:** Where should data go if it must survive container removal?
   **Answer:** A named volume or an intentional bind mount.

### The Docker CLI lifecycle

1. **Check:** Run `nginx:alpine` in the background on host port `8080`.
   **Answer:** `docker run -d --name web -p 8080:80 nginx:alpine`.
2. **Check:** Run a shell inside the running container.
   **Answer:** `docker exec -it web sh`.

### Writing effective Dockerfiles

1. **Check:** Which instruction selects the base image?
   **Answer:** `FROM`.
2. **Check:** Which instruction sets the default process?
   **Answer:** `CMD` (or `ENTRYPOINT` for the executable contract).

### Build context, cache, tags, and registries

1. **Check:** Build and tag the current directory as `example/web:1.0`.
   **Answer:** `docker build -t example/web:1.0 .`.
2. **Check:** Why copy dependency manifests before source code?
   **Answer:** To preserve dependency layers in the build cache when source changes.

### Networking, ports, volumes, and environment

1. **Check:** Publish container port `8080` as host port `80`.
   **Answer:** `-p 80:8080`.
2. **Check:** How does one Compose service reach another?
   **Answer:** By the other service’s Compose service name on the project network.

### Docker Compose fundamentals

1. **Check:** Start a Compose stack in the background and build images first.
   **Answer:** `docker compose up --build -d`.
2. **Check:** What does a healthcheck add beyond `depends_on`?
   **Answer:** A readiness signal that can be used to gate dependent startup.

### Compose development workflows

1. **Check:** Overlay a development file on the base file.
   **Answer:** `docker compose -f compose.yaml -f compose.dev.yaml up`.
2. **Check:** Validate the merged configuration without starting services.
   **Answer:** `docker compose config`.

### Testing Docker containers

1. **Check:** Run tests in the image and remove the test container afterward.
   **Answer:** `docker run --rm example/web:test python -m pytest`.
2. **Check:** Which Compose flags make the test job’s exit code authoritative?
   **Answer:** `--abort-on-container-failure --exit-code-from web`.

### Security and image quality

1. **Check:** Name two ways to reduce container privileges.
   **Answer:** Run as non-root and drop unnecessary capabilities.
2. **Check:** Where should production secrets not be placed?
   **Answer:** In Dockerfiles, images, logs, or committed Compose files.

### Docker in production

1. **Check:** Apply a production override to the base Compose file.
   **Answer:** `docker compose -f compose.yaml -f compose.production.yaml up -d`.
2. **Check:** What should happen after a service image changes?
   **Answer:** Rebuild or pull the new image, then recreate the service.

### Troubleshooting and operational commands

1. **Check:** Show the last 200 lines of a service’s logs.
   **Answer:** `docker compose logs --tail=200 web`.
2. **Check:** What should you inspect before repeatedly restarting a failed service?
   **Answer:** Its exit code, command, logs, environment, mounts, healthcheck, and resources.

## Further reading

- [Docker overview](https://docs.docker.com/get-started/docker-overview/)
- [Writing a Dockerfile](https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Test before push with GitHub Actions](https://docs.docker.com/build/ci/github-actions/test-before-push/)
- [Use Compose in production](https://docs.docker.com/compose/how-tos/production/)
