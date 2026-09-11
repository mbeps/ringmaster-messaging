# Ringmaster Messaging

Ringmaster Messaging is a responsive web application for real-time digital communication. Connect with other users through direct one-on-one messaging and group conversations. Share images directly within chat threads. Authenticate using credentials or third-party OAuth providers.

# Features

## Authentication & Account Management

- Register using an email address and password
- Authenticate with third-party providers including Google and GitHub
- Sign in and sign out of user accounts
- Update account passwords
- Modify profile information including display name and avatar

## Real-Time Messaging & Group Chats

- Send and receive direct messages in real time
- Create and participate in multi-user group conversations
- View live message delivery and seen status updates

## Media Sharing

- Upload and send images directly inside conversations
- View shared images in a dedicated modal overlay

# Requirements

- Node.js 22.12.0 or higher
- MongoDB 7.0 or higher (or Docker)
- Pusher account and credentials
- Cloudinary account and credentials
- Google OAuth credentials (Optional)
- GitHub OAuth credentials (Optional)

# Stack

## Frontend

- [Next.js](https://nextjs.org/docs): React framework with the App Router.
- [React](https://react.dev/): Component-based user interface library.
- [TypeScript](https://www.typescriptlang.org/): Typed JavaScript language.
- [Tailwind CSS](https://tailwindcss.com/docs): Utility-first CSS framework.
- [Headless UI](https://headlessui.com/): Unstyled accessible UI components.

## Backend

- [Better Auth](https://better-auth.com/docs): Authentication framework for session and credential management.
- [Prisma](https://www.prisma.io/docs): Type-safe ORM for database queries and schema management.
- [LogTape](https://logtape.org/): Structured, non-blocking telemetry and logging library.
- [Pusher](https://pusher.com/docs): Hosted WebSocket service for real-time messaging events.
- [Cloudinary](https://cloudinary.com/documentation): Cloud-based media storage and delivery service.

## Database

- [MongoDB](https://www.mongodb.com/docs/): Document database for application data storage.

# Setting Up Project

## 1. Clone the Project Locally

Clone the repository and navigate into the project directory.

```sh
git clone https://github.com/mbeps/ringmaster-messaging.git
cd ringmaster-messaging
```

## 2. Install Dependencies

Install project dependencies using Yarn.

```sh
yarn install
```

## 3. Set Up Environment Variables

Create a `.env` file in the project root with the following configuration.

```sh
# Database
DATABASE_URL="mongodb://admin:password123@localhost:27017/ringmaster?authSource=admin&replicaSet=rs0"

# Logging
LOG_LEVEL="info"

# Better Auth
BETTER_AUTH_SECRET="your-better-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_TRUSTED_ORIGINS="http://localhost:3000"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth Providers (Optional)
CLIENT_ID_GITHUB=""
CLIENT_SECRET_GITHUB=""
CLIENT_ID_GOOGLE=""
CLIENT_SECRET_GOOGLE=""

# Pusher
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-app-key"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
NEXT_PUBLIC_CLOUDINARY_PRESET="your-unsigned-upload-preset"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-unsigned-upload-preset"

# Docker MongoDB Credentials (Optional)
MONGO_INITDB_ROOT_USERNAME="admin"
MONGO_INITDB_ROOT_PASSWORD="password123"
```

- `DATABASE_URL`: Connection string for the MongoDB instance. Pre-configured for the local Docker replica set.
- `LOG_LEVEL`: Log verbosity level for LogTape (`debug`, `info`, `warn`, `warning`, `error`, `fatal`). Defaults to `info`. Set to `debug` to view query traces and middleware routing.
- `BETTER_AUTH_SECRET`: Secret key used for session encryption. Generate with `openssl rand -base64 32`.
- `BETTER_AUTH_URL`: Base URL of the application. Required in production.
- `BETTER_AUTH_TRUSTED_ORIGINS`: Comma-separated list of allowed origins for authentication requests.
- `AUTH_TRUST_HOST`: Flag to trust the host header during authentication requests.
- `NEXT_PUBLIC_APP_URL`: Client-side base URL for authentication endpoints.
- `CLIENT_ID_GITHUB`: GitHub OAuth application client identifier.
- `CLIENT_SECRET_GITHUB`: GitHub OAuth application client secret.
- `CLIENT_ID_GOOGLE`: Google Cloud OAuth client identifier.
- `CLIENT_SECRET_GOOGLE`: Google Cloud OAuth client secret.
- `PUSHER_APP_ID`: Application ID from your Pusher Channels dashboard.
- `PUSHER_SECRET`: Secret key from your Pusher Channels dashboard.
- `NEXT_PUBLIC_PUSHER_APP_KEY`: Public client key from your Pusher Channels dashboard.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloud name from your Cloudinary account dashboard.
- `NEXT_PUBLIC_CLOUDINARY_PRESET`: Unsigned upload preset for client-side uploads.
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Fallback preset name matching `NEXT_PUBLIC_CLOUDINARY_PRESET`.
- `MONGO_INITDB_ROOT_USERNAME`: Username for initializing the MongoDB Docker container.
- `MONGO_INITDB_ROOT_PASSWORD`: Password for initializing the MongoDB Docker container.

## 4. Start the Database

Start the MongoDB replica set using Docker Compose.

```sh
docker compose up -d
```

## 5. Configure the Database

Push the Prisma schema to the MongoDB database and generate the Prisma client.

```sh
yarn prisma db push
```

# Run Application

Start the development server.

```sh
yarn dev
```

Alternatively, you can build the whole app and run it using the following commands:

```sh
yarn build
yarn start
```

The application should now be running at http://localhost:3000.

# References

- [Next.js documentation](https://nextjs.org/docs) - React framework with App Router
- [React documentation](https://react.dev/) - UI component library
- [TypeScript documentation](https://www.typescriptlang.org/docs/) - typed JavaScript language
- [Tailwind CSS documentation](https://tailwindcss.com/docs) - utility-first CSS framework
- [Headless UI documentation](https://headlessui.com/) - unstyled UI components
- [Better Auth documentation](https://better-auth.com/docs) - authentication framework
- [Prisma documentation](https://www.prisma.io/docs) - ORM and database client
- [LogTape documentation](https://logtape.org/) - structured logging library
- [Pusher documentation](https://pusher.com/docs) - real-time messaging service
- [Cloudinary documentation](https://next.cloudinary.dev/) - image management and hosting
- [MongoDB documentation](https://www.mongodb.com/docs/) - document database