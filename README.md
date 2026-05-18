# **Ringmaster Messaging**

<img width="1000" alt="cover" src="https://github.com/mbeps/ringmaster-messaging/assets/58662575/ef0f6397-2865-49fe-8e9a-5523a200dd71">

---

Ringmaster Messaging is a responsive application designed for real-time digital communication. It enables users to connect securely through direct one-on-one messaging and multi-user group chats. The platform features an intuitive interface that supports direct image and document sharing within chat conversations. Users can register easily using a traditional email address or via third-party providers like Google and GitHub. The system ensures an optimal, consistent experience across desktops, tablets, and mobile devices.

# Features
## Authentication & Account Management

The system has several key user authentication and account management features designed to ensure that users have a seamless and secure experience:

- **Email Sign-up:** Ringmaster allows users to sign up using their personal email and create a unique password. This provides a traditional method of registration and access to the platform.

- **Third-party Authentication:** Users have the option to sign up using third-party authentication providers such as Google and GitHub. This allows for quick registration and eliminates the need to remember another password.

- **Login/Logout:** Users can log in and log out of their accounts easily, ensuring their account's security when they are not actively using the platform.

- **Password Change:** The user can change the password for their account, after they have logged in.

- **Profile Modification:** Ringmaster allows users to modify their profile settings, including their profile image and username. This gives users the flexibility to personalize their profiles according to their preferences and changing needs.

## Real-Time Messaging & Group Chats

Ringmaster offers a real-time, responsive messaging platform that enables users to send and receive messages instantly:

- **Direct Messaging:** Users can send direct, one-on-one messages to other users on the platform, enabling private conversations in real-time.

- **Group Chats:** Users can also create group chats, allowing for real-time communication with multiple users simultaneously. This is a perfect feature for coordinating with a team, planning events, or just having a fun conversation with friends.

## **Image Sharing**
- **In-Chat Image Sharing:** Users can send images within the chat itself. Whether it's a memorable photo, an important document, or a quick snapshot of something interesting, Ringmaster makes it easy to share with your contacts.

# Requirements
These are the requirements needed to run the project:
- Node 24 LTS
- MongoDB
- Cloudinary 
- Pusher

# Tech Stack

## Frontend

The frontend of the application uses the following technologies:

