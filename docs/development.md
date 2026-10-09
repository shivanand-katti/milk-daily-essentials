# Windows development setup

These steps establish local tooling; backend and client modules will be introduced in subsequent commits.

## Required tools

- Git for Windows
- Java 17 JDK
- Node.js LTS and npm
- MySQL 8 Server (or Docker Desktop running MySQL 8)
- VS Code and/or IntelliJ IDEA
- Expo Go on a test phone or an Android emulator for mobile development

Verify installed tools in PowerShell:

```powershell
git --version
java -version
node --version
npm --version
mysql --version
```

If `mysql --version` is not recognized, either install MySQL Shell/Client and add its `bin` directory to PATH, or use a local MySQL Docker container.

## Clone the repository

```powershell
git clone https://github.com/shivanand-katti/milk-daily-essentials.git
Set-Location milk-daily-essentials
git status
```

## Create a local database

Use a local MySQL account with permission to create a database. Example:

```sql
CREATE DATABASE milk_essentials
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
```

Apply the migration with MySQL client from the repository root:

```powershell
Get-Content .\database\migrations\V1__initial_schema.sql |
  mysql -u root -p milk_essentials
```

For later application environments, use Flyway from the Spring Boot backend rather than manually applying migrations. Do not commit passwords or keys.

## Environment variables planned for backend

`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and optionally `OPENROUTER_API_KEY`. These will be wired into Spring Boot configuration when the backend module lands.
