# Documentation outil : Nikto

## 1) Description de l’outil
**Nikto** est un scanner de vulnérabilités Web qui identifie les mauvaises configurations, fichiers sensibles exposés, composants obsolètes et faiblesses connues sur les serveurs HTTP/HTTPS.

## 2) Commandes utilisées lors des tests
**Cibles testées :**
- Frontend : `http://localhost:3000`
- Backend : `http://localhost:8000`

```bash
# Scan du frontend (port 3000) avec export
nikto -h http://localhost:3000 -Format txt -output docs/evidence/nikto-frontend-3000.txt

# Scan du backend (port 8000) avec export
nikto -h http://localhost:8000 -Format txt -output docs/evidence/nikto-backend-8000.txt
```

## 3) Preuves des résultats (sorties terminal)

**Preuves principales (fichiers texte) :**
- Frontend : [`docs/evidence/nikto-frontend-3000.txt`](evidence/nikto-frontend-3000.txt) (75 items détectés)
- Backend : [`docs/evidence/nikto-backend-8000.txt`](evidence/nikto-backend-8000.txt) (4 items détectés)

**Captures d'écran optionnelles :**
- `screenshots/nikto-01-frontend-3000.png` (à générer - voir [screenshots/README.md](screenshots/README.md))
- `screenshots/nikto-02-backend-8000.png` (à générer - voir [screenshots/README.md](screenshots/README.md))

### Résultats observés (synthèse)

**Frontend (port 3000) :**
- Serveur : aucune bannière retournée
- En-têtes de sécurité manquants : `X-Frame-Options`, `X-Content-Type-Options`
- Header inhabituel : `content-disposition: inline; filename="index.html"`
- 73 fichiers de backup/cert potentiellement intéressants détectés (probablement faux positifs)
- 2 références NextGEN Gallery LFI (faux positifs - contexte non WordPress)

**Backend (port 8000) :**
- Serveur : `uvicorn` (serveur ASGI Python)
- En-têtes de sécurité manquants : `X-Frame-Options`, `X-Content-Type-Options`
- Méthodes HTTP autorisées : `GET`
- 1 fichier suspect détecté : `#wp-config.php#` (faux positif - pas WordPress)

## 4) Analyse et explication détaillée des résultats

### Analyse détaillée Frontend (port 3000)

- **Constat 1 :** absence d'en-têtes de sécurité HTTP essentiels.
  - **Preuve :** `nikto-frontend-3000.txt` (X-Frame-Options, X-Content-Type-Options manquants).
  - **Cause probable :** configuration par défaut du serveur Web (pas de durcissement).
  - **Conséquence possible :** exposition au clickjacking, MIME sniffing, détournement de contenu.

- **Constat 2 :** 73 fichiers de backup/certificat « potentiellement intéressants ».
  - **Preuve :** `nikto-frontend-3000.txt` (liste exhaustive de fichiers .tar, .pem, .jks, etc.).
  - **Interprétation :** très probablement des **faux positifs** (scan bruteforce standard de Nikto sur SPA).
  - **Conséquence possible :** si les fichiers existaient réellement, fuite de données sensibles.

- **Constat 3 :** header `content-disposition` inhabituel exposé.
  - **Preuve :** `nikto-frontend-3000.txt`.
  - **Cause probable :** réponse inline du serveur pour fichier `index.html`.
  - **Conséquence possible :** divulgation mineure d'information sur l'architecture de fichiers.

### Analyse détaillée Backend (port 8000)

