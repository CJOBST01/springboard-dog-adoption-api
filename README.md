# Dog Adoption Platform API

Backend service for a dog adoption platform, built with Express, MongoDB, and JWT auth. Submitted as the assessment project for Unit 19.10.

## Features

- User registration and login with bcrypt-hashed passwords.
- JWT-based authentication, 24-hour token expiry.
- Dog registration by authenticated users.
- Dog adoption with thank-you message; owners cannot adopt their own dogs and adopted dogs cannot be adopted again.
- Dog removal restricted to the original owner; adopted dogs cannot be removed.
- Pagination and status filtering on dog lists.
- Layered architecture: routes -> controllers -> models.
- Mocha + Chai integration test for the dog flow.

## Setup

```bash
npm install
cp .env.example .env  # then fill in MONGODB_URI and JWT_SECRET
npm start
npm test
```

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | no | Register a new user. |
| POST | `/auth/login` | no | Log in and receive a JWT. |
| POST | `/dogs` | yes | Register a dog. |
| GET | `/dogs/registered` | yes | List dogs you've registered. Filter with `?status=available|adopted` and paginate with `?page=&limit=`. |
| GET | `/dogs/adopted` | yes | List dogs you've adopted, paginated. |
| POST | `/dogs/:id/adopt` | yes | Adopt a dog with a `thankYouMessage` body field. |
| DELETE | `/dogs/:id` | yes | Remove a dog you registered (only if not adopted). |
