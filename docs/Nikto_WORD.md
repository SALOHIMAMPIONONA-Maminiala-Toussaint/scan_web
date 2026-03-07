═══════════════════════════════════════════════════════════════════════════════
                          DOCUMENTATION OUTIL : NIKTO
═══════════════════════════════════════════════════════════════════════════════

Outil : Nikto v2.5.0
Date d'analyse : 06 mars 2026
Cibles : localhost:3000 (Frontend) + localhost:8000 (Backend)

───────────────────────────────────────────────────────────────────────────────


1️⃣ DESCRIPTION DE L'OUTIL
───────────────────────────────────────────────────────────────────────────────

Nikto est un scanner de vulnérabilités Web open source largement utilisé pour 
identifier les faiblesses de sécurité sur les serveurs HTTP/HTTPS.

Principales fonctionnalités :
  • Détection de mauvaises configurations serveur
  • Identification de fichiers sensibles exposés (backups, configs, etc.)
  • Détection de composants obsolètes et vulnérables
  • Vérification des en-têtes de sécurité HTTP
  • Test de méthodes HTTP dangereuses
  • Base de données de +6700 vulnérabilités connues
  • Support multi-formats d'export (TXT, HTML, CSV, XML)


2️⃣ COMMANDES UTILISÉES LORS DES TESTS
───────────────────────────────────────────────────────────────────────────────

CIBLES TESTÉES :
  → Frontend : http://localhost:3000
  → Backend  : http://localhost:8000

SCANS EFFECTUÉS :

  nikto -h http://localhost:3000 -Format txt -output docs/evidence/nikto-frontend-3000.txt
    ↳ Scan complet du frontend (port 3000) avec export TXT

  nikto -h http://localhost:8000 -Format txt -output docs/evidence/nikto-backend-8000.txt
    ↳ Scan complet du backend (port 8000) avec export TXT


3️⃣ PREUVES DES RÉSULTATS (SORTIES TERMINAL)
───────────────────────────────────────────────────────────────────────────────

PREUVES PRINCIPALES (fichiers texte) :
  • docs/evidence/nikto-frontend-3000.txt (75 items détectés)
  • docs/evidence/nikto-backend-8000.txt (4 items détectés)

CAPTURES D'ÉCRAN OPTIONNELLES :
  • screenshots/nikto-01-frontend-3000.png (à générer)
  • screenshots/nikto-02-backend-8000.png (à générer)