- [**TypeScript**](https://www.typescriptlang.org/): a statically typed superset of JavaScript, is used to build reliable and maintainable code, providing early error catching and advanced editor support.  
- [**Next.JS**](https://nextjs.org/): the foundation of the frontend is built using Next.js, a popular React framework that offers tools and conventions for building server-side rendered (SSR) and statically generated web applications, enhancing performance and ease of deployment.  
- [**React.JS**](https://react.dev/): a powerful JavaScript library used for building user interfaces. It allows us to create reusable components and manage the application's state efficiently, ensuring a fast and interactive user experience.  
- [**Tailwind CSS**](https://tailwindcss.com/): a highly customisable, low-level CSS framework, provides utility classes that help us build out custom designs efficiently and responsively.  
- [**Headless UI**](https://headlessui.dev/): for creating UI components, we rely on Headless UI. This framework allows us to create fully accessible UI components with ease, while giving us complete control over how components look and function.  

## Backend

The backend of the application is built with the following technologies:

- [**Better Auth**](https://better-auth.com/): an authentication framework for modern web applications, provides secure and flexible user authentication. It supports multiple providers and simplifies session management, making user sign-in seamless and reliable.  
- [**MongoDB**](https://www.mongodb.com/): a document database, which means it stores data in JSON-like documents. It is used for a variety of applications, including web applications, mobile applications, and big data analytics.  
- [**Pusher**](https://pusher.com/): Pusher is used for handling real-time bi-directional communication between users. It allows for quick and reliable message transmission, enabling the real-time experience of Ringmaster.  
- [**Prisma**](https://www.prisma.io/): an open-source, next-generation ORM that makes it fun and safe to work with a database like MySQL, Postgres, SQL Server, or MongoDB. It generates a type-safe client that abstracts away the complexity of the database, making it easy to write efficient and bug-free queries.  
- [**Axios**](https://axios-http.com/): a popular promise-based HTTP client, is used for making HTTP requests from our server. It provides a simple and flexible API for our backend services.  
- [**Cloudinary**](https://cloudinary.com/): for storing and serving images, we use Cloudinary. It provides a reliable and efficient cloud-based solution for managing user-uploaded images.  


# Running Application Locally

To run the Ringmaster application on your local machine, you'll need to follow the steps below. For more detailed instructions, please refer to the project's Wiki.

## 1. Clone the Project Locally

You'll first need to clone the project repository to your local machine. Open your terminal, navigate to the directory where you want to store the project, and run the following command:

```sh
git clone https://github.com/mbeps/ringmaster-messaging.git
```

## 2. Install Dependencies

Navigate to the root directory of the project by running the following command:

```sh
cd ringmaster
```

Then, install the project dependencies by running:

```sh
yarn install
```

## 3. Set Up Environment Variables

You'll need to set up your environment variables to run the application. In the root of your project, create a `.env.local` file. The environment variables you'll need to include are:

```sh
DATABASE_URL=""
NODE_ENV=development next start 

# Better Auth
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL=""
BETTER_AUTH_TRUSTED_ORIGINS=""
NEXT_PUBLIC_APP_URL=""
AUTH_TRUST_HOST=
## GitHub
CLIENT_ID_GITHUB=''
CLIENT_SECRET_GITHUB=''
## Google
CLIENT_ID_GOOGLE=''
CLIENT_SECRET_GOOGLE=''

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=''
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# Pusher
NEXT_PUBLIC_PUSHER_APP_KEY=""
PUSHER_APP_ID=""
PUSHER_SECRET=""

# MongoDB Docker Credentials
MONGO_INITDB_ROOT_USERNAME=""
MONGO_INITDB_ROOT_PASSWORD=""
```

You'll need to fill in the value for each of these variables. Here's how to get each one:

- `DATABASE_URL`: This is your MongoDB connection string. This is already pre-filled if you wish to use Docker. Alternatively, you can modify it to use any other provider such as Atlas. 
- `NODE_ENV`: Useful for development to build the project fully and starting it instead of using `dev` command which is slower. Set it to `development next start` for this functionality. Not needed in production. 
- `AUTH_TRUST_HOST`: The hostname/domain of the app. This is optional as it can be automatically detected but good to have. 
- `BETTER_AUTH_SECRET`: This can be any random string. It's used for encryption and session hashing.
- `BETTER_AUTH_URL`: The URL of the application. For local development, this is typically `http://localhost:3000`.
- `BETTER_AUTH_TRUSTED_ORIGINS`: Comma-separated list of trusted client origins allowed to make requests (e.g., `http://localhost:3000,https://messaging.maruf-bepary.com`).
- `NEXT_PUBLIC_APP_URL`: Custom domain for the client-side authentication client (defaults to relative host if left empty).
- `CLIENT_ID_GITHUB` and `CLIENT_SECRET_GITHUB`: You can obtain these by creating a new OAuth app in your GitHub account.
- `CLIENT_ID_GOOGLE` and `CLIENT_SECRET_GOOGLE`: You can obtain these by setting up a new project in Google Cloud Platform and enabling the Google+ API.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: You can get these from your Cloudinary account settings. Make sure the `node` setting is unsigned. 
- `NEXT_PUBLIC_PUSHER_APP_KEY`, `PUSHER_APP_ID` and `PUSHER_SECRET`: You can get these from your Pusher account.
- `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`: Username and password credentials to initialize the MongoDB Docker container.

## 4. Running Database (Docker)
This step is necessary if you with to use the Docker image that has been provided. 
You can also use an alternative service for MongoDB such as Atlas. Make sure to change the connection string on the `.env` file if you wish to do so. 

Run the following command from the root of the project to start your MongoDB container:
```sh
docker compose up -d
```

## 5. Setting Up Prisma

Prisma is a database tool used for data access, which is used in this project. Here's how you set it up:

- First, generate the Prisma client by running:

```sh
yarn prisma generate
```

- Then, push the database schema to the database. 

```sh
yarn prisma db push
```

This will update your database schema and generate the Prisma Client code. If the database does not exist yet, it will be created for you. 

Remember to run these commands whenever you make changes to your Prisma schema.

## 6. Run the Application

Once you've set up your environment variables and Prisma, you can run the application using the following command:

```sh
yarn dev
```

Alternatively you can build the project fully and run it with the followig commands:

```sh
yarn build
yarn start
```

The application should now be running at `http://localhost:3000`.

# References
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React.JS Documentation](https://react.dev/reference/react)
- [Next.JS Documentation](https://nextjs.org/docs)
- [Headless UI Documentation](https://headlessui.com/)
- [Better Auth Documentation](https://better-auth.com/docs)
- [Tailwind CSS Documentation](https://v2.tailwindcss.com/docs)
- [Pusher Documentation](https://pusher.com/tutorials/realtime-tables-nextjs/#app-structure)
- [Cloudinary Documentation](https://next.cloudinary.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/guides/nextjs)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Axios Documentation](https://axios-http.com/docs/intro)