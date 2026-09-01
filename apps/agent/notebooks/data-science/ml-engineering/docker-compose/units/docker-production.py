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


@app.cell(hide_code=True)
def _(mo):
    _mlphd_unit_body = True
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


if __name__ == "__main__":
    app.run()
