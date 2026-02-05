# GardenlyReact

GardenlyReact is a web application designed for gardening enthusiasts, sellers, and experts. It provides a platform to explore gardening products, manage orders, and connect with experts for support.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher)
- **npm** (Node Package Manager)
- **Git** (for version control)

## Project Structure

The project is divided into two main parts:

1. **API (Backend)**: Located in the `api/` folder.
2. **Client (Frontend)**: Located in the `client/` folder.

## Initialization and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/SriHarshaRajuY/GardenlyReact.git
cd GardenlyReact
```

### 2. Install Dependencies

#### Backend (API)

Navigate to the `api/` folder and install the dependencies:

```bash
cd api
npm install
```

#### Frontend (Client)

Navigate to the `client/` folder and install the dependencies:

```bash
cd ../client
npm install
```

## Running the Application

### 1. Start the Backend Server

Navigate to the `api/` folder and run the following command:

```bash
npm start
```

This will start the backend server, typically running on `http://localhost:5000`.

### 2. Start the Frontend Development Server

Navigate to the `client/` folder and run the following command:

```bash
npm run dev
```

This will start the frontend development server, typically running on `http://localhost:5173`.

## Additional Commands

### Backend

- **Run in Development Mode**:
  ```bash
  npm run dev
  ```
- **Run Tests**:
  ```bash
  npm test
  ```

### Frontend

- **Build for Production**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```

## Notes

- Ensure the backend server is running before accessing the frontend.
- Update the `.env` files in both `api/` and `client/` folders with the required environment variables.

## License

This project is licensed under the MIT License.