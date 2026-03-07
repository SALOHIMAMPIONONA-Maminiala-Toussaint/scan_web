═══════════════════════════════════════════════════════════════════════════════
                          DOCUMENTATION OUTIL : SQLMAP
═══════════════════════════════════════════════════════════════════════════════

Outil : sqlmap v1.10.2
Date d'analyse : 06 mars 2026
Cibles : localhost:3000 (Frontend) + localhost:8000 (Backend)

───────────────────────────────────────────────────────────────────────────────


1️⃣ DESCRIPTION DE L'OUTIL
───────────────────────────────────────────────────────────────────────────────

sqlmap est un outil open source d'automatisation de détection et d'exploitation
de failles d'injection SQL, considéré comme la référence mondiale dans ce domaine.

Principales fonctionnalités :
  • Détection automatique de vulnérabilités SQL injection
  • Support de multiples SGBD (MySQL, PostgreSQL, Oracle, MSSQL, SQLite, etc.)
  • Techniques d'injection variées (UNION, Boolean-based, Time-based, Error-based)
  • Exploitation complète : extraction de données, shell système, élévation privilèges
  • Contournement de WAF et systèmes de protection
  • Support requêtes GET, POST, Cookie, Header personnalisés
  • Module de crawling automatique pour découverte de paramètres


2️⃣ COMMANDES UTILISÉES LORS DES TESTS
───────────────────────────────────────────────────────────────────────────────

CIBLES TESTÉES :
  → Frontend : http://localhost:3000/
  → Backend  : http://localhost:8000/

PARAMÈTRES COMMUNS :
  --batch          : Mode non-interactif (réponses par défaut)
  --level=1        : Niveau de test (1=basique, 5=exhaustif)
  --risk=1         : Niveau de risque (1=sûr, 3=agressif)
  --threads=1      : Nombre de threads (1=conservateur)

SCANS BACKEND :

  sqlmap -u "http://localhost:8000/" --batch --level=1 --risk=1 --threads=1
    ↳ Test du backend racine (endpoint /)
    ↳ Fichier preuve : docs/evidence/sqlmap-backend-root.txt

  sqlmap -u "http://localhost:8000/etudiants/1" --batch --level=1 --risk=1 --threads=1
    ↳ Test endpoint protégé /etudiants/{id}
    ↳ Fichier preuve : docs/evidence/sqlmap-backend-etudiants-id.txt

SCANS FRONTEND :

  sqlmap -u "http://localhost:3000/" --batch --level=1 --risk=1 --threads=1
    ↳ Test du frontend racine
    ↳ Fichier preuve : docs/evidence/sqlmap-frontend-root.txt

  sqlmap -u "http://localhost:3000/" --batch --crawl=2 --level=1 --risk=1 --threads=1
    ↳ Crawl automatique (profondeur 2) pour découvrir paramètres
    ↳ Fichier preuve : docs/evidence/sqlmap-frontend-crawl.txt


3️⃣ PREUVES DES RÉSULTATS (SORTIES TERMINAL)
───────────────────────────────────────────────────────────────────────────────

PREUVES PRINCIPALES (fichiers texte) :
  • docs/evidence/sqlmap-backend-root.txt
  • docs/evidence/sqlmap-backend-etudiants-id.txt
  • docs/evidence/sqlmap-frontend-root.txt
  • docs/evidence/sqlmap-frontend-crawl.txt

CAPTURES D'ÉCRAN OPTIONNELLES :
  • screenshots/sqlmap-01-backend.png (à générer)
  • screenshots/sqlmap-02-frontend.png (à générer)


SYNTHÈSE DES RÉSULTATS PAR CIBLE :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BACKEND (port 8000)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Endpoint /
    Résultat : Aucun paramètre injectable détecté
    Raison   : Réponse JSON statique sans paramètres dynamiques
    Statut   : ✅ AUCUNE INJECTION SQL

  Endpoint /etudiants/1
    Résultat : ⛔ AUTHENTIFICATION REQUISE (401 Unauthorized)
    Raison   : Protection par authentification sur endpoints sensibles
    Statut   : ✅ TEST BLOQUÉ (bonne pratique de sécurité)

  ✅ CONCLUSION BACKEND : Aucune injection SQL détectée sur endpoints publics.
                          Protection par authentification en place.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 FRONTEND (port 3000)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Endpoint /
    Résultat : Aucun paramètre GET détecté
    Raison   : Application SPA (Single Page Application)
    Statut   : ✅ AUCUNE INJECTION SQL

  Crawl (profondeur 2)
    Résultat : AUCUN lien avec paramètres GET trouvé
    Raison   : Architecture frontend moderne sans paramètres URL traditionnels
    Statut   : ✅ AUCUNE INJECTION SQL

  ✅ CONCLUSION FRONTEND : Aucune injection SQL détectée. Architecture SPA
                           sans paramètres URL manipulables.


