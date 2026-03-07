# Documentation outil : Trivy

## 1) Description de l’outil
**Trivy** est un scanner de sécurité pour les images conteneur, systèmes de fichiers, dépôts Git et configurations IaC. Il détecte principalement les vulnérabilités (CVE), secrets exposés et mauvaises configurations.

## 2) Commandes utilisées lors des tests
**Cible testée :** Projet local `/home/mampionona/Documents/Projet/Analyse_risque`

```bash
# Scan filesystem avec filtre sévérité HIGH/CRITICAL
trivy fs --severity HIGH,CRITICAL .

# Scan de détection de secrets exposés
trivy fs --scanners secret .
```

**Note technique :** Le scan de vulnérabilités (filesystem HIGH/CRITICAL) a rencontré un timeout lors du téléchargement de la base de données de vulnérabilités (87 MB). Ce problème est courant sur les connexions lentes et ne reflète pas un problème de sécurité du projet.

## 3) Preuves des résultats (sorties terminal)

**Preuves principales (fichiers texte) :**
- Scan secrets : [`docs/evidence/trivy-secret-project.txt`](evidence/trivy-secret-project.txt)
- Tentative scan filesystem : [`docs/evidence/trivy-fs-project.txt`](evidence/trivy-fs-project.txt) (timeout)
- Tentative scan image frontend : [`docs/evidence/trivy-image-frontend.txt`](evidence/trivy-image-frontend.txt) (timeout)
- Tentative scan image backend : [`docs/evidence/trivy-image-backend.txt`](evidence/trivy-image-backend.txt) (timeout)
- Tentative scan image postgres : [`docs/evidence/trivy-image-postgres.txt`](evidence/trivy-image-postgres.txt) (timeout)

**Captures d'écran optionnelles :**
- `screenshots/trivy-01-scan-secrets.png` (à générer - voir [screenshots/README.md](screenshots/README.md))

### Résultats observés (synthèse)

**Scan de secrets :**
- **Résultat : AUCUN secret détecté** ✅
- Aucun fichier contenant credentials, tokens, clés API, mots de passe hardcodés
- Rapport propre sans finding

**Scans de vulnérabilités CVE (tous échoués) :**

| Cible | Type | Statut | Erreur |
|-------|------|--------|--------|
| Projet filesystem | `trivy fs` | ❌ Timeout | Échec téléchargement DB (87 MB) |
| Image frontend | `trivy image` | ❌ Timeout | Échec téléchargement DB (87 MB) |
| Image backend | `trivy image` | ❌ Timeout | Échec téléchargement DB (87 MB) |
| Image postgres:15-alpine | `trivy image` | ❌ Timeout | Timeout analyse (DB téléchargée partiellement) |

- **Raison commune :** connexion réseau limitée (~150 KB/s), timeout par défaut de Trivy dépassé
- **Impact :** aucune évaluation CVE disponible sur les dépendances et images Docker

## 4) Analyse et explication détaillée des résultats

### Analyse scan de secrets

- **Constat 1 :** aucun secret détecté dans le projet.
  - **Preuve :** `trivy-secret-project.txt` (message : "No issues detected").
  - **Cause :** bonnes pratiques de développement, pas de credentials hardcodés dans le code source.
  - **Interprétation :** **Point positif** - conformité aux pratiques de sécurité concernant la gestion des secrets.

- **Constat 2 :** scanner de secrets a analysé l'ensemble du projet sans exception.
  - **Preuve :** sortie Trivy sans erreur, scan complété.
  - **Interprétation :** tous les fichiers ont été vérifiés (code, config, documentation).

### Analyse scan de vulnérabilités (filesystem)

- **Constat 1 :** scan filesystem non complété en raison d'un timeout réseau.
  - **Preuve :** `trivy-fs-project.txt` (erreur: "context deadline exceeded").
  - **Cause technique :** téléchargement de la base de vulnérabilités (87 MB) interrompu par timeout (~47% complété).
  - **Conséquence :** absence de détection CVE sur les dépendances du projet.

### Analyse scans de vulnérabilités (images Docker)

- **Architecture identifiée :** Le projet utilise 3 images Docker en production.
  1. `gestion-presence-empreinte-frontend:latest` (port 3000)
  2. `gestion-presence-empreinte-backend:latest` (port 8000)
  3. `postgres:15-alpine` (base de données)

