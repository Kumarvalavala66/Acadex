# Acadex

Acadex is a student organizer with a React frontend and a FastAPI backend. The
Docker Compose setup runs both services locally.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) on macOS or
  Windows, or Docker Engine with the Compose plugin on Linux
- Git, if you are cloning the repository

Check that Docker is running and Compose is available:

```sh
docker --version
docker compose version
```

## Run with Docker Compose

Clone the repository and change into its root directory (the directory
containing `docker-compose.yml`):

```sh
git clone https://github.com/Kumarvalavala66/Acadex.git
cd Acadex
```

Build the images and start the frontend and backend:

```sh
docker compose up --build
```

The first run builds the images and may take a few minutes. Keep this terminal
open to see service logs. To run the services in the background instead:

```sh
docker compose up --build -d
```

Open the app and API at:

- Frontend: <http://localhost:5173>
- Backend health endpoint: <http://localhost:8000/>
- Interactive backend API documentation: <http://localhost:8000/docs>

The frontend is configured to connect to the backend at
`http://127.0.0.1:8000`, so this setup is intended for use from the same
computer running Docker. For access from another computer, configure the
frontend API URL to use the Docker host's reachable address.

## Useful commands

Run these commands from the repository root:

```sh
# Follow logs from both services
docker compose logs -f

# Follow logs from one service
docker compose logs -f backend
docker compose logs -f frontend

# Stop the services
docker compose stop

# Stop and remove the containers and Compose network
docker compose down

# Rebuild images after changing dependencies or Dockerfiles
docker compose up --build
```

The backend database is SQLite at `backend/student_organizer.db`. Since the
backend directory is bind-mounted into the container, the database file is
stored on the host and remains when you stop or remove the containers. It is
excluded from Git.

## Troubleshooting

- If a port is already in use, stop the process using port `5173` or `8000`,
  then run `docker compose up --build` again.
- If a build or dependency change is not picked up, rebuild with
  `docker compose up --build`.
- Check service output with `docker compose logs -f`.
- Confirm Docker is running before starting the services.
