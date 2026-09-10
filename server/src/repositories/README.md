# Repositories

Repositories are the only modules permitted to import Prisma or execute raw SQL. Routes and services must not access the database directly.

- Only repositories may import Prisma or execute SQL.
- Routes handle HTTP requests and responses and delegate application logic to services.
- Services implement application logic and use repositories for database access.
- Routes and services must not access the database directly.
