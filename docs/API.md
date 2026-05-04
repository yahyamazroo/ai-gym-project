# API REST

Base locale: `http://localhost:4000/api`

## Auth

- `POST /auth/login`: connexion, retourne `token` et `user`.
- `GET /auth/me`: utilisateur courant.

## Dashboard

- `GET /dashboard/stats`: statistiques selon le role connecte.

## Ressources principales

- `GET /members`, `POST /members`, `GET /members/:id`, `PUT /members/:id`, `DELETE /members/:id`
- `GET /coaches`, `POST /coaches`, `PUT /coaches/:id`, `DELETE /coaches/:id`
- `GET /plans`, `POST /plans`, `PUT /plans/:id`, `DELETE /plans/:id`
- `GET /subscriptions`, `POST /subscriptions`, `PUT /subscriptions/:id/status`, `DELETE /subscriptions/:id`
- `GET /courses`, `POST /courses`, `PUT /courses/:id`, `DELETE /courses/:id`
- `POST /courses/:id/enroll`, `DELETE /courses/:id/enrollments/:memberId`
- `GET /attendance`, `POST /attendance`, `DELETE /attendance/:id`
- `GET /payments`, `POST /payments`, `PUT /payments/:id`, `DELETE /payments/:id`
- `GET /recommendations`, `POST /recommendations/generate/:memberId`

## Portails

- `GET /portal/member`: espace membre.
- `GET /portal/coach`: planning coach.

## Exemple login

```json
{
  "email": "admin@gym-ai.local",
  "password": "Admin123!"
}
```
