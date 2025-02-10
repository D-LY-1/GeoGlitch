# GeoGlitch - Documentation Technique et Fonctionnelle 

# Demo prod

https://damien.leroy.caen.mds-project.fr/

## 1. Architecture de l'Application

### Client Web

#### Interface Utilisateur
La page principale affiche :
* Une carte interactive (via Leaflet) montrant la position des utilisateurs
* Une liste d'utilisateurs connectés

#### WebSocket et Signalisation
Le client établit une connexion WebSocket sécurisée (wss) avec le serveur pour :
* Enregistrer l'utilisateur
* Envoyer/recevoir les positions
* Gérer le WebRTC (échange offres/réponses/ICE)

#### WebRTC pour la Visioconférence
* Rejoindre une visioconférence globale
* Connexions peer-to-peer pour l'audio/vidéo

### Serveur Node.js

#### Express
* Sert les fichiers statiques
* API REST pour la liste des utilisateurs

#### WebSocket (ws)
* Gère les connexions entrantes
* Enregistre les utilisateurs 
* Relaye les mises à jour

#### User Service
* Singleton pour l'état des utilisateurs
* Gestion des utilisateurs actifs

## 2. Installation Locale

```bash
# Installation
npm install node-pre-gyp
npm install

# Démarrage
npm run start

# Accès
http://localhost:3000
```

## 3. Déploiement VPS

### Nginx & SSL
* Reverse proxy HTTP → HTTPS
* Certificats Let's Encrypt (Géré par Certbot)

### Réseau
* Port 443 public
* Port 3000 interne
* WSS pour WebSocket
* CSP configurée

### Configuration Nginx
```nginx
server {
   listen 443 ssl;
   server_name mondomaine.fr;

   ssl_certificate /etc/letsencrypt/live/mondomaine.fr/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/mondomaine.fr/privkey.pem;

   location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "Upgrade";
       proxy_set_header Host $host;
   }
}
```

## 4. Fonctionnalités

### Temps réel
* Position envoyée via WebSocket
* Mise à jour de la carte
* Fréquence de mise à jour : 5 secondes

### Visioconférence
* Connexions P2P via WebRTC
* Audio/vidéo configurable
* Non fonctionnel pour le moment (affichage caméra OK, multi-connexion en cours)

### Gestion des utilisateurs
* IDs uniques générés par UUID
* Service centralisé gardant l'état
* Déconnexion automatique après timeout

### Sécurité
* Communications chiffrées (HTTPS/WSS)
* Validation des données entrantes sur les serveurs