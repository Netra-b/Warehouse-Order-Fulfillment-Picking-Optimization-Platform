# Warehouse Order Fulfillment & Picking Optimization Platform

This project contains a React/Vite frontend, a Spring Boot API, a MySQL schema, and project documentation. Open this folder in VS Code, then use the two-terminal setup below to run the application.

## Requirements

- Java Development Kit (JDK) 21 or newer
- Node.js 22.12 or newer, and npm
- MySQL Server 8 or newer (and MySQL Workbench, or the MySQL command-line client)

Check Java and Node.js in a VS Code terminal:

```powershell
java -version
node --version
npm --version
```

## First-time setup

1. Start the MySQL server.
2. Open `New folder\database\schema.sql` in MySQL Workbench and execute the whole script. It creates `warehouse_db`, its tables, and sample products.
3. In VS Code, open the workspace folder that contains `New folder`. The backend is in `New folder\Backend`; the frontend is in `New folder\Frontend`.
4. Choose a unique administrator username and a password of at least 12 characters. The password is stored as a BCrypt hash; set these values in the backend terminal before starting it. Do not put real passwords in source files or commit them.

## Start the application

### Terminal 1: MySQL-backed API

From the workspace folder, run these commands. Replace the sample password with your MySQL user's password and choose your own administrator credentials:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/warehouse_db"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-mysql-password"
$env:ADMIN_USERNAME = "warehouse-admin"
$env:ADMIN_PASSWORD = "choose-a-unique-password-at-least-12-characters"
Set-Location ".\New folder\Backend"
.\mvnw.cmd spring-boot:run
```

If your terminal prompt looks like `C:\Users\Admin\Downloads\PROJECT>`, it is Command Prompt, not PowerShell. Use these equivalent commands there (replace the database password and choose your administrator credentials):

```cmd
set "DB_URL=jdbc:mysql://localhost:3306/warehouse_db"
set "DB_USERNAME=root"
set "DB_PASSWORD=your-mysql-password"
set "ADMIN_USERNAME=warehouse-admin"
set "ADMIN_PASSWORD=choose-a-unique-password-at-least-12-characters"
cd /d "New folder\Backend"
mvnw.cmd spring-boot:run
```

Keep this terminal open. On the first startup, the backend creates the administrator account from `ADMIN_USERNAME` and `ADMIN_PASSWORD`. The account and its password hash remain in the database after you close VS Code. Terminal environment variables are temporary, however: set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` again in each new backend terminal. You only need to set `ADMIN_USERNAME` and `ADMIN_PASSWORD` again if you are creating the initial account or bootstrapping another account.

### Terminal 2: React frontend

Open a second VS Code terminal, return to the workspace folder if needed, and run:

```powershell
Set-Location ".\New folder\Frontend"
npm install
npm run dev
```

For Command Prompt, use:

```cmd
cd /d "New folder\Frontend"
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`) and sign in with the administrator credentials set above. Keep both terminals running. The Vite development server proxies API requests to `http://localhost:8080`.

To stop either service, press `Ctrl+C` in its terminal.

## Run again after closing VS Code

Closing VS Code stops the frontend and backend terminals; it does not delete your database or administrator account. To start the app again:

1. Reopen this project folder in VS Code.
2. Make sure the MySQL Server service is running.
3. Open a terminal, set the database connection variables again, and start the backend:

   ```powershell
   $env:DB_URL = "jdbc:mysql://localhost:3306/warehouse_db"
   $env:DB_USERNAME = "root"
   $env:DB_PASSWORD = "your-mysql-password"
   Set-Location ".\New folder\Backend"
   .\mvnw.cmd spring-boot:run
   ```

   In Command Prompt, use:

   ```cmd
   set "DB_URL=jdbc:mysql://localhost:3306/warehouse_db"
   set "DB_USERNAME=root"
   set "DB_PASSWORD=your-mysql-password"
   cd /d "New folder\Backend"
   mvnw.cmd spring-boot:run
   ```

4. Open a **second** terminal and start the frontend:

   ```powershell
   Set-Location ".\New folder\Frontend"
   npm run dev
   ```

   In Command Prompt, use:

   ```cmd
   cd /d "New folder\Frontend"
   npm run dev
   ```

   You do not need to run `npm install` again unless the frontend dependencies have changed.
5. Open the local URL printed by Vite (usually `http://localhost:5173`) and sign in with the same administrator username and password you created the first time.

## Useful commands

Run from `New folder\Frontend`:

```powershell
npm run lint
npm run build
```

Run backend tests from `New folder\Backend` (the tests use an in-memory database):

```powershell
.\mvnw.cmd test
```

## Troubleshooting

- **Cannot connect to MySQL:** Confirm the MySQL service is running, `warehouse_db` exists, and `DB_USERNAME` / `DB_PASSWORD` match your MySQL account.
- **Login page says `Request failed (502)` or `Failed to fetch`:** The backend is not running or cannot reach MySQL. Start MySQL and the backend using the steps above, leave its terminal open, then refresh the page.
- **The backend asks for an administrator:** Set both `ADMIN_USERNAME` and `ADMIN_PASSWORD` in the same terminal before starting it. The initial password must be at least 12 characters.
- **Address already in use:** Stop the other process using port `8080` (backend) or `5173` (frontend), or configure a different port.
- **Java version error:** Confirm `java -version` reports JDK 21 or newer and that `JAVA_HOME` points to that JDK.
- **Production deployment:** Serve the app over HTTPS and set `SESSION_COOKIE_SECURE=true` for secure session cookies. Do not expose the development server directly to the internet.

## Project layout

- `New folder\Backend` — Spring Boot API and session-based authentication
- `New folder\Frontend` — React/Vite user interface
- `New folder\database\schema.sql` — MySQL database and sample data setup
- `New folder\Documentation` — project documents and screenshots
