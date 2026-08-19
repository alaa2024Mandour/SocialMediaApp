# Social Media App API

A Node.js/Express backend for a social media platform with authentication, posts, comments, reactions, friendships, real-time chat, groups, stories, notifications, S3 file uploads, Redis-backed sessions, and GraphQL user operations.

## Postman Documentation

Full API collection documentation:

https://documenter.getpostman.com/view/19906079/2sBXqCNNyP

## Features

- User authentication with JWT access and refresh tokens
- Email confirmation and OTP resend flow
- Google sign-in support
- Role-aware token prefixes for users and admins
- User profile, file upload, and S3 pre-signed URL helpers
- Posts with media attachments, tags, visibility, and comments
- Visibility rules for public, only-me, friends, and tagged posts
- Comments and nested replies
- React system for posts and comments
- Friend requests, request processing, canceling requests, and removing friends
- Friendships stored in a dedicated `Friendship` collection
- Private and group chat with Socket.IO
- Redis storage for active socket IDs and FCM tokens
- Firebase Cloud Messaging notifications
- Stories with text/media support, friend-only visibility, viewers tracking, and cron cleanup
- GraphQL API for user operations

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB and Mongoose
- Redis
- Socket.IO
- AWS S3
- Firebase Admin SDK
- GraphQL
- Zod validation
- Multer
- node-cron

## Project Structure

```txt
src/
  app.controller.ts
  index.ts
  config/
  DB/
    models/
    repositories/
  common/
    middleware/
    service/
    utils/
    validation/
    enum/
  modules/
    auth/
    users/
    posts/
    comments/
    reacts/
    friendship/
    chat/
    stories/
    graphql/
    realTime/
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

The app loads environment variables from:

```txt
.env.development
.env.production
```

based on `NODE_ENV`.

Example:

```env
PORT=3000
DB_URL=mongodb://127.0.0.1:27017/social_media_app
ONLINE_DB_URL=

ENCRYPTION_KEY=
IV_LENGTH=16

ACCESS_SECRET_KEY_USER=
REFRESH_SECRET_KEY_USER=
ACCESS_SECRET_KEY_ADMIN=
REFRESH_SECRET_KEY_ADMIN=

PREFIX_USER=Bearer
PREFIX_ADMIN=Admin

REDIS_URL=redis://127.0.0.1:6379

APPE_MAIL=
SENDING_EMAIL_PASSWORD=
WHITE_LIST=http://localhost:3000

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
```

### 3. Run the App

Development:

```bash
npm run start:dev
```

Production script:

```bash
npm run start:prod
```

The server starts from `src/index.ts`, connects MongoDB and Redis, mounts all REST/GraphQL routes, then initializes Socket.IO.

## Authentication

Protected routes require an `Authorization` header:

```txt
Authorization: <PREFIX_USER> <accessToken>
```

The prefix must match `PREFIX_USER` or `PREFIX_ADMIN` from the environment file.

Main auth routes:

| Method | Route | Description |
| --- | --- | --- |
| POST | `/auth/signUp` | Create a local account |
| POST | `/auth/signIn` | Sign in and receive tokens |
| POST | `/auth/confirm_email` | Confirm email with OTP |
| POST | `/auth/resend_email` | Resend confirmation OTP |
| POST | `/auth/signInWithGoogle` | Google authentication |

## API Overview

### Users

| Method | Route | Description |
| --- | --- | --- |
| GET | `/users/getProfile` | Get current user profile, friends, and groups |
| POST | `/users/upload/attachment` | Upload a single image |
| POST | `/users/upload/large/attachment` | Upload a large image |
| POST | `/users/upload/attachments` | Upload multiple images |
| POST | `/users/upload/signedUrl` | Create a pre-signed upload URL |
| GET | `/users/profile/picture_url/*path` | Get pre-signed profile picture URL |
| GET | `/users/profile/picture/*path` | Stream profile picture |
| GET | `/users/files-for-user` | List current user's S3 files |

### Posts and Comments

| Method | Route | Description |
| --- | --- | --- |
| POST | `/posts/createPost` | Create post with content, media, tags, and availability |
| GET | `/posts/getPosts` | Get visible posts with pagination/search |
| PUT | `/posts/updatePost/:postId` | Update owned post |
| POST | `/posts/:postId/comments` | Add comment on post |
| POST | `/posts/:postId/comments/:commentId/reply` | Add reply on comment |

### Reactions

| Method | Route | Description |
| --- | --- | --- |
| POST | `/react/createReact` | Create, update, or toggle a reaction |

Reactions are stored in a dedicated `React` collection and can target posts or comments.

### Friendship

| Method | Route | Description |
| --- | --- | --- |
| POST | `/friendship/sendFriendRequest/:to` | Send friend request |
| POST | `/friendship/processFriendRequest/:requestId` | Accept or reject request |
| GET | `/friendship/getReceivedRequests` | Get pending received requests |
| GET | `/friendship/getSentRequests` | Get pending sent requests |
| DELETE | `/friendship/removeFriend/:id` | Remove friendship |
| DELETE | `/friendship/cancelRequest/:id` | Cancel sent request |

### Chat

| Method | Route | Description |
| --- | --- | --- |
| GET | `/auth/:userId/chat` | Get private chat messages |
| GET | `/chat/group/:groupId` | Get group chat messages |
| POST | `/chat/group` | Create group chat |

Private and group messages are saved in the `Chat` collection. Message lists use slicing pagination through `page` and `limit`.

### Stories

| Method | Route | Description |
| --- | --- | --- |
| POST | `/stories` | Create story with content and/or media |
| GET | `/stories` | Get current user's and friends' active stories |
| GET | `/stories/my` | Get current user's active stories |
| POST | `/stories/:storyId/view` | Mark story as viewed |
| DELETE | `/stories/:storyId` | Delete owned story |

Stories expire after 24 hours using `expiresAt`. A cron job runs hourly to delete expired story documents and remove their media from S3.

## Socket.IO Events

Socket connections are authenticated with the same authorization value:

```js
const socket = io(baseURL, {
  auth: {
    authorization: "Bearer <accessToken>"
  }
});
```

Client events:

| Event | Payload | Description |
| --- | --- | --- |
| `sayHi` | any | Test event |
| `sendMessage` | `{ sendTo, content }` | Send private message |
| `join_room` | `{ roomId }` | Join a group chat room |
| `sendGroupMessage` | `{ groupId, content }` | Send message to group |

Server events:

| Event | Payload | Description |
| --- | --- | --- |
| `successMessage` | `{ content }` | Confirms sender message |
| `newMessage` | `{ content, from, groupId? }` | Delivers new private/group message |

Socket IDs are stored in Redis so a user can receive messages across multiple tabs/devices.

## GraphQL

GraphQL endpoint:

```txt
/graphql
```

The schema currently exposes user queries and mutations through `modules/auth/graphql`.

## File Uploads

The API uses Multer for request parsing and AWS S3 for storage. Uploaded files are stored under the `social_media_app/` prefix in the configured bucket.

Supported media types are configured in:

```txt
src/common/enum/multer.enum.ts
```

## Validation and Errors

Validation is handled with Zod schemas per module. Validation errors are returned through the global error handler with a status code and message payload.

## Notes

- Redis must be running before starting the app.
- MongoDB must be reachable through the configured DB URL.
- Firebase service account JSON is required for notifications.
- S3 credentials and bucket settings are required for file uploads and story cleanup.
- Story cleanup runs every hour with `node-cron`.