- **Constat 2 :** tous les scans d'images Docker ont échoué (timeout).
  - **Preuves :** fichiers `trivy-image-frontend.txt`, `trivy-image-backend.txt`, `trivy-image-postgres.txt`.
  - **Erreur commune :** "context deadline exceeded" lors du téléchargement DB.
  - **Détails techniques :**
    - Image frontend : échec téléchargement DB à ~47% (41.48 MB / 87.09 MB)
    - Image backend : échec téléchargement DB à ~52% (45.92 MB / 87.09 MB)
    - Image postgres : DB partiellement téléchargée, timeout lors de l'analyse (pipeline error)
  - **Conséquence :** aucune vulnérabilité CVE détectée sur les 3 images Docker.

### Conclusion générale

**Résultat partiel mais positif :**
1. ✅ Aucun secret exposé détecté (scan réussi)
2. ⚠️  Scans CVE incomplets sur 4 cibles (filesystem + 3 images Docker) - limitation technique réseau

**Limites du test :**
- Scans CVE non complétés sur filesystem et 3 images Docker
- Timeout systématique lors du téléchargement de la DB vulnérabilités (87 MB)
- Connexion réseau limitée à ~150-170 KB/s, délai dépassé après ~5 minutes par scan
- **Recommandation :** relancer avec `--timeout 20m` ou précacher DB (`trivy image --download-db-only --timeout 20m`)

## 5) Vulnérabilités détectées

**Aucune vulnérabilité CVE détectée lors des scans réalisés** (scans incomplets - voir limitations).

| ID | Observation | Actif concerné | Preuve | Statut |
|---|---|---|---|---|
| TRIVY-INFO-01 | Aucun secret exposé détecté | Projet local (code source) | `trivy-secret-project.txt` | ✅ Point positif |
| TRIVY-LIMIT-01 | Scan CVE filesystem non complété (timeout DB) | Dépendances projet | `trivy-fs-project.txt` | ⚠️ À refaire |
| TRIVY-LIMIT-02 | Scan CVE image frontend non complété (timeout DB) | Image Docker frontend | `trivy-image-frontend.txt` | ⚠️ À refaire |
| TRIVY-LIMIT-03 | Scan CVE image backend non complété (timeout DB) | Image Docker backend | `trivy-image-backend.txt` | ⚠️ À refaire |
| TRIVY-LIMIT-04 | Scan CVE image postgres non complété (timeout) | Image Docker postgres:15-alpine | `trivy-image-postgres.txt` | ⚠️ À refaire |

**Note :** L'absence de détection de secrets est un bon indicateur de sécurité. Les scans de vulnérabilités CVE devront être complétés ultérieurement avec configuration réseau optimisée ou timeout augmenté (`--timeout 20m`).

## 6) Évaluation des risques en cybersécurité

**Score global basé sur les scans réalisés :**

| ID | Scénario de risque résiduel | Probabilité (1-5) | Impact (1-5) | Score (P×I) | Niveau |
|---|---|---:|---:|---:|---|
| TRIVY-R01 | Secrets potentiels non détectés par scanner (faux négatifs) | 1 | 4 | 4 | Faible |
| TRIVY-R02 | Vulnérabilités CVE filesystem non scannées (scan incomplet) | 3 | 3 | 9 | Modéré |
| TRIVY-R03 | Vulnérabilités CVE image frontend non scannées | 3 | 4 | 12 | Élevé |
| TRIVY-R04 | Vulnérabilités CVE image backend non scannées | 3 | 5 | 15 | Élevé |
| TRIVY-R05 | Vulnérabilités CVE image postgres non scannées | 3 | 4 | 12 | Élevé |

**Justification :**
- `TRIVY-R01` : Probabilité très faible (scanner Trivy reconnu), mais impact élevé si secret exposé.
- `TRIVY-R02` : Probabilité moyenne (scan pas terminé), impact moyen (pas de visibilité sur CVE dépendances locales).
- `TRIVY-R03` : Image frontend exposée publiquement (port 3000), impact élevé si CVE CRITICAL non patchées.
- `TRIVY-R04` : Image backend avec accès aux données (port 8000), impact critique si vulnérabilités exploitables.
- `TRIVY-R05` : PostgreSQL stocke données sensibles, impact élevé si CVE dans base ou bibliothèques système.

