MongoDB has been used to model database which is a non-relational database (NoSQL). 
This MongoDB schema outlines the data model for a chat application, with four primary entities: 
- `User`
- `Account`
- `Conversation`
- `Message`


# **Entities**

## **User**

The `User` entity represents a registered user in the application. Each user has a unique `id` that is generated automatically. Other fields in the `User` model include `name`, `email`, `emailVerified`, `image`, `hashedPassword`, `createdAt`, and `updatedAt`. 

- `email` is unique for each user and might be optional.
- `createdAt` is automatically set to the current date and time when a user is created.
- `updatedAt` is automatically updated whenever a user record is modified.

The `User` model also has relations with other entities:

- `conversations`: Each user can have multiple conversations. This is a many-to-many relationship where `conversationIds` on the User model reference the `id` field on the Conversation model.
- `seenMessages`: A user has seen multiple messages. This relation is labelled as "Seen" and connects `seenMessageIds` from the User model to the `id` field on the Message model.
- `accounts`: Each user can have multiple accounts on external services or platforms.
- `messages`: A user can send multiple messages.

## **Account**

The `Account` entity represents a user's account on an external service or platform. Each account has a unique `id` that is automatically generated. Other fields include `userId`, `type`, `provider`, `providerAccountId`, `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, and `session_state`.

- `provider` and `providerAccountId` together form a unique pair.

The `Account` model has a relation with the `User` model:

- `user`: Each account is related to one user. If a user is deleted, all their associated accounts are also deleted due to the `onDelete: Cascade` constraint.

## **Conversation**

The `Conversation` entity represents a conversation in the application. Each conversation has a unique `id` that is automatically generated. Other fields include `createdAt`, `lastMessageAt`, `name`, and `isGroup`.

The `Conversation` model has relations with other entities:

- `messages`: A conversation can have multiple messages.
- `users`: A conversation can involve multiple users. This is a many-to-many relationship where `userIds` on the Conversation model reference the `id` field on the User model.

## **Message**

The `Message` entity represents a message within a conversation. Each message has a unique `id` that is automatically generated. Other fields include `body`, `image`, and `createdAt`.

The `Message` model has relations with other entities:

- `seen`: A message can be seen by multiple users. This relation is labelled as "Seen" and connects `seenIds` from the Message model to the `id` field on the User model.
- `conversation`: Each message is part of one conversation. If a conversation is deleted, all its associated messages are also deleted due to the `onDelete: Cascade` constraint.
- `sender`: Each message is sent by one user. If a user is deleted, all their sent messages are also deleted due to the `onDelete: Cascade` constraint.


# **Relationships Between Entities**

## **User and Conversation**

The `User` and `Conversation` entities have a many-to-many relationship. A user can be part of multiple conversations, and similarly, a conversation can involve multiple users. This relationship is represented in the schema with the `conversations` field in the `User` model and the `users` field in the `Conversation` model.

## **User and Message**

The relationship between `User` and `Message` entities is multi-faceted:

- `User` to `Message` is a one-to-many relationship through the `messages` field, meaning a user can send multiple messages.
- `Message` to `User` is a many-to-one relationship through the `sender` field, indicating that each message is sent by one user.
- `User` to `Message` is also a many-to-many relationship through the `seenMessages` and `seen` fields, indicating that a user can see multiple messages and a message can be seen by multiple users.

## **User and Account**

The `User` and `Account` entities have a one-to-many relationship. A user can have multiple accounts on different external services or platforms, but each account is associated with only one user. This relationship is represented with the `accounts` field in the `User` model and the `user` field in the `Account` model.

## **Conversation and Message**

The `Conversation` and `Message` entities have a one-to-many relationship. A conversation can have multiple messages, but each message belongs to only one conversation. This relationship is represented with the `messages` field in the `Conversation` model and the `conversation` field in the `Message` model.

