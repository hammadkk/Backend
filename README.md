# Youtube-Backend-Project

Welcome to the Youtube-Backend-Project, an exciting endeavor where we'll delve into creating a robust backend project a dynamic video hosting platform with engaging features. Throughout this project, I've explored various technologies and frameworks, including Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, Bcrypt, and Cloudinary, to craft the best solution.

# Features:
1. Video Hosting
2. User Authentication:
   - Seamless signup and login functionalities.
   - Secure user data with JWT encryption and Bcrypt hashing.
3. Video Management:
   - Effortlessly upload videos and interact with likes, and comments.
   - Advanced features such as comment likes.
4. Subscription System:
   - Enable users to subscribe to their favorite channels.

# Technologies Used:
- Node.js & Express.js: Powering the core backend functionalities.
- MongoDB & Mongoose: Efficiently managing user data, videos, and tweets.
- JWT & Bcrypt: Ensuring the security of user authentication.
- Multer & Cloudinary: Facilitating seamless video uploads and storage And many more.
  
# Configuration:
Customize your application using the following environment variables:
- PORT: Set your preferred port number.
- MONGODB_URI: Connect to your MongoDB database.
- CORS_ORIGIN: Specify allowed CORS origins.
- ACCESS_TOKEN_SECRET: Secure access token generation.
- ACCESS_TOKEN_EXPIRY: Set access token expiration.
- REFRESH_TOKEN_SECRET: Secure refresh token generation.
- REFRESH_TOKEN_EXPIRY: Set refresh token expiration.
  
# Session and Cookies:
 Implementation combines session and cookies. While the ACCESS_TOKEN is not stored in the database, the REFRESH_TOKEN is retained for a specific duration.

# Cloudinary Configuration:
For seamless Cloudinary integration, provide the following environment variables:

- CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name.
- CLOUDINARY_API_KEY: Your Cloudinary API key.
- CLOUDINARY_API_SECRET: Your Cloudinary API secret.
  
Ensure these environment variables are set in your deployment environment or provided via a .env file for local development.

# Postman Link:
Explore the API documentation by visiting this Postman Link.
https://www.postman.com/red-crescent-705393/workspace/backend-project/collection/21887364-c3a3cac0-f3c5-42e8-b370-3a712de2cb87


Thank you for being part of my learning journey!