SYNTHÈSE DES RÉSULTATS PAR CIBLE :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 FRONTEND (port 3000)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Serveur détecté      : Aucune bannière retournée
  En-têtes manquants   : X-Frame-Options, X-Content-Type-Options
  Header inhabituel    : content-disposition: inline; filename="index.html"
  Items détectés       : 75 (majoritairement faux positifs - fichiers backup)
  Références LFI       : 2 (NextGEN Gallery - faux positif, contexte non WordPress)

  ⚠ CONCLUSION : Architecture SPA moderne, majorité des alertes sont des
                 faux positifs (bruteforce standard Nikto). Principal problème :
                 absence d'en-têtes de sécurité HTTP.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BACKEND (port 8000)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Serveur détecté      : uvicorn (serveur ASGI Python) ⚠
  En-têtes manquants   : X-Frame-Options, X-Content-Type-Options
  Méthodes HTTP        : GET uniquement (restrictif ✓)
  Items détectés       : 4 dont 1 fichier suspect (#wp-config.php# - faux positif)

  ⚠ CONCLUSION : Bannière serveur exposée (facilite reconnaissance technique).
                 Absence d'en-têtes sécurité. Méthodes HTTP bien restreintes.


4️⃣ ANALYSE ET EXPLICATION DÉTAILLÉE DES RÉSULTATS
───────────────────────────────────────────────────────────────────────────────

ANALYSE FRONTEND (port 3000)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONSTAT 1 : Absence d'en-têtes de sécurité HTTP essentiels

  Preuve : nikto-frontend-3000.txt
  
  En-têtes manquants :
    • X-Frame-Options      → Protection contre clickjacking
    • X-Content-Type-Options → Protection contre MIME sniffing
  
  Cause probable :
    Configuration par défaut du serveur Web (pas de durcissement)
  
  Conséquence possible :
    ✗ Clickjacking : l'application peut être embarquée dans une iframe malveillante
    ✗ MIME Sniffing : le navigateur peut interpréter incorrectement les types MIME
    ✗ Détournement de contenu et attaques XSS facilitées


CONSTAT 2 : 73 fichiers de backup/certificat détectés

  Preuve : nikto-frontend-3000.txt (liste exhaustive de .tar, .pem, .jks, etc.)
  
  Interprétation : FAUX POSITIFS (très probablement)
  
  Explication :
    Nikto effectue un bruteforce standard de noms de fichiers communs. Dans
    le contexte d'une SPA (Single Page Application), ces fichiers n'existent
    généralement pas. Cependant, une vérification manuelle reste recommandée.
  
  Si les fichiers existaient réellement :
    ✗ CRITIQUE : fuite de données sensibles (certificats, archives, configs)
    ✗ Accès aux sources, credentials, clés privées


CONSTAT 3 : Header content-disposition inhabituel

  Preuve : nikto-frontend-3000.txt
  Valeur : content-disposition: inline; filename="index.html"
  
  Cause probable :
    Réponse inline du serveur pour fichier index.html
  
  Conséquence :
    Divulgation mineure d'information sur l'architecture de fichiers (impact faible)


ANALYSE BACKEND (port 8000)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONSTAT 1 : Identification du serveur "uvicorn" (framework ASGI Python)

  Preuve : nikto-backend-8000.txt (bannière Server: uvicorn)
  
  Cause probable :
    Bannière serveur non masquée (configuration par défaut)
  
  Conséquence :
    Facilite la reconnaissance technique pour un attaquant. Un attaquant peut :
      • Identifier le stack technique (Python/ASGI/FastAPI probable)
      • Rechercher exploits ciblés pour Uvicorn/FastAPI
      • Adapter ses techniques d'attaque au framework détecté


CONSTAT 2 : Absence d'en-têtes de sécurité HTTP

  Preuve : nikto-backend-8000.txt
  
  Même problématique que frontend (voir CONSTAT 1 Frontend)
  Impact potentiellement réduit si backend sert uniquement API JSON (pas HTML)


CONSTAT 3 : Méthode HTTP GET autorisée uniquement

  Preuve : nikto-backend-8000.txt (OPTIONS: Allowed HTTP Methods: GET)
  
  Interprétation : POINT POSITIF ✓
  
  Explication :
    Restriction des méthodes HTTP indique une surface d'attaque limitée.
    Cependant, cela peut être un résultat incomplet du scan (méthodes POST/PUT
    potentiellement protégées par authentification non testées par Nikto).


CONSTAT 4 : Détection fichier #wp-config.php#

  Preuve : nikto-backend-8000.txt
  
  Interprétation : FAUX POSITIF
  
  Explication :
    Backend ASGI Python, aucun lien avec WordPress. Détection standard Nikto.


5️⃣ VULNÉRABILITÉS DÉTECTÉES
───────────────────────────────────────────────────────────────────────────────

- NIKTO-01
  - Vulnérabilité : Absence X-Frame-Options
  - Actif concerné : Frontend (3000) + Backend (8000)
  - Preuve : nikto-frontend-*.txt, nikto-backend-*.txt
  - Gravité technique : MOYENNE

- NIKTO-02
  - Vulnérabilité : Absence X-Content-Type-Options
  - Actif concerné : Frontend (3000) + Backend (8000)
  - Preuve : nikto-frontend-*.txt, nikto-backend-*.txt
  - Gravité technique : MOYENNE

- NIKTO-03
  - Vulnérabilité : Bannière serveur exposée (uvicorn)
  - Actif concerné : Backend (8000)
  - Preuve : nikto-backend-*.txt
  - Gravité technique : FAIBLE

- NIKTO-04
  - Vulnérabilité : Header content-disposition inhabituel
  - Actif concerné : Frontend (3000)
  - Preuve : nikto-frontend-*.txt
  - Gravité technique : FAIBLE


6️⃣ ÉVALUATION DES RISQUES EN CYBERSÉCURITÉ
───────────────────────────────────────────────────────────────────────────────

MATRICE DE RISQUES :

- NIKTO-01
  - Scénario de risque : Attaque clickjacking via absence X-Frame-Options sur frontend/backend
  - Probabilité : 3 (Possible)
  - Impact : 2 (Mineur)
  - Score P×I : 6
  - Niveau : FAIBLE

- NIKTO-02
  - Scénario de risque : MIME sniffing et détournement de contenu via absence X-Content-Type
  - Probabilité : 3 (Possible)
  - Impact : 2 (Mineur)
  - Score P×I : 6
  - Niveau : FAIBLE

- NIKTO-03
  - Scénario de risque : Reconnaissance technique facilitée par bannière uvicorn exposée
  - Probabilité : 5 (Très probable)
  - Impact : 2 (Mineur)
  - Score P×I : 10
  - Niveau : MODÉRÉ

- NIKTO-04
  - Scénario de risque : Divulgation mineure structure fichiers via header content-disposition
  - Probabilité : 2 (Peu probable)
  - Impact : 1 (Négligeable)
  - Score P×I : 2
  - Niveau : NÉGLIGEABLE

JUSTIFICATION DES SCORES :

  NIKTO-01 & NIKTO-02 (Score 6 - Faible) :
    Absence d'en-têtes de sécurité courante en développement. Impact réel
    dépend du contexte d'usage :
      • Si API JSON pure → impact réduit (pas de rendu HTML)
      • Si pages HTML servies → clickjacking et MIME sniffing possibles
    Probabilité moyenne (3/5) car exploitation nécessite contexte spécifique.

  NIKTO-03 (Score 10 - Modéré) :
    Très probable lors de la reconnaissance (5/5) car bannière accessible à
    tout scanner. Impact direct faible (2/5) mais facilite attaque ciblée
    ultérieure (sélection d'exploits spécifiques Uvicorn/FastAPI).

  NIKTO-04 (Score 2 - Négligeable) :
    Risque minimal. Information non critique, exploitation improbable.


7️⃣ RECOMMANDATIONS DE RÉDUCTION/CORRECTION
───────────────────────────────────────────────────────────────────────────────

PRIORITÉ HAUTE (Action immédiate) :

  1. Ajouter les en-têtes de sécurité HTTP (frontend + backend)
  
     Pour Nginx (reverse proxy) :
     ┌─────────────────────────────────────────────────────────────────────┐
     │ add_header X-Frame-Options "DENY" always;                           │
     │ add_header X-Content-Type-Options "nosniff" always;                 │
     │ add_header Content-Security-Policy "default-src 'self'" always;     │
     │ add_header Strict-Transport-Security "max-age=31536000" always;     │
     └─────────────────────────────────────────────────────────────────────┘
     
     Pour FastAPI (backend Python) :
     ┌─────────────────────────────────────────────────────────────────────┐
     │ from fastapi.middleware.trustedhost import TrustedHostMiddleware    │
     │ from starlette.middleware.base import BaseHTTPMiddleware            │
     │                                                                     │
     │ @app.middleware("http")                                             │
     │ async def add_security_headers(request, call_next):                 │
     │     response = await call_next(request)                             │
     │     response.headers["X-Frame-Options"] = "DENY"                    │
     │     response.headers["X-Content-Type-Options"] = "nosniff"          │
     │     return response                                                 │
     └─────────────────────────────────────────────────────────────────────┘

  2. Masquer la bannière serveur backend
  
     Pour Uvicorn :
     ┌─────────────────────────────────────────────────────────────────────┐
     │ uvicorn main:app --host 0.0.0.0 --port 8000 --server-header false   │
     └─────────────────────────────────────────────────────────────────────┘
     
     Pour Nginx (reverse proxy) :
     ┌─────────────────────────────────────────────────────────────────────┐
     │ server_tokens off;                                                  │
     │ proxy_hide_header X-Powered-By;                                     │
     │ proxy_hide_header Server;                                           │
     └─────────────────────────────────────────────────────────────────────┘


PRIORITÉ MOYENNE (Planification à 30 jours) :

  3. Déployer un reverse proxy durci devant les applications
  
     Avantages :
       • Centralisation des en-têtes de sécurité
       • Filtrage des requêtes malveillantes
       • Masquage de l'architecture interne
       • Gestion SSL/TLS centralisée
       • Rate limiting et protection DDoS

  4. Valider l'absence réelle des fichiers de backup détectés
  
     Commandes de vérification :
     ┌─────────────────────────────────────────────────────────────────────┐
     │ find . -name "*.tar" -o -name "*.tar.gz" -o -name "*.pem"           │
     │ find . -name "*.jks" -o -name "*.key" -o -name "*backup*"           │
     └─────────────────────────────────────────────────────────────────────┘
     
     Si présents : les supprimer immédiatement ou restreindre l'accès


PRIORITÉ FAIBLE (Amélioration continue) :

  5. Réduire la verbosité des headers HTTP
     □ Supprimer headers non essentiels (content-disposition si inutile)
     □ Minimiser les métadonnées exposées

  6. Intégrer Nikto dans pipeline CI/CD
     □ Scan automatique pré-déploiement
     □ Baseline des résultats acceptables
     □ Alerte sur nouvelle vulnérabilité détectée
     □ Blocage du déploiement si vuln CRITICAL
