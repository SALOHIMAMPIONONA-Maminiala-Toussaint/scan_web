# Documentation outil : sqlmap

## 1) Description de l’outil
**sqlmap** est un outil d’automatisation de détection et d’exploitation de failles d’injection SQL. Il permet d’identifier des paramètres vulnérables, d’évaluer l’impact et de démontrer la compromission potentielle de données.

## 2) Commandes utilisées lors des tests
**Cibles testées :**
- Frontend : `http://localhost:3000/`
- Backend : `http://localhost:8000/`

```bash
# Test du backend racine
sqlmap -u "http://localhost:8000/" --batch --level=1 --risk=1 --threads=1

# Test du backend endpoint protégé (etudiants)
sqlmap -u "http://localhost:8000/etudiants/1" --batch --level=1 --risk=1 --threads=1

# Test du frontend racine
sqlmap -u "http://localhost:3000/" --batch --level=1 --risk=1 --threads=1

# Crawl du frontend pour découvrir paramètres
sqlmap -u "http://localhost:3000/" --batch --crawl=2 --level=1 --risk=1 --threads=1
```

## 3) Preuves des résultats (sorties terminal)

**Preuves principales (fichiers texte) :**
- Backend racine : [`docs/evidence/sqlmap-backend-root.txt`](evidence/sqlmap-backend-root.txt)
- Backend endpoint protégé : [`docs/evidence/sqlmap-backend-etudiants-id.txt`](evidence/sqlmap-backend-etudiants-id.txt)
- Frontend racine : [`docs/evidence/sqlmap-frontend-root.txt`](evidence/sqlmap-frontend-root.txt)
- Frontend crawl : [`docs/evidence/sqlmap-frontend-crawl.txt`](evidence/sqlmap-frontend-crawl.txt)

**Captures d'écran optionnelles :**
- `screenshots/sqlmap-01-backend.png` (à générer - voir [screenshots/README.md](screenshots/README.md))
- `screenshots/sqlmap-02-frontend.png` (à générer)

### Résultats observés (synthèse)

**Backend (port 8000) :**
- Endpoint `/` : Aucun paramètre injectable détecté (réponse JSON statique)
- Endpoint `/etudiants/1` : **Authentification requise (401 Unauthorized)** - test bloqué
- Conclusion : **Aucune injection SQL détectée sur les endpoints publics**

**Frontend (port 3000) :**
- Endpoint `/` : Aucun paramètre GET détecté (application SPA)
- Crawl (profondeur 2) : **Aucun lien avec paramètres GET trouvé**
- Conclusion : **Aucune injection SQL détectée** (architecture SPA sans paramètres URL côté client)

## 4) Analyse et explication détaillée des résultats

### Analyse Backend (port 8000)

- **Constat 1 :** endpoint racine sans paramètre injectable.
	- **Preuve :** `sqlmap-backend-root.txt` (message : "no parameter(s) found for testing").
	- **Cause :** réponse JSON statique sans paramètres dynamiques dans l'URL.
	- **Interprétation :** **Point positif** - pas de surface d'attaque SQLi sur cet endpoint.

- **Constat 2 :** endpoints API protégés par authentification.
	- **Preuve :** `sqlmap-backend-etudiants-id.txt` (erreur 401 Unauthorized).
	- **Cause :** mise en place d'authentification sur les endpoints sensibles.
	- **Interprétation :** **Point positif** - protection en profondeur, limite la surface d'attaque publique.
	- **Conséquence :** sqlmap ne peut pas tester sans credentials valides.

- **Constat 3 :** architecture API REST moderne (FastAPI/Uvicorn).
	- **Preuve :** documentation Swagger exposée (`/docs`), réponses JSON.
	- **Cause probable :** framework Python moderne utilisant ORM ou requêtes paramétrées.
	- **Interprétation :** ces frameworks intègrent généralement des protections anti-SQLi par défaut.

### Analyse Frontend (port 3000)

- **Constat 1 :** application SPA (Single Page Application).
	- **Preuve :** `sqlmap-frontend-root.txt`, `sqlmap-frontend-crawl.txt` (aucun paramètre GET détecté).
	- **Cause :** architecture frontend moderne (React/Vue/Angular probable) sans paramètres URL traditionnels.
	- **Interprétation :** **Point positif** - pas de paramètres GET manipulables côté client.

- **Constat 2 :** aucun lien avec paramètres découvert par crawl.
	- **Preuve :** `sqlmap-frontend-crawl.txt` ("no usable links found").
	- **Interprétation :** le frontend communique probablement avec le backend via API REST (JSON), pas via paramètres URL.

### Conclusion générale

**Résultat POSITIF :** Aucune vulnérabilité d'injection SQL détectée par sqlmap sur les cibles testées. Cela indique :
1. Absence de paramètres GET/POST publics exploitables
2. Authentification efficace sur endpoints sensibles
3. Architecture moderne probablement résistante aux injections SQL

