# Warehouse Order Fulfillment Platform

Simple warehouse workflow: manage products, create customer orders, and pick items by location.

## Core modules

- **Inventory** — add, update, and track stock.
- **Orders** — create orders from available products.
- **Picking** — complete order items from the warehouse queue.
- **Dashboard** — monitor stock and order status.
- **Authentication** — administrator sign-in.

## Requirements

- Java 21+
- Node.js 22.12+
- MySQL 8+

## Run locally

1. Run `New folder\database\schema.sql` in MySQL Workbench.
2. In PowerShell, configure the database and administrator, then start the backend:

   ```powershell
   $env:DB_URL = "jdbc:mysql://localhost:3306/warehouse_db"
   $env:DB_USERNAME = "root"
   $env:DB_PASSWORD = "your-mysql-password"
   $env:ADMIN_USERNAME = "warehouse-admin"
   $env:ADMIN_PASSWORD = "use-a-unique-password-at-least-12-characters"
   Set-Location ".\New folder\Backend"
   .\mvnw.cmd spring-boot:run
   ```

3. In a second terminal, start the frontend:

   ```powershell
   Set-Location ".\New folder\Frontend"
   npm install
   npm run dev
   ```

4. Open the Vite URL (usually `http://localhost:5173`) and sign in.

Keep credentials out of source files. For production, use HTTPS and set `SESSION_COOKIE_SECURE=true`.

## Checks

```powershell
Set-Location ".\New folder\Frontend"; npm run lint; npm run build
Set-Location "..\Backend"; .\mvnw.cmd test
```
