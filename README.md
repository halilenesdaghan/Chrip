# Social Media Application

This project is a full-stack social media application designed for university students. It features forums, polls, groups, and user interactions to facilitate communication and community building.

## Project Structure

The application is divided into two main parts:

### Backend (Flask)

The backend is built with Flask and provides RESTful API endpoints for:

- User authentication (login, registration, password reset)
- Forums (creating, editing, viewing discussions)
- Polls (creating, voting, viewing results)
- Groups (creating, joining, managing members)
- Comments (adding, editing, reacting to comments)
- Media uploads (storing and retrieving images)

### Frontend (React)

The frontend is built with React and includes:

- User authentication flows
- Forum browsing and participation
- Poll creation and voting
- Group management
- Profile management
- Responsive design with Tailwind CSS

## Features

- **User Authentication**: Complete login/registration system with password reset functionality
- **Forums**: Create, edit, and participate in discussion forums with topic categorization
- **Polls**: Create polls with multiple options, vote, and view results
- **Groups**: Create and join groups with different privacy settings
- **Comments**: Add comments on forums and polls with rich text and media support
- **User Profiles**: View and edit user profiles, track activity
- **Media Upload**: Support for image uploads in forums, comments, and profiles

## Key Technologies

### Backend
- Python (Flask)
- Flask Blueprints for modular API endpoints
- JWT for authentication
- Marshmallow for data validation
- RESTful API design

### Frontend
- React
- Redux for state management
- React Router for navigation
- Formik for form handling
- Yup for validation
- Tailwind CSS for styling
- React Icons
- Axios for API communication

## Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```
   python run.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Mock API Mode

The frontend includes a mock API interceptor that can be used for development without having the backend running. This is enabled by default and can be disabled by setting `IS_MOCK_API = false` in `src/api/index.js`.

## Folder Structure

### Backend
```
backend/
  ├── app/
  │   ├── api/                 # API endpoints
  │   ├── middleware/          # Authentication and validation
  │   ├── models/              # Database models
  │   ├── services/            # Business logic
  │   └── utils/               # Helper functions
  └── run.py                   # Application entry point
```

### Frontend
```
frontend/
  ├── public/                  # Static assets
  └── src/
      ├── api/                 # API services
      ├── components/          # Reusable React components
      ├── pages/               # Page components
      ├── store/               # Redux store and slices
      ├── styles/              # CSS and Tailwind configuration
      └── utils/               # Helper functions
```

## Language Support

The application includes internationalization support with messages in Turkish.

## License

This project is open source and available under the MIT License.