**Limites du test :**
- Tests limités aux endpoints publics (pas de credentials fournis)
- Niveau de test : 1 (basique), Risk : 1 (conservateur)
- Un test plus approfondi nécessiterait : authentification, niveau/risk supérieurs, tests POST/JSON

## 5) Vulnérabilités détectées

**Aucune vulnérabilité d'injection SQL détectée.**

| ID | Observation | Actif concerné | Preuve | Statut |
|---|---|---|---|---|
| SQLMAP-INFO-01 | Aucun paramètre injectable détecté (backend) | Backend (8000) | `sqlmap-backend-root.txt` | ✅ Point positif |
| SQLMAP-INFO-02 | Endpoints protégés par authentification | Backend (8000) | `sqlmap-backend-etudiants-id.txt` | ✅ Point positif |
| SQLMAP-INFO-03 | Aucun paramètre injectable détecté (frontend) | Frontend (3000) | `sqlmap-frontend-root.txt`, `sqlmap-frontend-crawl.txt` | ✅ Point positif |

**Note :** L'absence de détection ne garantit pas l'absence absolue de vulnérabilités SQLi, mais indique une surface d'attaque réduite et de bonnes pratiques apparentes.

## 6) Évaluation des risques en cybersécurité

**Aucun risque d'injection SQL immédiat identifié.**

Cependant, voici les risques résiduels à considérer :

| ID | Scénario de risque résiduel | Probabilité (1-5) | Impact (1-5) | Score (P×I) | Niveau |
|---|---|---:|---:|---:|---|
| SQLMAP-R01 | Injection SQL sur endpoints authentifiés (non testés) | 2 | 4 | 8 | Modéré |
| SQLMAP-R02 | Injection SQL via requêtes POST/JSON (non testées) | 2 | 4 | 8 | Modéré |
| SQLMAP-R03 | Vulnérabilités SQLi de second ordre (non détectables par sqlmap) | 1 | 3 | 3 | Faible |

**Justification :**
- `SQLMAP-R01` : Probabilité faible (architecture moderne), mais impact élevé si présente sur endpoints sensibles.
- `SQLMAP-R02` : APIs REST modernes souvent vulnérables via charges JSON mal validées.
- `SQLMAP-R03` : Très rare, nécessite analyse manuelle du code.

**Résultat global :** ✅ **Niveau de risque SQLi actuel : FAIBLE** (aucune vulnérabilité détectée sur surface publique)

## 7) Recommandations de réduction/correction

### Recommandations pour maintenir la posture de sécurité actuelle

Bien qu'aucune vulnérabilité SQLi n'ait été détectée, il est essentiel de maintenir les bonnes pratiques :

#### Priorité haute (maintien)
1. **Continuer l'utilisation de requêtes paramétrées/ORM** :
	- Vérifier que TOUTES les requêtes SQL utilisent des paramètres liés (prepared statements)
	- Éviter la concaténation de chaînes pour construire des requêtes SQL

2. **Maintenir l'authentification stricte** :
	- Conserver les protections d'authentification sur endpoints sensibles
	- Implémenter rate limiting contre bruteforce d'authentification

#### Priorité moyenne (amélioration)
3. **Tests approfondis complémentaires** :
	- Exécuter sqlmap avec `--level=3 --risk=2` sur endpoints authentifiés (avec credentials test)
	- Tester les requêtes POST/PUT/DELETE avec charges JSON

4. **Validation stricte des entrées** :
	- Valider types, formats et plages de valeurs côté backend
	- Utiliser schemas Pydantic (FastAPI) ou équivalent pour validation automatique

5. **Principe du moindre privilège BDD** :
	- Vérifier que le compte BDD utilisé par l'application a uniquement les privilèges nécessaires
	- Interdire DROP, ALTER, CREATE sur compte applicatif

#### Priorité faible (surveillance)
6. **Journalisation et monitoring** :
	- Logger les requêtes BDD anormales (temps d'exécution long, erreurs SQL)

7. **WAF/IDS** :
	- Déployer un WAF avec règles anti-SQLi

8. **Intégrer sqlmap dans CI/CD** :
	- Scan automatique pré-déploiement

## Journal de test
- **Date :** 06/03/2026
- **Analyste :** GitHub Copilot (assistance)
- **Périmètre :** Frontend `localhost:3000` + Backend `localhost:8000` (endpoints publics uniquement)
- **Remarques :** 
	- Tests limités par authentification sur endpoints backend sensibles
	- Architecture moderne (SPA + API REST) sans paramètres GET traditionnels
	- **Résultat positif : aucune injection SQL détectée**
	- Recommandation : compléter par tests authentifiés et tests JSON/POST
