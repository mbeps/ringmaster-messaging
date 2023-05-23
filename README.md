Welcome to the Ringmaster Messaging App, a vibrant and engaging hub for real-time communication. This application is designed to simplify and streamline your digital interaction, allowing you to engage with friends, family, and colleagues seamlessly and securely. 

Ringmaster provides direct, person-to-person messaging, offering a real-time chat experience that feels as close to face-to-face conversation as you can get online. The app's interface is intuitive, making it easy for you to keep track of your conversations and never miss an important message.

In addition to one-on-one messaging, Ringmaster includes a feature for creating group chats. Now, organizing an event, working as a team, or just hanging out with friends digitally has never been easier. Real-time, multi-user chat capabilities ensure that everyone in the group is on the same page, fostering collaborative and social experiences.

With Ringmaster, you can also share images directly in your chat conversations. Whether you want to share a fun moment, an important document, or a cute pet picture, Ringmaster ensures that your images are shared quickly and securely.

The sign-up process on Ringmaster is straightforward and versatile. Users can create an account using their email and password, or sign up through a third-party provider such as Google or GitHub. This flexibility ensures an easy start, regardless of your preferred platform.

Lastly, Ringmaster is fully responsive, designed to provide an optimal viewing and interaction experience across a wide range of devices. Whether you're accessing Ringmaster on your desktop, tablet, or mobile device, you can enjoy the same high-quality, real-time messaging experience.


# **Requirements**
These are the requirements needed to run the project:
- Node 18 LTS
- Next.JS 13
- MongoDB 6


# **Features**
## **Authentication and Account Management**

The system has several key user authentication and account management features designed to ensure that users have a seamless and secure experience:

- **Email Sign-up:** Ringmaster allows users to sign up using their personal email and create a unique password. This provides a traditional method of registration and access to the platform.

- **Third-party Authentication:** Users have the option to sign up using third-party authentication providers such as Google and GitHub. This allows for quick registration and eliminates the need to remember another password.

- **Login/Logout:** Users can log in and log out of their accounts easily, ensuring their account's security when they are not actively using the platform.

- **Password Reset:** If a user forgets their password, they can easily reset it. Ringmaster will send a password reset link to the user's registered email address, ensuring that only the user has access to change their password.

- **Profile Modification:** Ringmaster allows users to modify their profile settings, including their profile image and username. This gives users the flexibility to personalize their profiles according to their preferences and changing needs.

## **Real-Time Messaging and Group Chats**

Ringmaster offers a real-time, responsive messaging platform that enables users to send and receive messages instantly:

- **Direct Messaging:** Users can send direct, one-on-one messages to other users on the platform, enabling private conversations in real-time.

- **Group Chats:** Users can also create group chats, allowing for real-time communication with multiple users simultaneously. This is a perfect feature for coordinating with a team, planning events, or just having a fun conversation with friends.

## **Image Sharing**
- **In-Chat Image Sharing:** Users can send images within the chat itself. Whether it's a memorable photo, an important document, or a quick snapshot of something interesting, Ringmaster makes it easy to share with your contacts.

# **Tech Stack**

## **Frontend**

The frontend of the application uses the following technologies:

- [**TypeScript**](https://www.typescriptlang.org/): a statically typed superset of JavaScript, is used to build reliable and maintainable code, providing early error catching and advanced editor support.

- [**Next.js**](https://nextjs.org/): the foundation of the frontend is built using Next.js, a popular React framework that offers tools and conventions for building server-side rendered (SSR) and statically generated web applications, enhancing performance and ease of deployment.

- [**Tailwind CSS**](https://tailwindcss.com/):  a highly customizable, low-level CSS framework, provides utility classes that help us build out custom designs efficiently and responsively.

- [**Headless UI**](https://headlessui.dev/): for creating UI components, we rely on Headless UI. This framework allows us to create fully accessible UI components with ease, while giving us complete control over how components look and function.

## **Backend**

The backend of the application is built with the following technologies:

- [**MongoDB**](https://www.mongodb.com/): a document database, which means it stores data in JSON-like documents. It is used for a variety of applications, including web applications, mobile applications, and big data analytics.

- [**Pusher**](https://pusher.com/): Pusher is used for handling real-time bi-directional communication between users. It allows for quick and reliable message transmission, enabling the real-time experience of Ringmaster.

- [**Prisma**](https://www.prisma.io/): an open-source, next-generation ORM that makes it fun and safe to work with a database like MySQL, Postgres, SQL Server, or MongoDB. It generates a type-safe client that abstracts away the complexity of the database, making it easy to write efficient and bug-free queries.

- [**Axios**](https://axios-http.com/): a popular promise-based HTTP client, is used for making HTTP requests from our server. It provides a simple and flexible API for our backend services.

- [**Cloudinary**](https://cloudinary.com/): for storing and serving images, we use Cloudinary. It provides a reliable and efficient cloud-based solution for managing user-uploaded images.


# **Running Application Locally**

To run the Ringmaster application on your local machine, you'll need to follow the steps below. For more detailed instructions, please refer to the project's Wiki.

## 1. **Clone the Project Locally**

You'll first need to clone the project repository to your local machine. Open your terminal, navigate to the directory where you want to store the project, and run the following command:

```sh
git clone https://github.com/mbeps/ringmaster-messaging.git
```

## 2. **Install Dependencies**

Navigate to the root directory of the project by running the following command:

```sh
cd ringmaster
```

Then, install the project dependencies by running:

```sh
npm install
```

## 3. **Set Up Environment Variables**

You'll need to set up your environment variables to run the application. In the root of your project, create a `.env.local` file. The environment variables you'll need to include are:

```sh
# Access to MongoDB database
DATABASE_URL=""

# A secret to encode your session cookie
NEXTAUTH_SECRET=''

# Credentials for GitHub OAuth 
GITHUB_ID=''
GITHUB_SECRET=''

# Credentials for Google OAuth
GOOGLE_CLIENT_ID=''
GOOGLE_CLIENT_SECRET=''

# For storing images in Cloudinary 
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=''
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=''

# For enabling Real-Time messaging
NEXT_PUBLIC_PUSHER_APP_KEY=""
PUSHER_APP_ID=""
PUSHER_SECRET=""
```

You'll need to fill in the value for each of these variables. Here's how to get each one:

- `DATABASE_URL`: This is your MongoDB connection string. You can obtain this from your MongoDB Atlas account.

- `NEXTAUTH_SECRET`: This can be any random string. It's used to encode your session cookie.

- `GITHUB_ID` and `GITHUB_SECRET`: You can obtain these by creating a new OAuth app in your GitHub account.

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: You can obtain these by setting up a new project in Google Cloud Platform and enabling the Google+ API.

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: You can get these from your Cloudinary account settings. Make sure the `node` setting is unsigned. 

- `NEXT_PUBLIC_PUSHER_APP_KEY`, `PUSHER_APP_ID` and `PUSHER_SECRET`: You can get these from your Pusher account.

## 4. **Run the Application**

Once you've set up your environment variables, you can run the application using the following command:

```sh
npm run dev
```

The application should now be running at `http://localhost:3000`.
