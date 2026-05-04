# GETFIT GYM

Application web complete de gestion de salle de sport avec module de recommandation d'entrainement personnalise.

## Fonctionnalites

- Authentification securisee par JWT.
- Gestion des roles: administrateur, coach, membre.
- Gestion des membres, coachs, abonnements, cours collectifs, presences et paiements.
- Tableau de bord avec statistiques, revenus et alertes d'abonnement.
- Portail coach pour suivre le planning et les participants.
- Portail membre pour consulter l'abonnement, les cours, les paiements et le programme recommande.
- Module IA local qui genere un programme sportif adapte aux objectifs, niveau, progression et historique.
- API REST Express et base relationnelle MySQL avec Prisma.

## Lancement du projet de A a Z

### 1. Prerequis

Installer les outils suivants:

- Node.js
- npm
- MySQL Server
- MySQL Workbench

Verifier que Node.js et npm sont bien installes:

```powershell
node --version
npm --version
```

### 2. Ouvrir le dossier du projet

Dans PowerShell:

```powershell
cd C:\Users\PC\Desktop\pfa.2025.2026
```

### 3. Creer la base de donnees avec MySQL Workbench

1. Ouvrir MySQL Workbench.
2. Se connecter a votre serveur MySQL.
3. Cliquer sur un nouvel onglet SQL.
4. Executer cette commande:

```sql
CREATE DATABASE gym_ai_pfa
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

La base doit s'appeler exactement:

```text
gym_ai_pfa
```

### 4. Verifier la configuration MySQL

Ouvrir le fichier:

```text
server\.env
```

Configuration par defaut:

```env
DATABASE_URL="mysql://root:@localhost:3306/gym_ai_pfa"
JWT_SECRET="pfa-gym-ai-local-secret"
JWT_EXPIRES_IN="8h"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

Si votre utilisateur MySQL `root` a un mot de passe, modifier la ligne `DATABASE_URL`.

Exemple:

```env
DATABASE_URL="mysql://root:VOTRE_MOT_DE_PASSE@localhost:3306/gym_ai_pfa"
```

### 5. Installer les dependances

Dans PowerShell, depuis le dossier du projet:

```powershell
npm install
```

### 6. Creer les tables dans MySQL

Cette commande lit `server/prisma/schema.prisma` et cree les tables dans la base MySQL:

```powershell
npm run db:push
```

### 7. Ajouter les donnees de test

Cette commande ajoute les comptes de demonstration, les membres, les coachs, les abonnements, les cours, les paiements et les recommandations IA:

```powershell
npm run seed
```

### 8. Lancer le projet

```powershell
npm run dev
```

Cette commande lance:

- le backend Express sur `http://localhost:4000/api`
- le frontend React sur `http://localhost:5173`

### 9. Ouvrir l'application

Dans le navigateur:

```text
http://localhost:5173
```

### 10. Comptes de connexion

| Role | Email | Mot de passe |
| --- | --- | --- |
| Administrateur | admin@gym-ai.local | Admin123! |
| Coach | coach@gym-ai.local | Coach123! |
| Membre | member@gym-ai.local | Member123! |

## Commandes utiles

```bash
npm install
npm run db:push
npm run seed
npm run dev
```

Reinitialiser la base de donnees:

```powershell
npm run db:reset
```

Ouvrir Prisma Studio pour voir les donnees:

```powershell
npm run db:studio
```

Compiler le frontend:

```powershell
npm run build
```

## Depannage rapide

### Erreur: impossible de se connecter a MySQL

Verifier que MySQL Server est lance.

Dans MySQL Workbench, tester la connexion avec:

```text
Hostname: 127.0.0.1
Port: 3306
Username: root
Password: votre mot de passe MySQL
```

Puis verifier que `server\.env` contient le bon mot de passe.

### Erreur: Unknown database `gym_ai_pfa`

La base n'a pas ete creee. Retourner dans MySQL Workbench et executer:

```sql
CREATE DATABASE gym_ai_pfa
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### Erreur: port deja utilise

Verifier si un autre serveur utilise deja:

- `4000` pour le backend
- `5173` pour le frontend

Fermer l'ancien terminal ou changer le port.

### Apres modification du schema Prisma

Relancer:

```powershell
npm run db:push
npm run seed
```

## Structure

```text
client/   Interface React
server/   API Express, Prisma, logique metier et recommandation IA
```

## Base de donnees

Le projet utilise MySQL.

Configuration par defaut dans `server/.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/gym_ai_pfa"
```

Avec XAMPP:

1. Demarrer `Apache` et `MySQL` dans XAMPP.
2. Ouvrir `http://localhost/phpmyadmin`.
3. Creer une base nommee `gym_ai_pfa` avec l'encodage `utf8mb4_unicode_ci`.
4. Lancer:

```bash
npm run db:push
npm run seed
npm run dev
```

Si la commande `mysql` est disponible dans le terminal, `npm run db:create` peut creer la base automatiquement.