- **Constat 1 :** identification du serveur `uvicorn` (framework ASGI Python).
  - **Preuve :** `nikto-backend-8000.txt` (bannière `Server: uvicorn`).
  - **Cause probable :** bannière serveur non masquée.
  - **Conséquence possible :** facilite la reconnaissance technique pour un attaquant (choix d'exploits ciblés Python/ASGI).

- **Constat 2 :** absence d'en-têtes de sécurité HTTP.
  - **Preuve :** `nikto-backend-8000.txt` (X-Frame-Options, X-Content-Type-Options manquants).
  - **Cause probable :** configuration backend par défaut sans middleware de sécurité.
  - **Conséquence possible :** exposition au clickjacking (si pages HTML servies), MIME sniffing.

- **Constat 3 :** méthode HTTP GET autorisée uniquement.
  - **Preuve :** `nikto-backend-8000.txt` (`OPTIONS: Allowed HTTP Methods: GET`).
  - **Interprétation :** restrictif, bon signe de surface d'attaque limitée.

- **Constat 4 :** détection fichier `#wp-config.php#`.
  - **Preuve :** `nikto-backend-8000.txt`.
  - **Interprétation :** **faux positif** (backend ASGI Python, pas WordPress).

## 5) Vulnérabilités détectées
| ID | Vulnérabilité | Actif concerné | Preuve | Gravité technique |
|---|---|---|---|---|
| NIKTO-01 | Absence X-Frame-Options | Frontend (3000) + Backend (8000) | `nikto-frontend-3000.txt`, `nikto-backend-8000.txt` | Moyenne |
| NIKTO-02 | Absence X-Content-Type-Options | Frontend (3000) + Backend (8000) | `nikto-frontend-3000.txt`, `nikto-backend-8000.txt` | Moyenne |
| NIKTO-03 | Bannière serveur exposée (uvicorn) | Backend (8000) | `nikto-backend-8000.txt` | Faible |
| NIKTO-04 | Header inhabituel content-disposition | Frontend (3000) | `nikto-frontend-3000.txt` | Faible |

## 6) Évaluation des risques en cybersécurité
| ID | Scénario de risque | Probabilité (1-5) | Impact (1-5) | Score (P×I) | Niveau |
|---|---|---:|---:|---:|---|
| NIKTO-01 | Attaque clickjacking via absence X-Frame-Options sur frontend/backend | 3 | 2 | 6 | Faible |
| NIKTO-02 | MIME sniffing et détournement de contenu via absence X-Content-Type-Options | 3 | 2 | 6 | Faible |
| NIKTO-03 | Reconnaissance technique facilitée par bannière uvicorn exposée | 5 | 2 | 10 | Modéré |
| NIKTO-04 | Divulgation mineure structure fichiers via header content-disposition | 2 | 1 | 2 | Négligeable |

**Justification :**
- `NIKTO-01/02` : absence d'en-têtes de sécurité courante en dev, impact réel dépend du contexte d'usage (API vs pages HTML).
- `NIKTO-03` : très probable lors reconnaissance, impact direct faible mais facilite attaque ciblée.
- `NIKTO-04` : risque négligeable, information non critique.

## 7) Recommandations de réduction/correction

### Priorité haute
1. **Ajouter les en-têtes de sécurité HTTP** (frontend + backend) :
   - `X-Frame-Options: DENY` ou `SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Content-Security-Policy` (CSP adaptée au contexte)
   - `Strict-Transport-Security` si HTTPS activé

2. **Masquer la bannière serveur backend** :
   - Configurer Uvicorn pour ne pas exposer `Server: uvicorn`
   - Utiliser reverse proxy (Nginx/Apache) avec `server_tokens off`

### Priorité moyenne
3. **Déployer un reverse proxy durci** devant les applications :
   - Centraliser les en-têtes de sécurité
   - Filtrer les requêtes malveillantes
   - Masquer l'architecture interne

4. **Valider l'absence réelle des fichiers de backup détectés** :
   - Vérifier manuellement si `.tar`, `.pem`, `.jks` existent
   - Si présents, les supprimer ou restreindre l'accès

### Priorité faible
5. **Réduire la verbosité des headers HTTP** :
   - Supprimer headers non essentiels (`content-disposition` si inutile)

### Surveillance continue
6. **Intégrer Nikto dans pipeline CI/CD** :
   - Scan automatique pré-déploiement
   - Baseline des résultats acceptables
   - Alerte sur nouvelle vulnérabilité détectée

## Journal de test
- **Date :** 06/03/2026
- **Analyste :** GitHub Copilot (assistance)
- **Périmètre :** Frontend `localhost:3000` + Backend `localhost:8000`
- **Remarques :** Majorité des fichiers de backup détectés sont probablement des faux positifs (bruteforce standard Nikto). Focus principal : absence en-têtes sécurité + bannière serveur exposée.