4️⃣ ANALYSE ET EXPLICATION DÉTAILLÉE DES RÉSULTATS
───────────────────────────────────────────────────────────────────────────────

ANALYSE BACKEND (port 8000)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONSTAT 1 : Endpoint racine sans paramètre injectable

  Preuve : sqlmap-backend-root.txt
  Message sqlmap : "no parameter(s) found for testing"
  
  Cause :
    Réponse JSON statique sans paramètres dynamiques dans l'URL :
      GET http://localhost:8000/
      Response: {"message": "API is running"}
  
  Interprétation : ✅ POINT POSITIF
    Pas de surface d'attaque SQLi sur cet endpoint. Architecture API REST
    moderne typique : endpoints sans paramètres GET traditionnels.


CONSTAT 2 : Endpoints API protégés par authentification

  Preuve : sqlmap-backend-etudiants-id.txt
  Erreur : 401 Unauthorized
  
  Cause :
    Mise en place d'authentification (probablement JWT ou session) sur les
    endpoints sensibles manipulant des données.
  
  Interprétation : ✅ POINT POSITIF
    Protection en profondeur respectée. Limite drastiquement la surface
    d'attaque publique. sqlmap ne peut pas tester sans credentials valides.
  
  Conséquence :
    Pour un test complet, il faudrait :
      • Fournir token d'authentification valide
      • Utiliser --cookie ou --header avec credentials


CONSTAT 3 : Architecture API REST moderne (FastAPI/Uvicorn)

  Preuve : Documentation Swagger exposée (/docs), réponses JSON
  
  Technologies détectées :
    • Framework : FastAPI (Python)
    • Serveur : Uvicorn (ASGI)
    • Format : JSON exclusivement
  
  Implication sécurité :
    Ces frameworks modernes intègrent généralement des protections anti-SQLi
    par défaut :
      ✓ ORM (SQLAlchemy, Tortoise ORM) avec requêtes paramétrées
      ✓ Validation automatique avec Pydantic
      ✓ Échappement automatique des entrées
  
  Recommandation :
    Vérifier que le code utilise bien l'ORM et non des requêtes SQL brutes.


ANALYSE FRONTEND (port 3000)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONSTAT 1 : Application SPA (Single Page Application)

  Preuve : sqlmap-frontend-root.txt, sqlmap-frontend-crawl.txt
  Message sqlmap : "no parameter(s) found", "no usable links found"
  
  Cause :
    Architecture frontend moderne (probablement React/Vue/Angular) :
      • Aucun paramètre GET dans les URLs
      • Pas de formulaires HTML traditionnels
      • Communication backend via API REST (JSON)
  
  Exemple d'URL typique SPA :
    http://localhost:3000/           → Index principal
    http://localhost:3000/#/users    → Routing côté client (hash)
  
  Interprétation : ✅ POINT POSITIF
    Pas de paramètres GET manipulables côté client. Réduction naturelle de
    la surface d'attaque SQLi traditionnelle.


CONSTAT 2 : Aucun lien avec paramètres découvert par crawl

  Preuve : sqlmap-frontend-crawl.txt (profondeur 2)
  
  Interprétation :
    Le frontend communique avec le backend via :
      • API REST (requêtes AJAX/Fetch)
      • Format JSON (pas de paramètres URL)
      • Pas de liens HTML traditionnels avec ?param=value


CONCLUSION GÉNÉRALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ RÉSULTAT POSITIF : Aucune vulnérabilité d'injection SQL détectée par sqlmap
                      sur les cibles testées.

Cela indique :
  1. ✓ Absence de paramètres GET/POST publics exploitables
  2. ✓ Authentification efficace sur endpoints sensibles
  3. ✓ Architecture moderne probablement résistante aux injections SQL
  4. ✓ Bonnes pratiques de développement apparentes

⚠ LIMITES DU TEST :
  • Tests limités aux endpoints publics (pas de credentials fournis)
  • Niveau de test : 1 (basique) | Risk : 1 (conservateur)
  • Pas de test des requêtes POST/PUT/DELETE avec charges JSON
  • Pas de test des endpoints authentifiés

