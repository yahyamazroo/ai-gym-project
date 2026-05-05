# Conception du projet GETFIT GYM

## Objectif

GETFIT GYM centralise la gestion d'une salle de sport: membres, coachs, offres d'abonnement, abonnements, cours collectifs, presences, paiements et recommandations d'entrainement personnalisees.

## Acteurs

- Administrateur: gere l'ensemble des donnees, les paiements et les statistiques.
- Coach: consulte son planning, gere ses cours, suit les presences et consulte les membres.
- Membre: consulte son espace, ses paiements, ses cours et son programme IA.

## Architecture

```text
React/Vite               Express REST API                MySQL + Prisma Client
client/  <----------->   server/src/routes/   <------->   getfit_gym
```

## Modules

- Authentification: connexion par email/mot de passe, JWT, roles.
- Membres: CRUD, objectifs sportifs, niveau, progression.
- Coachs: CRUD, specialite, planning.
- Offres et abonnements: duree, prix, renouvellement, statut.
- Cours collectifs: planification, capacite, inscriptions.
- Presences: pointage present, retard ou absent.
- Paiements: montant, methode, statut, historique.
- Recommandation IA: generation d'un plan hebdomadaire selon objectif, niveau, score de progression, presences et abonnement.

## Modele de donnees

Entites principales:

- `User`: compte de connexion et role.
- `Member`: profil sportif du membre.
- `Coach`: profil coach.
- `SubscriptionPlan`: offre commerciale.
- `Subscription`: abonnement actif, expire ou suspendu.
- `Course`: cours collectif encadre.
- `Enrollment`: inscription membre/cours.
- `Attendance`: presence.
- `Payment`: transaction.
- `Recommendation`: programme IA genere.

## Securite

- Mots de passe hashes avec bcrypt.
- Sessions JWT limitees dans le temps.
- Middleware d'authentification sur les routes protegees.
- Controle d'acces par role.
- Helmet et CORS cote API.

## Module IA

Le module IA local applique des regles de recommandation:

- Detection de l'objectif: perte de poids, prise de masse, condition physique.
- Adaptation de la frequence selon la regularite des presences.
- Adaptation de l'intensite selon le niveau et le score de progression.
- Generation d'une semaine type avec exercices, duree, recuperation et conseils nutritionnels.
