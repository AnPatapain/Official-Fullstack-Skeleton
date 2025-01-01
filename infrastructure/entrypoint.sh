#!/bin/bash
############################################################################
# entrypoint.sh
# Entry point for running development, production, test environment
# Run entrypoint.sh --help to see all supported operations
# Author: Ke An Nguyen
############################################################################


##################
# Folder location
##################
# Dir containing this script
SCRIPT_DIR="$(dirname $0)"
cd "${SCRIPT_DIR}/.."

# Root project dir
ROOT_PROJECT="$(pwd)"
export ROOT_PROJECT

# Location of TLS certificates
TLS_DIR="${ROOT_PROJECT}/infrastructure/tls-dev"
export TLS_DIR
CERT_FILE="certificate.crt"
KEY_FILE="private.key"

# Location of nginx files
NGINX_DEV="${ROOT_PROJECT}/infrastructure/nginx/nginx-dev.conf"
export NGINX_DEV

# Location of docker files
DOCKER_COMPOSE_DEV="${ROOT_PROJECT}/infrastructure/docker/docker-compose.local.yml"
DOCKER_COMPOSE_PROD="${ROOT_PROJECT}/infrastructure/docker/docker-compose.prod.yml"

########################
# Docker user privilege
########################
# To ensure the permission inside docker container matches outside. To be used in docker-compose.local.yml
export DOCKER_UID="$UID"
export DOCKER_GID="$GID"

cd "${ROOT_PROJECT}"

# Prevent running the script as root or with sudo
if [ "$EUID" -eq 0 ]; then
  echo "Error: Do not run this script as root or with sudo."
  echo "Please run the script as a normal user with the necessary permissions."
  exit 1
fi

display_help() {
  echo "Usage: ./run.sh [COMMAND]"
  echo ""
  echo "Entry point to run application in the dev, prod or test environment"
  echo "Provide also options to: list prerequisites, check prerequisites, clean the project."
  echo ""
  echo "Commands:"
  echo "  help                 Display this help message and exit"
  echo "  list-prerequisite    Display prerequisite"
  echo "  prerequisite         Check whether required prerequisite is met and show the guide how to fix"
  echo "  create-tls-certs     Create TLS certificates (for local dev environment)"
  echo "  dev                  Run the application in the local development environment"
  echo "  prod                 Build and run the application in production mode with Nginx serving the frontend"
  echo "  clean                Remove build artifacts, node_modules, docker-volume and clean the environment"
  echo ""
  echo "Options:"
  echo "  -h, --help           Display this help message"
  echo ""
  echo "Examples:"
  echo "  ./run.sh dev         Start the app in development mode with hot-reloading enabled"
  echo "  ./run.sh prod        Build and deploy the app in production mode"
  echo "  ./run.sh clean       Remove all build artifacts and node_modules to clean the environment"
  echo ""
  echo "Important Notes"
  echo "- Don't run run.sh with 'sudo'"
  echo "- run 'run.sh clean' before switching between development and production modes for a clean setup."
}

# Function that lists all prerequisite
list_prerequisite() {
  echo "-- Prerequisite --"
  echo ""
  echo "1. Docker must be installed and can be run as non-root user"
  echo "2. pnpm must be installed"
  echo "3. .env file must be located in your root project and has following structure:"
  echo "   POSTGRES_USER=<username>"
  echo "   POSTGRES_PASSWORD=<password>"
  echo "   POSTGRES_DB=<database>"
  echo "   DATABASE_URL=\"postgresql://<username>:<password>@postgres-db:5432/<database>?schema=public\""
  echo ""
  echo "   Note: postgres-db is the service name of postgres defined in docker-compose.local and docker-compose.prod"
}

# Function that checks the must-have prerequisite for running boilerplate
check_prerequisite() {
  # Check docker is installed and can be run as non-root user
  command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is required. Please install"; exit 1; }
  docker compose version >/dev/null 2>&1 || { echo >&2 "Docker Compose Plugin is required. Please install: https://docs.docker.com/compose/install/"; exit 1; }
  if ! groups "$USER" | grep &>/dev/null '\bdocker\b'; then
    echo "Result: Prerequisites are not met!"
    echo ""
    echo "Reason: user $USER is not in the docker group. Docker must be able to run as a non-root user."
    echo "To fix: please run 'sudo usermod -aG docker $USER' and then log out and back in. Tutorial: https://docs.docker.com/engine/install/linux-postinstall/"
    exit 1
  fi

  # Check pnpm is installed
  if ! command -v pnpm &>/dev/null; then
      echo "Result: Prerequisites are not met!"
      echo ""
      echo "Reason: pnpm is not installed."
      echo "To fix: please install pnpm by following the instructions at https://pnpm.io/installation."
      exit 1
  fi

  # Check .env exist and has required environment variable
  if [[ ! -f "${ROOT_PROJECT}/.env" ]]; then
    echo "Result: Prerequisites are not met!"
    echo ""
    echo "Reason: .env file is required in the root of the project."
    echo "To Fix: Follow the steps below to create a .env file and set the required environment variables:"
    echo ""
    echo "1. Navigate to the root of your project:"
    echo "   cd ${ROOT_PROJECT}"
    echo ""
    echo "2. Create a new .env file:"
    echo "   touch .env"
    echo ""
    echo "3. Open the .env file in your preferred text editor and add the following lines:"
    echo "   POSTGRES_USER=<username>"
    echo "   POSTGRES_PASSWORD=<password>"
    echo "   POSTGRES_DB=<database>"
    echo "   DATABASE_URL=\"postgresql://<username>:<password>@postgres-db:5432/<database>?schema=public\""
    echo "   HMAC_SECRET=<your secret string>"
    echo ""
    echo "   Note: postgres-db is the service name of postgres defined in docker-compose.local and docker-compose.prod"
    echo ""
    echo "4. Save the file and ensure it’s in the root of your project."
    echo ""
    echo "Once the .env file is created, re-run the script to continue."
    exit 1
  else
    # Load the .env file temporarily
      source "${ROOT_PROJECT}/.env"
      # Check if the required environment variables are defined
      if [[ -z "$POSTGRES_USER" || -z "$POSTGRES_PASSWORD" || -z "$POSTGRES_DB" || -z "$DATABASE_URL" ]]; then
          echo "Result: Prerequisites are not met!"
          echo ""
          echo "Reason: The .env file is missing one or more required environment variables."
          echo "To fix: Make sure the following variables are set in the .env file:"
          echo "   POSTGRES_USER=<username>"
          echo "   POSTGRES_PASSWORD=<password>"
          echo "   POSTGRES_DB=<database>"
          echo "   DATABASE_URL=\"postgresql://<username>:<password>@postgres-db:5432/<database>?schema=public\""
          exit 1
      fi
  fi
  echo "Prerequisite test passed!"
}

