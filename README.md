# Next.js Math Course Platform

<p align="center">
<img src="https://go-skill-icons.vercel.app/api/icons?i=next,ts,react,tailwind,shadcn,betterauth,drizzle,postgres,payload" />
</p>

<img src="https://github-production-user-asset-6210df.s3.amazonaws.com/85953204/501021606-1fedfd39-0289-4a46-9bd3-bf56b96dde95.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20251014%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251014T152323Z&X-Amz-Expires=300&X-Amz-Signature=00306c2e0d56d94033c1bf98fff4c27d39ab328f125526f01ae43f117342aa10&X-Amz-SignedHeaders=host" />

## Requirements

- **Node.js** (v18 or higher)
- **npm** package manager
- **Docker Desktop** (for PostgreSQL database)
- **Git**

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/maciekt07/nextjs-math-course
cd nextjs-math-course
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory. Use [.env.example](.env.example) as a template.

### 4. Start PostgreSQL Database

Start the PostgreSQL container:

```bash
docker-compose up -d
```

To verify the database is running:

```bash
docker-compose ps
```

### 6. Start the Development Server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000)

## Database Management

### Access PostgreSQL CLI

```bash
docker-compose exec db psql -U postgres -d math_course
```

### View Database with Drizzle Studio

```bash
npm run db:studio
```

This opens a visual database browser at [https://local.drizzle.studio](https://local.drizzle.studio)

### Stop the Database

```bash
docker-compose down
```

## Credits

Made with ❤ by [maciekt07](https://github.com/maciekt07), licensed under [MIT](/LICENSE)
