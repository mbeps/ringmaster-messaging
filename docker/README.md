# **Repository Structure**

The Docker related files are located within the `docker` directory at the root of the repository. The `docker` directory has the following structure:

```
docker/
├── docker-compose.yml
└── next/
    └── Dockerfile
```

- `docker-compose.yml`: Docker Compose file for orchestrating multi-container Docker applications.
- `next/Dockerfile`: Dockerfile for the Next.js application.

# **Docker Compose File (docker-compose.yml)**

Docker Compose is a tool that allows us to define and manage multi-container Docker applications. It uses YAML files to configure the application's services and performs the creation and start-up process of all the containers with a single command.

In this project, the `docker-compose.yml` file is configured to run the Next.js application along with a MongoDB database and a Mongo-Express for database management.

Here is a breakdown of what each part does:

```yaml
version: '3'                     # The version of Docker Compose to use
services:                        # Define the services that should be created
  mongo:                         # The name of the MongoDB service
    image: mongo                 # The image to use for creating the MongoDB container
    environment:                 # Environment variables for MongoDB
      MONGO_INITDB_ROOT_USERNAME: docker
      MONGO_INITDB_ROOT_PASSWORD: pass
    volumes:                     # Persistent volume data directory of db data
      - ./mongo-data:/data/db
    ports:                       # Expose ports
      - 27017:27017             # Maps the internal Docker host port 27017 to the external Docker client port 27017

  mongo-express:                 # The name of the Mongo-Express service
    image: mongo-express         # The image to use for creating the Mongo-Express container
    environment:                 # Environment variables for Mongo-Express
      ME_CONFIG_MONGODB_ADMINUSERNAME: docker
      ME_CONFIG_MONGODB_ADMINPASSWORD: pass
      ME_CONFIG_MONGODB_SERVER: mongo
    ports:                       # Expose ports
      - 8081:8081               # Maps the internal Docker host port 8081 to the external Docker client port 8081
    depends_on:                  # Specifies that this service depends on mongo
      - mongo

  nextjs:                        # The name of the first service
    build:                       # Specifies the options that Docker should use when building the Docker image
      context: ..                # The build context specifies the location of your source files
      dockerfile: docker/next/Dockerfile  # The name and location of the Dockerfile 
    ports:                       # Expose ports
      - 3000:3000               # Maps the internal Docker host port 3000 to the external Docker client port 3000
    depends_on:                  # Specifies that this service depends on mongo
      - mongo
```

By using this `docker-compose.yml`, you can bring up your entire app by using the command `docker-compose up` and bring it down using `docker-compose down` from the directory that contains the `docker-compose.yml` file. This will take care of all the intricacies of setting up the Next.js service, MongoDB, and Mongo-Express.

# **Services**
## **Dockerfile for Next.js Application (next/Dockerfile)**

The Dockerfile contains instructions Docker uses to build a Docker image. In this project, we have a Dockerfile specifically for our Next.js application located under `docker/next/Dockerfile`. This Dockerfile instructs Docker to

 create a multi-stage build for the Next.js app.

The Dockerfile for Next is explained in the `next` section.

# **MongoDB**

MongoDB is a source-available cross-platform document-oriented database program. It is classified as a NoSQL database program, MongoDB uses JSON-like documents with optional schemas. In our `docker-compose.yml`, we have configured it to run as a service.

# **Mongo-Express**

Mongo-Express is a web-based MongoDB admin interface written with Node.js, Express and Bootstrap3. It has support for range of operations on your MongoDB. In our `docker-compose.yml`, it's been set up to communicate with our MongoDB instance.
