# Documentation outil : Nmap
CYSEC
## 1) Description de l’outil
**Nmap (Network Mapper)** est un outil d’exploration réseau et d’audit de sécurité. Il sert à détecter les hôtes actifs, les ports ouverts, les services exposés et, selon les scripts utilisés, des vulnérabilités potentielles.

## 2) Commandes utilisées lors des tests
**Cible testée :** `http://localhost:3000` (hôte : `localhost`, port : `3000`)

```bash
# Scan ciblé du port applicatif
nmap -Pn -p 3000 localhost -oN docs/evidence/nmap-01-port-3000.txt

# Détection de service/version sur le port
nmap -Pn -sV -p 3000 localhost -oN docs/evidence/nmap-02-service-version.txt

# Scripts NSE de vulnérabilité sur le port
nmap -Pn -sV --script vuln -p 3000 localhost -oN docs/evidence/nmap-03-vuln-scripts.txt

# Scripts Nmap par défaut pour enrichir l’analyse HTTP
nmap -Pn -sC -sV -p 3000 localhost -oN docs/evidence/nmap-04-default-scripts.txt
```

## 3) Preuves des résultats (sorties terminal)

**Preuves principales (fichiers texte) :**

*Frontend (port 3000) :*
- [`docs/evidence/nmap-01-port-3000.txt`](evidence/nmap-01-port-3000.txt)
- [`docs/evidence/nmap-02-service-version.txt`](evidence/nmap-02-service-version.txt)
- [`docs/evidence/nmap-03-vuln-scripts.txt`](evidence/nmap-03-vuln-scripts.txt)
- [`docs/evidence/nmap-04-default-scripts.txt`](evidence/nmap-04-default-scripts.txt)

*Backend (port 8000) :*
- [`docs/evidence/nmap-backend-01-port-8000.txt`](evidence/nmap-backend-01-port-8000.txt)
- [`docs/evidence/nmap-backend-02-service-version.txt`](evidence/nmap-backend-02-service-version.txt)
- [`docs/evidence/nmap-backend-03-vuln-scripts.txt`](evidence/nmap-backend-03-vuln-scripts.txt)

**Captures d'écran optionnelles :**
- `screenshots/nmap-01-port-3000.png` (à générer - voir [screenshots/README.md](screenshots/README.md))
- `screenshots/nmap-02-service-version.png` (à générer)
- `screenshots/nmap-backend-01-port-8000.png` (à générer)

### Résultats observés (synthèse)
- Hôte `localhost (127.0.0.1)` actif.
- Port `3000/tcp` **open**.
- Le service répond en **HTTP** (bannière `HTTP/1.1 200 OK`, contenu HTML).
- Les scripts `vuln` Nmap n’ont pas signalé de vulnérabilité critique explicite sur ce port.
- Nmap ne reconnaît pas précisément la signature applicative (`service unrecognized`), mais expose un fingerprint HTTP détaillé.

## 4) Analyse et explication détaillée des résultats
### Analyse détaillée
- **Constat principal 1 :** le service Web est exposé sur `3000/tcp`.
	- **Preuve :** `nmap-01-port-3000.txt` (état `open`).
	- **Cause probable :** application démarrée en écoute publique (`0.0.0.0:3000`).
	- **Conséquence possible :** élargissement de la surface d’attaque (scan, bruteforce, exploitation applicative).

- **Constat principal 2 :** réponses HTTP détaillées accessibles lors du fingerprinting.
	- **Preuve :** `nmap-02-service-version.txt`, `nmap-04-default-scripts.txt` (retour HTML, en-têtes HTTP, métadonnées applicatives).
	- **Cause probable :** configuration par défaut de l’application Web.
	- **Conséquence possible :** divulgation d’informations facilitant la reconnaissance par un attaquant.

- **Constat principal 3 :** absence d’alerte critique directe dans `--script vuln` sur ce scan ciblé.
	- **Preuve :** `nmap-03-vuln-scripts.txt`.
	- **Interprétation :** pas de faille triviale détectée par ce jeu de scripts sur ce seul port, mais cela ne prouve pas l’absence de vulnérabilités applicatives.

## 5) Vulnérabilités détectées
| ID | Vulnérabilité | Actif concerné | Preuve | Gravité technique |
|---|---|---|---|---|
| NMAP-01 | Exposition du service HTTP sur `3000/tcp` | Application locale sur `localhost:3000` | `nmap-01-port-3000.txt` | Moyenne |
| NMAP-02 | Divulgation d’informations techniques via fingerprint HTTP (HTML/métadonnées) | Application Web (page index + en-têtes) | `nmap-02-service-version.txt`, `nmap-04-default-scripts.txt` | Faible à moyenne |

## 6) Évaluation des risques en cybersécurité
| ID | Scénario de risque | Probabilité (1-5) | Impact (1-5) | Score (P×I) | Niveau |
|---|---|---:|---:|---:|---|
| NMAP-01 | Tentatives d’exploitation contre le service exposé sur le port 3000 | 3 | 3 | 9 | Modéré |
| NMAP-02 | Reconnaissance facilitée par divulgation d’informations HTTP | 4 | 2 | 8 | Modéré |

**Justification :**
- `NMAP-01` : exposition réseau réelle, mais impact dépend des protections applicatives.
- `NMAP-02` : très probable en phase de reconnaissance, impact direct limité mais utile à des attaques ultérieures.

## 7) Recommandations de réduction/correction
- Restreindre l’exposition du service : écoute locale stricte (`127.0.0.1`) ou filtrage pare-feu.
- Placer l’application derrière un reverse proxy durci (Nginx/Apache) avec règles de sécurité.
- Réduire les informations divulguées dans les réponses HTTP (bannières, métadonnées non essentielles).
- Mettre en place des scans périodiques et comparer les résultats (baseline Nmap).
- Compléter par des tests applicatifs (Nikto, sqlmap, tests d’authentification) pour couvrir les risques non visibles réseau.

## Journal de test
- **Date :** 06/03/2026
- **Analyste :** GitHub Copilot (assistance)
- **Périmètre :** `localhost` port `3000` uniquement
- **Remarques :** analyse limitée à l’exposition réseau/service ; pas d’audit complet du code applicatif.
