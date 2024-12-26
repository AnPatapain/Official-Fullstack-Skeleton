# Official Fullstack Skeleton
![Docker](https://img.shields.io/badge/docker-27.3.1-green)
![Nginx](https://img.shields.io/badge/nginx-alpine-green)
![Typescript](https://img.shields.io/badge/typescript-5.2.2-green.svg)
![Node 18](https://img.shields.io/badge/node-18_alpine-green)
![Express 4.x.x](https://img.shields.io/badge/express-4.19.2-green.svg)
![React 18](https://img.shields.io/badge/react-18.2.0-green.svg)
![Postgresql 14](https://img.shields.io/badge/postgresql-14_alpine-green.svg)
![Prisma 5.x.x](https://img.shields.io/badge/prisma-5.20.0-green.svg)
![Tsoa 6.x.x](https://img.shields.io/badge/tsoa-6.4.0-green.svg)
![Swagger 5.x.x](https://img.shields.io/badge/swagger_api_docs-5.0.1-green.svg)

This project provides a production-ready fullstack application skeleton. It 
includes infrastructure like: containerization (via Docker), reverse proxy 
(using Nginx), and core features like: API-Access-Token, OpenAPI Docs. 
An automated testing system is also implemented for unit tests, end-to-end tests (E2E) 
and performance tests.

By using Docker, the project manages development, testing, and production 
environments, avoiding populating your host machine. Simply install Docker, and you're ready to go.


**Fullstack Skeleton overview**
- **Infrastructure:** Nginx, Docker, Postgresql, TLS-SSL for local development environment
- **Programming Language:** Typescript, Bash Script
- **Backend:** Express (server framework), Tsoa-Swagger(controller & auto API docs), Postgresql (relational database), Prisma (ORM) 
- **Frontend:** React
- **Automation Test (TODO: nyi):** Unit Test, End-to-End test (E2E), Performance Test
## Table of Contents
- [How to run](#how-to-run)
- [Architecture](#architecture-)
- [TODO](#todo)
- 

## How to run
First, make sure you have .env file in your root project with these values:
```shell
POSTGRES_USER=<username>
POSTGRES_PASSWORD=<password>
POSTGRES_DB=<database>
DATABASE_URL="postgresql://<username>:<password>@postgres-db:5432/<database>?schema=public"
HMAC_SECRET=<your secret string>
```
From root project, `./infrastructure/run.sh` is the entry point
command to run different environments: development, production, test,
reset environment, etc.
#### Manual
To see all options of the command `./infrastructure/run.sh` run:
``` bash
./infrastructure/run.sh --help
```
#### Check prerequisite installed
To list all prerequisite. Run:
``` bash
./infrastructure/run.sh list-prerequisite
```
To check prerequisite on your environment. Run:
``` bash
./infrastructure/run.sh prerequisite
```
#### Development
In development mode:
- Frontend is served by Vite server with hot module reload
- Typescript files will not be pre-transpiled to javascript but be transpiled
  in run-time by ts-node
- Mock data seed for development
- Fake email smtp server

To run development mode
``` bash
./infrastructure/run.sh dev
```
#### Production (Not work for now)
In production mode:
- Frontend is built to single javascript file and served by Nginx
- The mock data will not be seed

To run application in production mode
``` bash
./infrastructure/run.sh prod
```
#### Clean
To clean application environment.
``` bash
./infrastructure/run.sh clean
```
Best practice: Always run ```./infrastructure/run.sh clean``` before running
```./infrastructure/run.sh dev``` and ```./infrastructure/run.sh prod```

#### Install package
Best practice: Run `./infrastructure/run.sh clean` before running any below commands


To install every dependencies listed in packages/*/package.json
``` bash
pnpm install
```  
To install dev-dependency for specific package
``` bash
pnpm --filter <backend | frontend | shared-utils | shared-models> add --save-dev <package>
```  

To install dependency for specific package
``` bash
pnpm --filter <backend | frontend | shared-utils | shared-models> add <package>
```

#### Working with prisma
Typically, workflows is around changing the model schema, to do that, you need:
1. Stop application (if you already run it)
2. Change your schema in packages/backend/prisma/schema.prisma
3. Start application again (./entrypoint.sh dev). Prisma will automatically create
   a sql script reflecting your schema change. This script is called `migration` and will be
   in packages/backend/prisma/migrations
4. In case your `migration` is failed, you need to stop application, manually delete the migration in folder
   packages/backend/prisma/migrations and start your application again.

Note: Whenever change a model inside schema.prisma, always clean restart app:
```shell
./infrastructure/entrypoint.sh clean
./infrastructure/entrypoint.sh dev
```

## Architecture  
#### Development  
![Docker Compose for Development](static/architecture-dev.png)

#### Production    
![Docker Compose for Production](static/architecture-prod.png)

## TODO
- [ ] Section explaining diff from Dev, Prod, Test environment. How they are set up.
- [ ] Restrict import from some package  
- [ ] Script to check the prerequisite or install them maybe ?
- [ ] Synchronize router, controller, API docs
- [ ] UserModel authentication, MFA
- [ ] End-to-End test, Security test, Performance test.

