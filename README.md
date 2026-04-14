# Book My Ticket Application 🎟️

A straightforward backend service for managing user authentication and real-time seat booking, built with **Express, TypeScript, PostgreSQL (pg)**, and **Zod** for schema validation.

---

## 🛠️ Tech Stack & Architecture

- **Runtime Environment:** Node.js
- **Framework:** Express.js 
- **Language:** TypeScript
- **Database:** PostgreSQL (with `pg` driver for raw querying)
- **Validation:** Zod
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing

The project follows a standard MVC-inspired architecture categorized within `src/app`. Logic is split between **Routers**, **Controllers**, and **Models** (Validation Schemas).

---

## 🚀 How to Use / Run Locally

1. **Environment Setup:** 
   Ensure you have configured a `.env` file at the root. The required environment variables look like:
   ```env
   PORT=8080
   DB_HOST=localhost
   DB_PORT=5433
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=sql_class_2_db
   JWT_SECRET=your_secret_key
   REFRESH_SECRET=your_refresh_secret
   ```

2. **Docker Services (Database):**
   Start the connected Postgres database container via Docker.
   ```bash
   docker compose up -d
   ```

3. **Running the Application:**
   Start the TypeScript development server which automatically watches for changes.
   ```bash
   npm install
   npm run dev
   ```

   The app will run at `http://localhost:<PORT>`.

---

## 🔀 Control Flow & Routing 

All API requests pass through `src/index.ts`, establishing the server and invoking the root `createApplication()` factory located in `src/app/index.ts`. 

The central setup splits traffic across two main modules: **User (Auth)** and **Booking**.

### 1. User Module (`/api/v1/user`)
Handles registration and login flows. All payloads are validated using the `signUpPayloadModel` and `signInPayloadModel` constructed with Zod.

- **`POST /api/v1/user/sign-up`**
  - **Flow:** Validation Middlewares ➡️ `AuthController.handleSignUp` ➡️ Parses credentials, hashes password with `bcrypt`, creates DB row ➡️ Returns 201 Created.
- **`POST /api/v1/user/sign-in`**
  - **Flow:** Validation Middlewares ➡️ `AuthController.handleSignIn` ➡️ Checks password match ➡️ Generates Access and Refresh tokens (`jsonwebtoken`) ➡️ Injects tokens exclusively into HTTPOnly, Strict cookies.

### 2. Booking Module (`/api/v1/booking`)
Handles protected operations to list and book tickets using transaction locks.

- **`GET /api/v1/booking/seats`**
  - **Flow:** `BookingController.handleGetSeats` ➡️ Performs a quick lookup selecting all entries from the `seats` database table. Returns raw data.
  
- **`PUT /api/v1/booking/:id/:name`** 
  - *Protected route*
  - **Flow:** 
    1. **Zod Validation:** Safely checks that `:id` is a digit and transforms it to a number, ensuring `:name` follows constraints.
    2. **Authentication Middleware:** Reads `accessToken` from request cookies. Declines 401 if missing or 403 on tampering. Injects parsed `userId` and `email` down the chain.
    3. **Controller Execution:** Initiates an SQL Transaction block (`BEGIN`). Checks if the token's authenticated User ID actually corresponds to the provided `name`. Selects the necessary seat using `FOR UPDATE` (Row locking to prevent race conditions). 
    4. Evaluates `isbooked`. If unbooked, it completes the `UPDATE` query and runs `COMMIT`, reserving the seat. 

---

## 🛡️ Key Middlewares

- **`authenticateToken` (`src/app/middleware/middleware.ts`):** 
  Securely pulls the `accessToken` strictly from Cookies to mitigate XSS targeting Local Storage. Resolves the user identity to the protected route and caches properties onto `req.user`.
  
- **`validate` (`src/utils/validate.ts`):** 
  Universal error-trapping wrapper supporting dynamic Zod Schemas. Safely evaluates Request `Body`, `Params`, and `Query` returning `400 Bad Request` prior to hitting any database query blocks if data is malformed.
