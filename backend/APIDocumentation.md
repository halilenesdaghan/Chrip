# Detailed API Documentation

## Base URL
```
http://13.60.87.227:5000/api/v1
```

## Authentication Endpoints

### POST `/auth/register`
Register a new user.

**Request Body:**
- `email` (string, required)
- `password` (string, required, minimum 6 characters)
- `gender` (string, optional, values: ["Erkek", "Kadın", "Diğer"])

### POST `/auth/login`
Login a user.

**Request Body:**
- `email` (string, required)
- `password` (string, required)

### GET `/auth/me`
Get information of the authenticated user.

**Headers:**
- Authorization: Bearer {JWT Token}

### POST `/auth/refresh-token`
Refresh JWT token for authenticated user.

**Headers:**
- Authorization: Bearer {JWT Token}

### POST `/auth/change-password`
Change password for authenticated user.

**Headers:**
- Authorization: Bearer {JWT Token}

**Request Body:**
- `current_password` (string, required)
- `new_password` (string, required, minimum 6 characters)

### POST `/auth/forgot-password`
Request password reset.

**Request Body:**
- `email` (string, required)

### POST `/auth/reset-password`
Reset user password.

**Request Body:**
- `reset_token` (string, required)
- `new_password` (string, required, minimum 6 characters)

## Comment Endpoints

### POST `/comments/`
Create a comment.

**Headers:**
- Authorization: Bearer {JWT Token}

**Request Body:**
- `commented_on_id` (string, required)
- `content` (string, required)
- `photo_urls` (array of strings, optional)

### GET `/comments/commented_on_id=<commented_on_id>`
Retrieve comments for a specific post.

**Headers:**
- Authorization: Bearer {JWT Token}

### GET `/comments/<comment_id>`
Retrieve a specific comment by ID.

**Headers:**
- Authorization: Bearer {JWT Token}

### PUT `/comments/<comment_id>`
Update a comment.

**Headers:**
- Authorization: Bearer {JWT Token}

**Request Body:**
- `content` (string, optional)
- `photo_urls` (array of strings, optional)

### DELETE `/comments/<comment_id>`
Delete a comment.

**Headers:**
- Authorization: Bearer {JWT Token}

### GET `/comments/<comment_id>/replies`
Get replies to a comment.

**Query Parameters:**
- `page` (integer, optional)
- `per_page` (integer, optional)

### POST `/comments/<comment_id>/react`
React to a comment (like or dislike).

**Headers:**
- Authorization: Bearer {JWT Token}

**Request Body:**
- `reaction_type` (string, required, values: ["like", "dislike"])

### GET `/comments/<comment_id>/creator_info`
Get creator's information of a comment.

**Headers:**
- Authorization: Bearer {JWT Token}

### POST `/comments/<comment_id>/reply`
Reply to a comment.

**Headers:**
- Authorization: Bearer {JWT Token}

**Request Body:**
- `content` (string, optional)
- `photo_urls` (array of strings, optional)

## Forum Endpoints

### GET `/forums/`
Retrieve forums.

**Headers:**
- Authorization: Bearer {JWT Token}

**Query Parameters:**
- `page` (integer, optional)
- `per_page` (integer, optional)
- `category` (string, optional)
- `university` (string, optional)
- `search` (string, optional)

### GET `/forums/<forum_id>`
Retrieve a forum by ID.

**Headers:**
- Authorization: Bearer {JWT Token}

### GET `/forums/<forum_id>/creator_info`
Get forum creator information.

**Headers:**
- Authorization: Bearer {JWT Token}

### POST `/forums/`
Create a new forum.

**Headers:**
- Authorization: Bearer {JWT Token}

**Request Body:**
- `header` (string, required, 3-100 characters)
- `description` (string, optional)
- `category` (string, optional)
- `photo_urls` (array of strings, optional)

### PUT `/forums/<forum_id>`
Update a forum.

**Headers:**
- Authorization: Bearer {JWT Token}

**Request Body:**
- `header` (string, optional, 3-100 characters)
- `description` (string, optional)
- `university` (string, optional)
- `category` (string, optional)
- `photo_urls` (array of strings, optional)

### DELETE `/forums/<forum_id>`
Delete a forum (creator or admin only).

**Headers:**
- Authorization: Bearer {JWT Token}

## User Endpoints

### GET `/users/by-username/<username>`
Retrieve user information by username.

**Headers:**
- Authorization: Bearer {JWT Token}

### PUT `/users/profile`
Update user profile.

**Headers:**
- Authorization: Bearer {JWT Token}

**Request Body:**
- `username` (string, optional, 3-30 characters)
- `password` (string, optional, minimum 6 characters)
- `gender` (string, optional, values: ["Erkek", "Kadın", "Diğer"])
- `university` (string, optional)
- `profile_image_url` (string, optional)

### DELETE `/users/account`
Delete the authenticated user's account.

**Headers:**
- Authorization: Bearer {JWT Token}

### GET `/users/forums`
Retrieve forums created by authenticated user.

**Headers:**
- Authorization: Bearer {JWT Token}

### GET `/users/polls`
Retrieve polls created by authenticated user.

**Headers:**
- Authorization: Bearer {JWT Token}

### GET `/users/groups`
Retrieve groups the authenticated user belongs to.

**Headers:**
- Authorization: Bearer {JWT Token}

