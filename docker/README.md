# **Dockerized Next.js and MongoDB Full-Stack Application**

This repository provides Docker configuration files for a Next.js full-stack application with a MongoDB database backend. Using Docker, you can build and run the entire application stack in containers, ensuring a consistent development environment and easy deployment.

# **Repository Structure**

The Docker-related files are located within the `docker` directory at the root of the repository. The `docker` directory has the following structure:

```
docker/
├── docker-compose.yml
├── next/
│   └── Dockerfile
└── mongo/
    └── Dockerfile

```

- `docker-compose.yml`: Docker Compose file used to orchestrate multi-container Docker applications.
- `next/Dockerfile`: Dockerfile used to build the Next.js application.

# **Docker Compose File (docker-compose.yml)**

Docker Compose is a tool for defining and managing multi-container Docker applications. It uses YAML files to configure the application's services and handles the creation and startup of all the containers with a single command.

The `docker-compose.yml` file for this project is configured to run both the Next.js application and a MongoDB database.

Here is a breakdown of what each section does:

```yaml
version: "3"                      # The version of Docker Compose to use
services:                         # Define the services that should be created
  nextjs:                         # The service for the Next.js application
    container_name: nextjs
    build:                        # Specifies the options for building the Docker image
      context: ..                 # The build context is the root of the project
      dockerfile: docker/next/Dockerfile  # The location of the Dockerfile
    env_file:                     # Environment variables from the .env file
      - ../.env
    ports:                        # Expose ports
      - 3000:3000                # Maps port 3000 in the container to port 3000 on the host
    depends_on:                   # Specify service dependencies
      - db
  db:                             # The service for the MongoDB database
    container_name: mongodb
    image: mongo                  # Use the official MongoDB image
    restart: always
    env_file:                     # Environment variables from the .env file
      - ../.env
    environment:                  # Set environment variables in the container
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
    ports:                        # Expose ports
      - 27017:27017              # Maps port 27017 in the container to port 27017 on the host
    volumes:                      # Define named volumes
      - mongodbdata:/data/db      # Use a volume to persist MongoDB data
volumes:                          # Define named volumes
  mongodbdata:                     # The named volume for MongoDB data
```

To run the MongoDB database in a Docker container, use the following command:

```bash
docker-compose --env-file .env -f docker/docker-compose.yml up db
```

This command uses the `docker-compose.yml` file and the `.env` file to start the MongoDB database container.

# **Dockerfile for Next.js Application (next/Dockerfile)**

The `next/Dockerfile` contains instructions that Docker uses to build the Next.js application's Docker image. It's a multi-stage build process, optimized for the Next.js app.

The detailed explanation of this Dockerfile is provided in the `next` section.

# **Development Database**

The MongoDB database is run using the `mongo` image and is configured with environment variables from the `.env` file. This allows you to easily spin up a development database with Docker. The `.env.example` file in the repository is already configured with the required variables to set up the database container. Simply copy this file to `.env` and adjust the values as needed.