create_tls_certificates() {
  if [[ ! -d "$TLS_DIR" ]]; then
      mkdir -p "$TLS_DIR"
  fi
#  cd "$TLS_DIR"
  openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout "$TLS_DIR/$KEY_FILE" -out "$TLS_DIR/$CERT_FILE"
  echo ""
  echo "TLS key and cert created successfully !"
}

# Function to clean node_modules and dist
clean_app() {
  if [[ "$1" = "--force-proceed" ]]; then
    local proceed="y"
  else
    read -r -p "Data on dev database will be lost. Proceed? (y/n): " proceed
  fi

  if [[ "$proceed" =~ ^[yY]$ ]]; then
    docker compose -f "${DOCKER_COMPOSE_DEV}" down -t 1 --volumes --remove-orphans
    docker compose -f "${DOCKER_COMPOSE_PROD}" down -t 1 --volumes --remove-orphans
    sudo rm -rf node_modules packages/*/node_modules packages/*/dist
    sudo rm -rf packages/backend/tsoa
    sudo rm pnpm-lock.yaml
    sudo rm -rf .pnpm-store
    sudo docker volume remove postgres_data
    echo "node_modules, dist, nginx config files, postgres_data volume removed successfully !"
  fi
}

# Internal Function to synchronize the env file in ROOT_PROJECT and packages/backend by using symbolic link
sync_env_files() {
  ln -sf "${ROOT_PROJECT}"/.env "${ROOT_PROJECT}"/packages/backend/.env
  ln -sf "${ROOT_PROJECT}"/.env "${ROOT_PROJECT}"/packages/frontend/.env
}

# Function to build frontend static files
run_build_fe() {
  pnpm install && pnpm run build
}

# Function to run the application in production mode
run_prod() {
  sync_env_files
  export DOCKER_PROD_ENTRY_CMD="pnpm install && pnpm run prod"
  mkdir -p node_modules
  docker compose -f "${DOCKER_COMPOSE_PROD}" build --no-cache
  docker compose -f "${DOCKER_COMPOSE_PROD}" up --remove-orphans -d
  echo "Application in containers are now running in detached mode."
#  docker compose -f "${DOCKER_COMPOSE_PROD}" logs -f app-backend-prod
#  docker compose -f "${DOCKER_COMPOSE_PROD}" down -t 1
}

# Function to start Docker Compose in development mode
run_dev() {
  sync_env_files
  # DOCKER_DEV_ENTRY_CMD will be used in DOCKER_COMPOSE_DEV file as an entry point to run the application in dev env
  export DOCKER_DEV_ENTRY_CMD="pnpm i && pnpm run dev"
  mkdir -p node_modules
  docker compose -f "${DOCKER_COMPOSE_DEV}" build --no-cache
  docker compose -f "${DOCKER_COMPOSE_DEV}" up --remove-orphans -d
  docker compose -f "${DOCKER_COMPOSE_DEV}" logs -f app-dev -f postgres-db -f nginx-reverse-proxy-dev # Service name not container name
  docker compose -f "${DOCKER_COMPOSE_DEV}" down -t 1
}

if [[ "$1" = "help" || "$1" = "--help" || "$1" = "-h" ]]; then
  display_help
  exit 0

elif [[ "$1" = "list-prerequisite" ]]; then
  list_prerequisite
  exit 0

elif [[ "$1" = "prerequisite" ]]; then
  check_prerequisite
  exit 0

elif [[ "$1" = "create-tls-certs" ]]; then
  create_tls_certificates
  exit 0

elif [[ "$1" = "clean" ]]; then
  clean_app --normal
  exit 0

elif [[ "$1" = "dev" ]]; then
  check_prerequisite
  # Check if check_prerequisite exited successfully (exit code 0)
  if [[ $? -eq 0 ]]; then
    run_dev
  else
    echo "Prerequisites not met. Exiting."
    exit 1
  fi
  exit 0

elif [[ "$1" = "build-fe" ]]; then
  clean_app --force-proceed
  run_build_fe
  exit 0

elif [[ "$1" = "prod" ]]; then
  clean_app --force-proceed
  run_prod
  exit 0
    
else
    echo 'Use --help to see available options'
fi