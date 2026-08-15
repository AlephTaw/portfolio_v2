# /// script
# dependencies = ["marimo"]
# requires-python = ">=3.12"
# ///

import marimo

__generated_with = "0.23.16"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    from mlphd_bootcamp import assertion, execute_submission, problem

    return assertion, execute_submission, mo, problem


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    # Docker and Docker Compose tutorial

    This notebook turns the Docker tutorial into short implementation
    exercises. Each topic has a separate exposition cell followed immediately
    by an exercise cell with:

    1. a nested exercise description;
    2. an interactive input area;
    3. an assertion-decorated submission with automatic grading.

    The exercises validate Dockerfiles, Compose snippets, and operational
    commands without starting containers or changing your Docker host.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Commands cheat sheet

    The examples use `IMAGE` for an image reference, `CONTAINER` for a container
    name or ID, and `SERVICE` for a Compose service name.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### Images, builds, and registries

    | Command | Purpose |
    |:--|:--|
    | `docker pull IMAGE` | Download an image from a registry. |
    | `docker image ls` | List images stored locally. |
    | `docker image inspect IMAGE` | Show image configuration and metadata. |
    | `docker build -t IMAGE .` | Build and tag an image from the current build context. |
    | `docker tag SOURCE TARGET` | Add another repository or version tag to an image. |
    | `docker push IMAGE` | Upload a tagged image to a registry. |
    | `docker image rm IMAGE` | Remove a local image reference. |

    ### Containers and runtime options

    | Command or option | Purpose |
    |:--|:--|
    | `docker run IMAGE` | Create and start a container from an image. |
    | `docker run -d --name NAME IMAGE` | Run detached with a stable container name. |
    | `docker ps --all` | List running and stopped containers. |
    | `docker logs CONTAINER` | Read a container's standard output and error. |
    | `docker exec -it CONTAINER COMMAND` | Run a command inside an existing container. |
    | `docker inspect CONTAINER` | Show detailed runtime configuration and state. |
    | `docker stop CONTAINER` | Gracefully stop a running container. |
    | `docker rm --force CONTAINER` | Stop if necessary and remove a container. |
    | `--rm` | Remove a container automatically when its process exits. |
    | `-p HOST:CONTAINER` | Publish a container port on the host. |
    | `--mount source=VOLUME,target=PATH` | Attach durable named-volume storage. |
    | `-e NAME=VALUE` | Set a container environment variable. |

    ### Dockerfile instructions

    | Instruction | Purpose |
    |:--|:--|
    | `FROM` | Select the base image. |
    | `WORKDIR` | Set the working directory for later instructions and startup. |
    | `COPY` | Copy files from the build context into the image. |
    | `RUN` | Execute a build-time command and create an image layer. |
    | `USER` | Select the non-root runtime user. |
    | `EXPOSE` | Document the port used by the application. |
    | `CMD` | Define the default container command. |

    ### Docker Compose

    | Command | Purpose |
    |:--|:--|
    | `docker compose config` | Merge, resolve, and validate Compose configuration. |
    | `docker compose up --build` | Build changed images and start the project. |
    | `docker compose up -d` | Start or update the project in the background. |
    | `docker compose down` | Stop and remove the project's containers and network. |
    | `docker compose ps --all` | Show running and stopped project services. |
    | `docker compose logs --tail=200 SERVICE` | Show bounded recent service logs. |
    | `docker compose run --rm SERVICE COMMAND` | Run a disposable one-off service command. |
    | `docker compose exec SERVICE COMMAND` | Run a command in an existing service container. |
    | `docker compose pull` | Download service images. |
    | `-f BASE -f OVERRIDE` | Merge Compose files from left to right. |
    | `up --no-deps -d SERVICE` | Recreate one service without restarting dependencies. |

    ### Testing and observation

    | Command | Purpose |
    |:--|:--|
    | `curl --fail URL` | Fail when an HTTP health endpoint returns an error status. |
    | `docker stats` | Observe live container CPU, memory, and network usage. |

    Each numbered topic below names the cheat-sheet entries it introduces or
    applies.
    """)
    return


# === MLPHD UNIT START ===
# id: docker-images-containers
# title: Images and containers
# kind: exposition
# difficulty: easy
# teaches: docker-images-containers
# assesses: docker-images-containers
# requires: 
# ===

@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 1. Images and containers

    ### Exposition

    An image is a read-only package of application files and dependencies. A
    container is a configured runtime instance of an image and can be removed
    without changing the source image.

    ### Commands covered

    - `docker pull IMAGE` and `docker image ls` introduce obtaining and locating
      immutable image artifacts.
    - `docker run IMAGE` shows how an image becomes a running container instance.
    - `docker ps --all` distinguishes existing container instances from images.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    docker_exercise_01_description = mo.md(
        """
        ### Exercise

        Create `image_kind` and `container_kind` with the exact values
        `\"read-only package\"` and `\"runtime instance\"`.
        """
    )
    docker_exercise_01_starter = mo.ui.code_editor(
        value='image_kind = "read-only package"\ncontainer_kind = "runtime instance"',
        language="python",
        label="Your Python answer",
        min_height=110,
    )
    docker_exercise_01_submit = mo.ui.run_button(label="Submit answer")
    return (
        docker_exercise_01_description,
        docker_exercise_01_starter,
        docker_exercise_01_submit,
    )




@app.cell(hide_code=True)
def _(
    assertion,
    docker_exercise_01_description,
    docker_exercise_01_starter,
    docker_exercise_01_submit,
    execute_submission,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert _ns.get("image_kind") == "read-only package", "image_kind is incorrect"
        assert _ns.get("container_kind") == "runtime instance", "container_kind is incorrect"
        return _ns

    problem(mo, docker_exercise_01_description, docker_exercise_01_starter, _submission, docker_exercise_01_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: docker-cli-lifecycle
# title: The Docker CLI lifecycle
# kind: exposition
# difficulty: easy
# teaches: docker-cli-lifecycle
# assesses: docker-cli-lifecycle
# requires: docker-images-containers
# ===

@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 2. The Docker CLI lifecycle

    ### Exposition

    The CLI creates, starts, inspects, interacts with, stops, and removes
    containers. `docker exec` runs a process inside an existing container;
    it does not modify the image.

    ### Commands covered

    - `docker run -d --name NAME -p HOST:CONTAINER IMAGE` creates a named,
      detached container and publishes its application port.
    - `docker logs`, `docker exec`, and `docker inspect` observe or interact with
      an existing container without rebuilding its image.
    - `docker stop` and `docker rm --force` cover graceful and forced cleanup.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    docker_exercise_02_description = mo.md(
        """
        ### Exercise

        Create `commands` containing commands to run `nginx:alpine` in the
        background as `web` on port `8080`, inspect its logs, and remove it.
        """
    )
    docker_exercise_02_starter = mo.ui.code_editor(
        value='commands = [\n    "docker run -d --name web -p 8080:80 nginx:alpine",\n    "docker logs web",\n    "docker rm --force web",\n]',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    docker_exercise_02_submit = mo.ui.run_button(label="Submit answer")
    return (
        docker_exercise_02_description,
        docker_exercise_02_starter,
        docker_exercise_02_submit,
    )




@app.cell(hide_code=True)
def _(
    assertion,
    docker_exercise_02_description,
    docker_exercise_02_starter,
    docker_exercise_02_submit,
    execute_submission,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert _ns.get("commands") == [
            "docker run -d --name web -p 8080:80 nginx:alpine",
            "docker logs web",
            "docker rm --force web",
        ], "one or more lifecycle commands are incorrect"
        return _ns

    problem(mo, docker_exercise_02_description, docker_exercise_02_starter, _submission, docker_exercise_02_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: docker-dockerfiles
# title: Dockerfiles
# kind: exposition
# difficulty: easy
# teaches: docker-dockerfiles
# assesses: docker-dockerfiles
# requires: docker-images-containers
# ===

@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 3. Dockerfiles

    ### Exposition

    Dockerfiles describe how to build images. Instruction order affects cache
    reuse, while `USER`, `CMD`, and a small build context improve runtime
    safety and repeatability.

    ### Commands covered

    - `docker build -t IMAGE .` executes the Dockerfile against the current build
      context.
    - `FROM`, `WORKDIR`, `COPY`, and `RUN` define the build sequence and cacheable
      layers.
    - `USER`, `EXPOSE`, and JSON-array `CMD` define safer runtime defaults.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    docker_exercise_03_description = mo.md(
        """
        ### Exercise

        Create `dockerfile` containing `FROM`, `WORKDIR`, `COPY`, `RUN`, `USER`,
        `EXPOSE`, and JSON-array `CMD` instructions for a Python app.
        """
    )
    docker_exercise_03_starter = mo.ui.code_editor(
        value='dockerfile = """FROM python:3.13-slim\nWORKDIR /app\nCOPY requirements.txt ./\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY src ./src\nRUN useradd --create-home appuser\nUSER appuser\nEXPOSE 8080\nCMD [\\"python\\", \\"-m\\", \\"src.main\\"]\n"""',
        language="python",
        label="Your Python answer",
        min_height=230,
    )
    docker_exercise_03_submit = mo.ui.run_button(label="Submit answer")
    return (
        docker_exercise_03_description,
        docker_exercise_03_starter,
        docker_exercise_03_submit,
    )




@app.cell(hide_code=True)
def _(
    assertion,
    docker_exercise_03_description,
    docker_exercise_03_starter,
    docker_exercise_03_submit,
    execute_submission,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _dockerfile = _ns.get("dockerfile", "")
        for _instruction in ("FROM ", "WORKDIR ", "COPY ", "RUN ", "USER ", "EXPOSE ", "CMD ["):
            assert _instruction in _dockerfile, f"missing Dockerfile instruction: {_instruction.strip()}"
        return _ns

    problem(mo, docker_exercise_03_description, docker_exercise_03_starter, _submission, docker_exercise_03_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: docker-builds-registries
# title: Builds, cache, tags, and registries
# kind: exposition
# difficulty: medium
# teaches: docker-builds-registries
# assesses: docker-builds-registries
# requires: docker-dockerfiles
# ===

@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 4. Builds, cache, tags, and registries

    ### Exposition

    Build context determines what the builder can see, and instruction order
    determines cache reuse. Tags give images recognizable release identities;
    registries distribute those tagged artifacts.

    ### Commands covered

    - `docker build -t IMAGE .` builds from a context and assigns a local tag.
    - `docker image inspect IMAGE` verifies the resulting image metadata.
    - `docker tag SOURCE TARGET` creates a registry-qualified release identity.
    - `docker push IMAGE` publishes that exact tagged artifact.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    docker_exercise_04_description = mo.md(
        """
        ### Exercise

        Create `commands` that build the current directory as
        `example/web:1.0`, inspect it, and push it to
        `registry.example.com/team/web:1.0`.
        """
    )
    docker_exercise_04_starter = mo.ui.code_editor(
        value='commands = [\n    "docker build -t example/web:1.0 .",\n    "docker image inspect example/web:1.0",\n    "docker push registry.example.com/team/web:1.0",\n]',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    docker_exercise_04_submit = mo.ui.run_button(label="Submit answer")
    return (
        docker_exercise_04_description,
        docker_exercise_04_starter,
        docker_exercise_04_submit,
    )




@app.cell(hide_code=True)
def _(
    assertion,
    docker_exercise_04_description,
    docker_exercise_04_starter,
    docker_exercise_04_submit,
    execute_submission,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert _ns.get("commands") == [
            "docker build -t example/web:1.0 .",
            "docker image inspect example/web:1.0",
            "docker push registry.example.com/team/web:1.0",
        ], "build, inspect, or push command is incorrect"
        return _ns

    problem(mo, docker_exercise_04_description, docker_exercise_04_starter, _submission, docker_exercise_04_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: docker-runtime-configuration
# title: Networking, ports, volumes, and environment
# kind: exposition
# difficulty: medium
# teaches: docker-runtime-configuration
# assesses: docker-runtime-configuration
# requires: docker-cli-lifecycle
# ===

@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 5. Networking, ports, volumes, and environment

    ### Exposition

    Containers need explicit interfaces for traffic, configuration, and
    durable state. Publish ports with `HOST:CONTAINER`, use service names on
    user-defined networks, and keep secrets out of images.

    ### Commands covered

    - `docker run -p HOST:CONTAINER` publishes a container port through the host.
    - `--mount source=VOLUME,target=PATH` attaches durable named-volume storage.
    - `-e NAME=VALUE` supplies runtime configuration without baking it into the
      image.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    docker_exercise_05_description = mo.md(
        """
        ### Exercise

        Create `run_command` that publishes host port `8080` to container port
        `8080`, mounts volume `appdata` at `/var/lib/app`, and sets `MODE=dev`.
        """
    )
    docker_exercise_05_starter = mo.ui.code_editor(
        value='run_command = "docker run -p 8080:8080 --mount source=appdata,target=/var/lib/app -e MODE=dev example/web:1.0"',
        language="python",
        label="Your Python answer",
        min_height=120,
    )
    docker_exercise_05_submit = mo.ui.run_button(label="Submit answer")
    return (
        docker_exercise_05_description,
        docker_exercise_05_starter,
        docker_exercise_05_submit,
    )




@app.cell(hide_code=True)
def _(
    assertion,
    docker_exercise_05_description,
    docker_exercise_05_starter,
    docker_exercise_05_submit,
    execute_submission,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _command = _ns.get("run_command", "")
        for _part in ("-p 8080:8080", "source=appdata,target=/var/lib/app", "-e MODE=dev"):
            assert _part in _command, f"missing runtime option: {_part}"
        return _ns

    problem(mo, docker_exercise_05_description, docker_exercise_05_starter, _submission, docker_exercise_05_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: docker-compose-fundamentals
# title: Docker Compose fundamentals
# kind: exposition
# difficulty: medium
# teaches: docker-compose-fundamentals
# assesses: docker-compose-fundamentals
# requires: docker-runtime-configuration
# ===

@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 6. Docker Compose fundamentals

    ### Exposition

    Compose describes services, networks, volumes, environment, and health
    checks in one declarative project. `depends_on` expresses relationships;
    a healthcheck expresses readiness.

    ### Commands covered

    - `docker compose config` validates the declarative service model before it
      runs.
    - `docker compose up --build` builds local services and starts the project.
    - `docker compose ps --all` reports service-container state.
    - Compose keys covered here are `services`, `build`, `image`, `depends_on`,
      `healthcheck`, and top-level `volumes`.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    docker_exercise_06_description = mo.md(
        """
        ### Exercise

        Create `compose_yaml` with `web` and `db` services, a `db-data` named
        volume, and a `db` healthcheck.
        """
    )
    docker_exercise_06_starter = mo.ui.code_editor(
        value='compose_yaml = """services:\n  web:\n    build: .\n    depends_on:\n      db:\n        condition: service_healthy\n  db:\n    image: postgres:16\n    healthcheck:\n      test: [\\"CMD-SHELL\\", \\"pg_isready\\"]\nvolumes:\n  db-data:\n"""',
        language="python",
        label="Your Python answer",
        min_height=230,
    )
    docker_exercise_06_submit = mo.ui.run_button(label="Submit answer")
    return (
        docker_exercise_06_description,
        docker_exercise_06_starter,
        docker_exercise_06_submit,
    )




@app.cell(hide_code=True)
def _(
    assertion,
    docker_exercise_06_description,
    docker_exercise_06_starter,
    docker_exercise_06_submit,
    execute_submission,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _yaml = _ns.get("compose_yaml", "")
        for _part in ("services:", "web:", "db:", "service_healthy", "healthcheck:", "volumes:", "db-data:"):
            assert _part in _yaml, f"missing Compose element: {_part}"
        return _ns

    problem(mo, docker_exercise_06_description, docker_exercise_06_starter, _submission, docker_exercise_06_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: docker-compose-development
# title: Compose development workflows
# kind: exposition
# difficulty: medium
# teaches: docker-compose-development
# assesses: docker-compose-development
# requires: docker-compose-fundamentals
# ===

@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 7. Compose development workflows

    ### Exposition

    Compose overrides let development add source mounts, debug settings, and
    optional services without changing the production definition. Validate a
    merged configuration before starting it.

    ### Commands covered

    - `docker compose -f BASE -f OVERRIDE config` previews and validates the
      left-to-right merged configuration.
    - `docker compose -f BASE -f OVERRIDE up --build` starts the development
      variant with current images.
    - `docker compose run --rm SERVICE COMMAND` executes disposable tests or
      administrative tasks in the service environment.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    docker_exercise_07_description = mo.md(
        """
        ### Exercise

        Create `commands` that overlay `compose.dev.yaml`, validate the merged
        configuration, and run the web test suite as a one-off container.
        """
    )
    docker_exercise_07_starter = mo.ui.code_editor(
        value='commands = [\n    "docker compose -f compose.yaml -f compose.dev.yaml up --build",\n    "docker compose config",\n    "docker compose run --rm web python -m pytest",\n]',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    docker_exercise_07_submit = mo.ui.run_button(label="Submit answer")
    return (
        docker_exercise_07_description,
        docker_exercise_07_starter,
        docker_exercise_07_submit,
    )




@app.cell(hide_code=True)
def _(
    assertion,
    docker_exercise_07_description,
    docker_exercise_07_starter,
    docker_exercise_07_submit,
    execute_submission,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _commands = _ns.get("commands", [])
        assert any("compose.dev.yaml" in _command for _command in _commands), "missing development override"
        assert "docker compose config" in _commands, "missing config validation"
        assert any("run --rm web" in _command for _command in _commands), "missing one-off test command"
        return _ns

    problem(mo, docker_exercise_07_description, docker_exercise_07_starter, _submission, docker_exercise_07_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: docker-container-testing
# title: Testing Docker containers
# kind: exposition
# difficulty: medium
# teaches: docker-container-testing
# assesses: docker-container-testing
# requires: docker-compose-development
# ===

@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 8. Testing Docker containers

    ### Exposition

    A green image build is not enough: test the image, startup behavior,
    health endpoint, service integration, logs, exit code, and persistence.
    CI should test the exact artifact that will be published.

    ### Commands covered

    - `docker build -t IMAGE:test .` creates a specifically tagged test artifact.
    - `docker run --rm IMAGE:test COMMAND` runs tests in a disposable container.
    - `docker run -d --name NAME -p HOST:CONTAINER IMAGE:test` starts the same
      artifact for external checks.
    - `curl --fail URL` turns an unhealthy HTTP response into a failing check.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    docker_exercise_08_description = mo.md(
        """
        ### Exercise

        Create `commands` that build `example/web:test`, run its test suite in a
        disposable container, start it on port `18080`, and curl `/health`.
        """
    )
    docker_exercise_08_starter = mo.ui.code_editor(
        value='commands = [\n    "docker build -t example/web:test .",\n    "docker run --rm example/web:test python -m pytest",\n    "docker run -d --name web-test -p 18080:8080 example/web:test",\n    "curl --fail http://localhost:18080/health",\n]',
        language="python",
        label="Your Python answer",
        min_height=180,
    )
    docker_exercise_08_submit = mo.ui.run_button(label="Submit answer")
    return (
        docker_exercise_08_description,
        docker_exercise_08_starter,
        docker_exercise_08_submit,
    )




@app.cell(hide_code=True)
def _(
    assertion,
    docker_exercise_08_description,
    docker_exercise_08_starter,
    docker_exercise_08_submit,
    execute_submission,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _commands = _ns.get("commands", [])
        assert any("docker build" in _command and ":test" in _command for _command in _commands), "missing test image build"
        assert any("--rm" in _command and "pytest" in _command for _command in _commands), "missing disposable test run"
        assert any("/health" in _command and "--fail" in _command for _command in _commands), "missing health check"
        return _ns

    problem(mo, docker_exercise_08_description, docker_exercise_08_starter, _submission, docker_exercise_08_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: docker-security
# title: Security and image quality
# kind: exposition
# difficulty: hard
# teaches: docker-security
# assesses: docker-security
# requires: docker-dockerfiles
# ===

@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 9. Security and image quality

    ### Exposition

    Containers share a host kernel, so image provenance, non-root execution,
    minimal dependencies, secret handling, and resource limits matter. Security
    is part of the build and deployment workflow, not a final manual check.

    ### Commands covered

    - Dockerfile `USER` establishes non-root execution in the image itself.
    - `docker image inspect IMAGE` verifies configured users, entrypoints, and
      other image metadata.
    - `.dockerignore` limits sensitive or unnecessary build-context files.
    - Image scanning belongs after `docker build` and before `docker push` in CI.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    docker_exercise_09_description = mo.md(
        """
        ### Exercise

        Create `checks` containing four security checks: non-root runtime, no
        secrets in the image, a `.dockerignore`, and image scanning in CI.
        """
    )
    docker_exercise_09_starter = mo.ui.code_editor(
        value='checks = [\n    "USER appuser",\n    "secrets stay outside the image",\n    ".dockerignore",\n    "scan image in CI",\n]',
        language="python",
        label="Your Python answer",
        min_height=150,
    )
    docker_exercise_09_submit = mo.ui.run_button(label="Submit answer")
    return (
        docker_exercise_09_description,
        docker_exercise_09_starter,
        docker_exercise_09_submit,
    )




@app.cell(hide_code=True)
def _(
    assertion,
    docker_exercise_09_description,
    docker_exercise_09_starter,
    docker_exercise_09_submit,
    execute_submission,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _checks = {str(_check).lower() for _check in _ns.get("checks", [])}
        assert any("user" in _check and "root" not in _check for _check in _checks), "include non-root execution"
        assert any("secret" in _check for _check in _checks), "include secret handling"
        assert any("dockerignore" in _check for _check in _checks), "include .dockerignore"
        assert any("scan" in _check and "ci" in _check for _check in _checks), "include CI image scanning"
        return _ns

    problem(mo, docker_exercise_09_description, docker_exercise_09_starter, _submission, docker_exercise_09_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: docker-production
# title: Docker in production
# kind: exposition
# difficulty: hard
# teaches: docker-production
# assesses: docker-production
# requires: docker-container-testing,docker-security
# ===

@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 10. Docker in production

    ### Exposition

    Production needs tested immutable artifacts, release-specific
    configuration, restart and health behavior, observability, backups, and
    rollback. A production Compose override can adapt a single-server deploy;
    larger workloads need a platform designed for scheduling and scaling.

    ### Commands covered

    - `docker compose -f BASE -f PRODUCTION pull` obtains immutable release
      images before deployment.
    - `docker compose -f BASE -f PRODUCTION up -d` applies the production model
      in the background.
    - `docker compose ... up --no-deps -d SERVICE` replaces one changed service
      without deliberately restarting its dependencies.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    docker_exercise_10_description = mo.md(
        """
        ### Exercise

        Create `commands` that pull a production image, apply
        `compose.production.yaml`, start the stack detached, then recreate only
        the `web` service after an image change.
        """
    )
    docker_exercise_10_starter = mo.ui.code_editor(
        value='commands = [\n    "docker compose -f compose.yaml -f compose.production.yaml pull",\n    "docker compose -f compose.yaml -f compose.production.yaml up -d",\n    "docker compose -f compose.yaml -f compose.production.yaml up --no-deps -d web",\n]',
        language="python",
        label="Your Python answer",
        min_height=180,
    )
    docker_exercise_10_submit = mo.ui.run_button(label="Submit answer")
    return (
        docker_exercise_10_description,
        docker_exercise_10_starter,
        docker_exercise_10_submit,
    )




@app.cell(hide_code=True)
def _(
    assertion,
    docker_exercise_10_description,
    docker_exercise_10_starter,
    docker_exercise_10_submit,
    execute_submission,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _commands = _ns.get("commands", [])
        assert all("compose.production.yaml" in _command for _command in _commands), "use the production override"
        assert any(" pull" in _command for _command in _commands), "pull the release image"
        assert any("up -d" in _command for _command in _commands), "start the stack detached"
        assert any("--no-deps -d web" in _command for _command in _commands), "recreate only web after its image changes"
        return _ns

    problem(mo, docker_exercise_10_description, docker_exercise_10_starter, _submission, docker_exercise_10_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: docker-troubleshooting
# title: Troubleshooting and operations
# kind: exposition
# difficulty: medium
# teaches: docker-troubleshooting
# assesses: docker-troubleshooting
# requires: docker-compose-fundamentals
# ===

@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 11. Troubleshooting and operations

    ### Exposition

    Diagnose the layer that failed: merged configuration, process, logs,
    mounts, network, healthcheck, or host resources. Evidence from inspection
    is more useful than repeatedly restarting a failing service.

    ### Commands covered

    - `docker compose config` detects invalid or surprising merged configuration.
    - `docker compose ps --all` exposes exited as well as running services.
    - `docker compose logs --tail=200 SERVICE` retrieves focused recent evidence.
    - `docker inspect CONTAINER` exposes mounts, networks, environment, health,
      and process state; `docker stats` adds live resource evidence.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    docker_exercise_11_description = mo.md(
        """
        ### Exercise

        Create `commands` to validate Compose configuration, inspect all stopped
        or running services, show the last 200 log lines for `web`, and inspect
        the `web` container.
        """
    )
    docker_exercise_11_starter = mo.ui.code_editor(
        value='commands = [\n    "docker compose config",\n    "docker compose ps --all",\n    "docker compose logs --tail=200 web",\n    "docker inspect web",\n]',
        language="python",
        label="Your Python answer",
        min_height=180,
    )
    docker_exercise_11_submit = mo.ui.run_button(label="Submit answer")
    return (
        docker_exercise_11_description,
        docker_exercise_11_starter,
        docker_exercise_11_submit,
    )




@app.cell(hide_code=True)
def _(
    assertion,
    docker_exercise_11_description,
    docker_exercise_11_starter,
    docker_exercise_11_submit,
    execute_submission,
    mo,
    problem,
):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _commands = _ns.get("commands", [])
        assert "docker compose config" in _commands, "missing Compose config validation"
        assert any("ps --all" in _command for _command in _commands), "missing all-service status"
        assert any("logs --tail=200 web" in _command for _command in _commands), "missing bounded logs"
        assert "docker inspect web" in _commands, "missing container inspection"
        return _ns

    problem(mo, docker_exercise_11_description, docker_exercise_11_starter, _submission, docker_exercise_11_submit)
    return

# === MLPHD UNIT END ===


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## Next steps

    Revisit any exercise marked **Not yet**, then consult the official
    [Docker overview](https://docs.docker.com/get-started/docker-overview/),
    [Dockerfile guide](https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/),
    [Compose documentation](https://docs.docker.com/compose/),
    [container testing guide](https://docs.docker.com/build/ci/github-actions/test-before-push/),
    and [Compose production guide](https://docs.docker.com/compose/how-tos/production/).
    """)
    return


if __name__ == "__main__":
    app.run()
