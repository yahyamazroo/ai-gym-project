# Configuration MySQL

## Avec XAMPP

1. Ouvrir XAMPP Control Panel.
2. Demarrer `MySQL`.
3. Ouvrir `http://localhost/phpmyadmin`.
4. Creer une base de donnees:

```sql
CREATE DATABASE getfit_gym CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. Verifier `server/.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/getfit_gym"
```

6. Lancer le projet:

```bash
npm run db:push
npm run seed
npm run dev
```

## Si MySQL a un mot de passe

Modifier l'URL:

```env
DATABASE_URL="mysql://root:TON_MOT_DE_PASSE@localhost:3306/getfit_gym"
```

## Si la commande mysql est disponible

La base peut etre creee automatiquement:

```bash
npm run db:create
```