**Résultat global :** 
- ✅ **Gestion des secrets : CONFORME** (aucun secret détecté)
- ⚠️ **Vulnérabilités CVE : NON ÉVALUÉ** (4 scans à compléter : filesystem + 3 images Docker)
- 🔴 **Niveau de risque global : ÉLEVÉ** (visibilité insuffisante sur CVE des conteneurs en production)
- **Niveau de risque actuel : MODÉRÉ** (incomplets de visibilité sur CVE)

## 7) Recommandations de réduction/correction

### Recommandations prioritaires

#### Priorité haute (compléter les tests)
1. **Réexécuter tous les scans de vulnérabilités avec timeout augmenté** :
   ```bash
   # Télécharger la DB une seule fois avec timeout élevé
   trivy image --download-db-only --timeout 20m
   
   # Puis scanner sans mettre à jour la DB
   trivy fs --skip-db-update --severity HIGH,CRITICAL .
   trivy image --skip-db-update --severity HIGH,CRITICAL gestion-presence-empreinte-frontend:latest
   trivy image --skip-db-update --severity HIGH,CRITICAL gestion-presence-empreinte-backend:latest
   trivy image --skip-db-update --severity HIGH,CRITICAL postgres:15-alpine
   ```

2. **Alternative : exécuter sur connexion réseau performante** :
   - Débit requis : minimum 500 KB/s pour compléter en < 3 minutes
   - Ou environnement CI/CD avec cache Trivy DB préconfigurée

#### Priorité moyenne (bonnes pratiques à maintenir)
3. **Continuer la gestion sécurisée des secrets** :
   - Ne jamais committer de credentials dans le code
   - Utiliser variables d'environnement ou gestionnaires de secrets (Vault, AWS Secrets Manager)
   - Activer pre-commit hooks avec détection de secrets

4. **Vérifier manuellement les dépendances critiques** :
   - Lister les dépendances : `pip freeze` (Python), `npm list` (Node.js)
   - Vérifier vulnérabilités connues sur CVE databases
   - Mettre à jour régulièrement les dépendances

#### Priorité faible (amélioration continue)
5. **Intégrer Trivy dans CI/CD** :
   - Scan automatique des images Docker lors du build
   - Bloquer déploiement si CVE CRITICAL détectées
   - Générer rapports de conformité périodiques
   - Utiliser cache Trivy DB partagé pour éviter timeout

6. **Améliorer les images Docker de base** :
   ```dockerfile
   # Préférer des images officielles minimales régulièrement mises à jour
   FROM python:3.11-slim-bullseye  # au lieu de python:3.11
   FROM node:20-alpine  # au lieu de node:20
   ```

7. **Scanner les configurations IaC et Dockerfiles** :
   ```bash
   trivy config . --severity HIGH,CRITICAL
   trivy config Dockerfile --severity MEDIUM,HIGH,CRITICAL
   ```

8. **Établir une politique de gestion des vulnérabilités** :
   - Définir SLA de correction par sévérité (CRITICAL: 7j, HIGH: 30j)
   - Assigner responsables pour chaque CVE
   - Tracker dans registre des risques
   - Scanner chaque nouvelle version d'image avant déploiement

### Actions immédiates recommandées
- [ ] Compléter le scan Trivy filesystem avec timeout augmenté (--timeout 20m)
- [ ] Scanner les 3 images Docker avec DB précachée (--skip-db-update)
- [ ] Documenter les dépendances du projet (requirements.txt, package.json)
- [ ] Vérifier manuellement les versions de bibliothèques critiques
- [ ] Identifier version PostgreSQL exacte utilisée (postgres:15-alpine)

## Journal de test
- **Date :** 06/03/2026
- **Analyste :** GitHub Copilot (assistance)
- **Périmètre :** Projet local `/home/mampionona/Documents/Projet/Analyse_risque` + 3 images Docker (frontend, backend, postgres:15-alpine)
- **Remarques :** 
  - ✅ Scan secrets réussi : aucun secret détecté
  - ❌ Scan CVE filesystem : timeout téléchargement DB (87 MB, ~47% complété à 41 MB)
  - ❌ Scan CVE image frontend : timeout téléchargement DB (87 MB, ~47% complété)
  - ❌ Scan CVE image backend : timeout téléchargement DB (87 MB, ~52% complété à 45 MB)
  - ❌ Scan CVE image postgres : timeout analyse après téléchargement partiel DB
  - Connexion limitée à ~150-170 KB/s, délai dépassé après 5 minutes par scan
  - **Recommandation :** relancer avec `--timeout 20m` ou précacher DB avec `trivy image --download-db-only --timeout 20m`
