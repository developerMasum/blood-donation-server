# Blood Donation Application -  Donation Platform

Blood Donation Application is a web application designed to facilitate blood donation by connecting blood donors with individuals in need of blood. The platform offers a user-friendly interface for both donors and recipients, ensuring efficient communication and coordination for blood donation requests.

## Live URL

[Visit Blood Donation Application](https://blood-donation-rouge-nu.vercel.app)

## Postman Documentation

[Postman Documentation](https://documenter.getpostman.com/view/31710966/2sA35G3gzJ) 
- provides detailed documentation of the Blood Donation Application API endpoints and their usage.

## Features

1. **User Registration**: Users can register on the platform providing necessary details including name, email, password, blood type, location, age, and last donation date.
2. **User Login**: Registered users can securely log in using their email and password.
3. **Find Donors**: Users can search for blood donors based on various criteria such as blood type, location, name, email, age, and last donation date. The results are paginated and sortable.
4. **Request Blood**: Users can request blood donation from registered donors by providing relevant details including donor's ID, phone number, date of donation, hospital name, hospital address, and reason.
5. **View Donation Requests**: Donors can view incoming donation requests with details such as requester ID, phone number, date of donation, hospital name, hospital address, and reason.
6. **Update Donation Status**: Donors can update the status of received donation requests, marking them as approved or rejected.
7. **View and Update Profile**: Users can view and update their profile information including bio, age, and last donation date.
8. **Error Handling**: Comprehensive error handling mechanisms are in place, providing detailed responses for validation errors, general errors, and unauthorized access attempts.

## Technology Used

- **Programming Language**: TypeScript
- **Web Framework**: Express.js
- **Object Relational Mapping (ORM)**: Prisma for PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

## Running the Application Locally

To run Blood Donation Application locally, follow these steps:

1. **Clone the Repository**: Clone the Blood Donation Application repository to your local machine using Git:

    ```bash
    git clone https://github.com/Porgramming-Hero-web-course/l2-b2-fullstack-track-assignment-8-developerMasum
    ```

2. **Install Dependencies**: Navigate to the project directory and install dependencies using npm or yarn:

    ```bash
    cd l2-b2-fullstack-track-assignment-8-developerMasum
    npm install
    ```

    or

    ```bash
    cd l2-b2-fullstack-track-assignment-8-developerMasum
    yarn install
    ```

3. **Set Up Environment Variables**: Create a `.env` file in the root directory of the project and add the following environment variables:

    ```plaintext
    DATABASE_URL=your_postgres_database_url
    JWT_SECRET=your_jwt_secret_key
    ```

    Replace `your_postgres_database_url` with the URL of your PostgreSQL database and `your_jwt_secret_key` with a secret key for JWT token encryption.

4. **Database Migration**: Run Prisma migration to apply database schema changes:

    ```bash
    npx prisma migrate dev 
    ```

5. **Start the Server**: Start the development server:

    ```bash
    npm run dev
    ```

    or

    ```bash
    yarn dev
    ```

6. **Access the Application**: Once the server is running, you can access the Blood Donation Application application locally at [http://localhost:3000](http://localhost:3000).

7. **Explore the API**: Use API endpoints to interact with the application. Refer to the API documentation for available endpoints and request/response formats.

## Additional Information

- The application follows RESTful API design principles for its endpoints.
- Global error handling middleware ensures consistent error responses throughout the application.
- User authentication is secured using JWT tokens, ensuring a scalable and secure authentication mechanism.
- PostgreSQL is used as the database for storing user and donation request data.
- Detailed API documentation is provided for easy integration with the platform.
- Blood Donation Application aims to promote blood donation and contribute to community well-being by facilitating blood donation processes.