Un test plus approfondi nécessiterait :
  □ Authentification avec credentials valides (--cookie/--header)
  □ Niveau et risk supérieurs (--level=3 --risk=2)
  □ Tests manuels des charges JSON (--data)
  □ Code review pour vérifier utilisation ORM


5️⃣ VULNÉRABILITÉS DÉTECTÉES
───────────────────────────────────────────────────────────────────────────────

✅ AUCUNE VULNÉRABILITÉ D'INJECTION SQL DÉTECTÉE

- SQLMAP-INFO-01
  - Observation : Aucun paramètre injectable détecté (backend)
  - Actif concerné : Backend (8000)
  - Preuve : sqlmap-backend-root.txt
  - Statut : POSITIF

- SQLMAP-INFO-02
  - Observation : Endpoints protégés par authentification
  - Actif concerné : Backend (8000)
  - Preuve : sqlmap-backend-etudiants-id.txt
  - Statut : POSITIF

- SQLMAP-INFO-03
  - Observation : Aucun paramètre injectable détecté (frontend)
  - Actif concerné : Frontend (3000)
  - Preuve : sqlmap-frontend-*.txt
  - Statut : POSITIF

NOTE IMPORTANTE :
L'absence de détection ne garantit PAS l'absence absolue de vulnérabilités SQLi,
mais indique une surface d'attaque réduite et de bonnes pratiques apparentes.


6️⃣ ÉVALUATION DES RISQUES EN CYBERSÉCURITÉ
───────────────────────────────────────────────────────────────────────────────

✅ AUCUN RISQUE D'INJECTION SQL IMMÉDIAT IDENTIFIÉ

Cependant, voici les risques résiduels à considérer :

MATRICE DE RISQUES RÉSIDUELS :

- SQLMAP-R01
  - Scénario de risque résiduel : Injection SQL sur endpoints authentifiés (non testés sans credentials)
  - Probabilité : 2 (Peu probable)
  - Impact : 4 (Grave)
  - Score P×I : 8
  - Niveau : MODÉRÉ

- SQLMAP-R02
  - Scénario de risque résiduel : Injection SQL via requêtes POST/JSON (non testées)
  - Probabilité : 2 (Peu probable)
  - Impact : 4 (Grave)
  - Score P×I : 8
  - Niveau : MODÉRÉ

- SQLMAP-R03
  - Scénario de risque résiduel : Vulnérabilités SQLi de second ordre (non détectables par sqlmap)
  - Probabilité : 1 (Rare)
  - Impact : 3 (Modéré)
  - Score P×I : 3
  - Niveau : FAIBLE

JUSTIFICATION DES SCORES :

  SQLMAP-R01 (Score 8 - Modéré) :
    Probabilité faible (2/5) car architecture moderne utilise probablement ORM.
    Impact élevé (4/5) si présente : accès non autorisé aux données, modification
    ou suppression de données sensibles. Endpoints authentifiés manipulent
    généralement des données critiques (étudiants, notes, etc.).

  SQLMAP-R02 (Score 8 - Modéré) :
    APIs REST modernes parfois vulnérables via charges JSON mal validées.
    Probabilité faible (2/5) avec frameworks modernes validant les types.
    Impact élevé (4/5) : exploitation possible via requêtes POST/PUT/DELETE.

  SQLMAP-R03 (Score 3 - Faible) :
    Vulnérabilités SQLi de second ordre (stored SQLi) très rares.
    Nécessite analyse manuelle du code. Probabilité très faible (1/5).


✅ RÉSULTAT GLOBAL : Niveau de risque SQLi actuel : FAIBLE
                    (aucune vulnérabilité détectée sur surface publique)


7️⃣ RECOMMANDATIONS DE RÉDUCTION/CORRECTION
───────────────────────────────────────────────────────────────────────────────

