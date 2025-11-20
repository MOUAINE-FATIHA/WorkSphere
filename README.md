# WorkSphere - Gestion visuelle du personnel

## Contexte :
WorkSphere est une application web innovante dédiée à la gestion interactive du personnel au sein des espaces de travail.  
Elle permet de visualiser, organiser et répartir les employés sur un plan d’étage en temps réel, tout en respectant les rôles et zones autorisées.

## Objectifs
- Ajouter, déplacer et supprimer des employés directement depuis l’interface graphique.
- Garantir le respect des règles métier selon les rôles et zones.
- Fournir une expérience utilisateur fluide, intuitive et responsive.
- Centraliser la gestion des données du personnel et la visualisation spatiale.

## Fonctionnalités
- Liste des employés non assignés avec possibilité d’ajout d’un nouvel employé.
- Formulaire d’ajout avec Nom, Rôle, Photo, Email, Téléphone et expériences professionnelles.
- Prévisualisation des photos et validation des données avec REGEX .
- Plan d’étage interactif comprenant 6 zones avec restrictions par rôle :
  - Salle de conférence, Réception, Salle des serveurs, Salle de sécurité, Salle du personnel, Salle d’archives.
- Gestion des profils détaillés et déplacement des employés entre zones (Drag & Drop).
- Indication visuelle des zones vides et limitation du nombre d’employés par zone.
- Sauvegarde automatique de l’état dans le `localStorage`.
- Interface responsive.

## Technologies
- HTML
- CSS natif
- JavaScript

## Gestion de projet
- La planification des tâches via Trello / GitHub Projects.
- Versionnement avec GitHub.