PRIORITÉ HAUTE (Maintien des bonnes pratiques) :

  1. Continuer l'utilisation de requêtes paramétrées/ORM
  
     ✓ Vérifier que TOUTES les requêtes SQL utilisent des paramètres liés
     
     ✅ BON (utiliser) :
     ┌──────────────────────────────────────────────────────────────────┐
     │ # SQLAlchemy (ORM)                                               │
     │ user = db.query(User).filter(User.id == user_id).first()         │
     │                                                                  │
     │ # Requête paramétrée                                             │
     │ cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))   │
     └──────────────────────────────────────────────────────────────────┘
     
     ❌ MAUVAIS (éviter) :
     ┌──────────────────────────────────────────────────────────────────┐
     │ # Concaténation de chaînes (VULNÉRABLE!)                         │
     │ query = f"SELECT * FROM users WHERE id = {user_id}"              │
     │ cursor.execute(query)                                            │
     └──────────────────────────────────────────────────────────────────┘

  2. Maintenir l'authentification stricte
  
     □ Conserver les protections d'authentification sur endpoints sensibles
     □ Implémenter rate limiting contre bruteforce d'authentification
     □ Utiliser tokens avec expiration (JWT/session)


PRIORITÉ MOYENNE (Amélioration et tests complémentaires) :

  3. Tests approfondis complémentaires
  
     Exécuter sqlmap avec niveau et risk supérieurs :
     ┌──────────────────────────────────────────────────────────────────┐
     │ # Avec authentification (token JWT exemple)                      │
     │ sqlmap -u "http://localhost:8000/etudiants" \                    │
     │   --header="Authorization: Bearer TOKEN_ICI" \                   │
     │   --level=3 --risk=2 --batch                                     │
     │                                                                  │
     │ # Test requête POST avec JSON                                    │
     │ sqlmap -u "http://localhost:8000/api/search" \                   │
     │   --data='{"query":"test"}' \                                    │
     │   --level=2 --risk=2 --batch                                     │
     └──────────────────────────────────────────────────────────────────┘

  4. Validation stricte des entrées
  
     □ Valider types, formats et plages de valeurs côté backend
     □ Utiliser schemas Pydantic (FastAPI) pour validation automatique
     
     Exemple FastAPI :
     ┌──────────────────────────────────────────────────────────────────┐
     │ from pydantic import BaseModel, Field, validator                 │
     │                                                                  │
     │ class UserSearch(BaseModel):                                     │
     │     name: str = Field(..., min_length=1, max_length=100)         │
     │     age: int = Field(..., ge=0, le=150)                          │
     │                                                                  │
     │     @validator('name')                                           │
     │     def validate_name(cls, v):                                   │
     │         if not v.isalnum():                                      │
     │             raise ValueError('Name must be alphanumeric')        │
     │         return v                                                 │
     └──────────────────────────────────────────────────────────────────┘

  5. Principe du moindre privilège BDD
  
     □ Vérifier que le compte BDD utilisé par l'application a uniquement
       les privilèges nécessaires (SELECT, INSERT, UPDATE, DELETE)
     □ Interdire DROP, ALTER, CREATE sur compte applicatif
     □ Utiliser comptes BDD séparés par environnement (dev/staging/prod)


PRIORITÉ FAIBLE (Surveillance et amélioration continue) :

  6. Journalisation et monitoring
  
     □ Logger les requêtes BDD anormales :
         • Temps d'exécution inhabituellement long
         • Erreurs SQL fréquentes
         • Tentatives de requêtes suspectes
  
  7. WAF/IDS avec règles anti-SQLi
  
     □ Déployer ModSecurity ou équivalent
     □ Activer OWASP Core Rule Set (CRS)
     □ Surveiller et analyser les alertes

  8. Intégrer sqlmap dans CI/CD
  
     □ Scan automatique pré-déploiement
     □ Tests de régression SQLi
     □ Bloquer déploiement si vulnérabilité détectée


───────────────────────────────────────────────────────────────────────────────
JOURNAL DE TEST
───────────────────────────────────────────────────────────────────────────────

Date d'exécution : 06/03/2026

Périmètre        : Frontend localhost:3000 + Backend localhost:8000
                   (endpoints publics uniquement)

Remarques        : • Tests limités par authentification sur endpoints backend
                   • Architecture moderne (SPA + API REST) sans paramètres GET
                   • ✅ RÉSULTAT POSITIF : aucune injection SQL détectée
                   • Recommandation : compléter par tests authentifiés et tests
                     JSON/POST avec --level=3 --risk=2

Limitations      : • Niveau basique (--level=1 --risk=1)
                   • Pas de credentials fournis pour endpoints protégés
                   • Pas de test des requêtes POST/PUT/DELETE avec JSON
                   • Code review backend recommandé pour confirmation

───────────────────────────────────────────────────────────────────────────────
Fin du document sqlmap
───────────────────────────────────────────────────────────────────────────────