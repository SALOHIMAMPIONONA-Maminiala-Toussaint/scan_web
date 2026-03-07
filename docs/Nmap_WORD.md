═══════════════════════════════════════════════════════════════════════════════
                           DOCUMENTATION OUTIL : NMAP
═══════════════════════════════════════════════════════════════════════════════

Outil : Nmap (Network Mapper) v7.98
Date d'analyse : 06 mars 2026
Cibles : localhost:3000 (Frontend) + localhost:8000 (Backend)

───────────────────────────────────────────────────────────────────────────────


1️⃣ DESCRIPTION DE L'OUTIL
───────────────────────────────────────────────────────────────────────────────

Nmap (Network Mapper) est un outil d'exploration réseau et d'audit de sécurité 
de référence utilisé par les professionnels de la cybersécurité.

Principales fonctionnalités :
  • Découverte d'hôtes actifs sur un réseau
  • Détection des ports ouverts/fermés/filtrés
  • Identification des services et versions exposés
  • Exécution de scripts NSE (Nmap Scripting Engine) pour détection de vulnérabilités
  • Fingerprinting OS et applications
  • Cartographie de l'infrastructure réseau


2️⃣ COMMANDES UTILISÉES LORS DES TESTS
───────────────────────────────────────────────────────────────────────────────

CIBLES TESTÉES :
  → Frontend : http://localhost:3000
  → Backend  : http://localhost:8000

SCANS FRONTEND (port 3000) :

  nmap -Pn -p 3000 localhost -oN docs/evidence/nmap-01-port-3000.txt
    ↳ Scan ciblé du port applicatif

  nmap -Pn -sV -p 3000 localhost -oN docs/evidence/nmap-02-service-version.txt
    ↳ Détection de service/version sur le port

  nmap -Pn -sV --script vuln -p 3000 localhost -oN docs/evidence/nmap-03-vuln-scripts.txt
    ↳ Scripts NSE de vulnérabilité sur le port

  nmap -Pn -sC -sV -p 3000 localhost -oN docs/evidence/nmap-04-default-scripts.txt
    ↳ Scripts Nmap par défaut pour enrichir l'analyse HTTP

SCANS BACKEND (port 8000) :

  nmap -Pn -p 8000 localhost -oN docs/evidence/nmap-backend-01-port-8000.txt
  nmap -Pn -sV -p 8000 localhost -oN docs/evidence/nmap-backend-02-service-version.txt
  nmap -Pn -sV --script vuln -p 8000 localhost -oN docs/evidence/nmap-backend-03-vuln-scripts.txt


3️⃣ PREUVES DES RÉSULTATS (SORTIES TERMINAL)
───────────────────────────────────────────────────────────────────────────────

PREUVES PRINCIPALES (fichiers texte) :

  Frontend (port 3000) :
    • docs/evidence/nmap-01-port-3000.txt
    • docs/evidence/nmap-02-service-version.txt
    • docs/evidence/nmap-03-vuln-scripts.txt
    • docs/evidence/nmap-04-default-scripts.txt

  Backend (port 8000) :
    • docs/evidence/nmap-backend-01-port-8000.txt
    • docs/evidence/nmap-backend-02-service-version.txt
    • docs/evidence/nmap-backend-03-vuln-scripts.txt

CAPTURES D'ÉCRAN OPTIONNELLES :
    • screenshots/nmap-01-port-3000.png (à générer)
    • screenshots/nmap-02-service-version.png (à générer)
    • screenshots/nmap-backend-01-port-8000.png (à générer)


SYNTHÈSE DES RÉSULTATS OBSERVÉS :

  ✓ Hôte localhost (127.0.0.1) actif
  ✓ Port 3000/tcp OPEN (service HTTP)
  ✓ Port 8000/tcp OPEN (service HTTP)
  ✓ Réponses HTTP détectées (HTTP/1.1 200 OK, contenu HTML)
  ⚠ Service non reconnu précisément (service unrecognized)
  ✓ Scripts vuln NSE n'ont pas signalé de vulnérabilité critique explicite


4️⃣ ANALYSE ET EXPLICATION DÉTAILLÉE DES RÉSULTATS
───────────────────────────────────────────────────────────────────────────────

CONSTAT PRINCIPAL 1 : Exposition du service Web sur 3000/tcp et 8000/tcp

  Preuve : nmap-01-port-3000.txt, nmap-backend-01-port-8000.txt (état "open")
  
  Cause probable :
    Applications démarrées en écoute publique (0.0.0.0:3000 et 0.0.0.0:8000)
  
  Conséquence possible :
    Élargissement de la surface d'attaque (scan, bruteforce, exploitation 
    applicative). Les services sont accessibles depuis n'importe quelle 
    interface réseau.
  
  Interprétation :
    Configuration typique en environnement de développement. En production,
    ces ports devraient être protégés par firewall ou limités à 127.0.0.1.


CONSTAT PRINCIPAL 2 : Réponses HTTP détaillées accessibles

  Preuve : nmap-02-service-version.txt, nmap-04-default-scripts.txt
           (retour HTML, en-têtes HTTP, métadonnées applicatives)
  
  Cause probable :
    Configuration par défaut de l'application Web sans durcissement
  
  Conséquence possible :
    Divulgation d'informations facilitant la reconnaissance par un attaquant.
    Les réponses HTTP exposent la structure de l'application, les technologies
    utilisées et potentiellement des chemins de fichiers.
  
  Recommandation :
    Minimiser les informations divulguées dans les réponses HTTP (bannières,
    métadonnées non essentielles).


CONSTAT PRINCIPAL 3 : Absence d'alerte critique dans --script vuln

  Preuve : nmap-03-vuln-scripts.txt, nmap-backend-03-vuln-scripts.txt
  
  Interprétation :
    Pas de faille triviale détectée par ce jeu de scripts NSE. Cependant,
    cela ne prouve PAS l'absence de vulnérabilités applicatives. Les scripts
    NSE sont limités aux vulnérabilités connues et facilement détectables. Une
    analyse approfondie (code review, tests d'intrusion manuels) reste nécessaire.


5️⃣ VULNÉRABILITÉS DÉTECTÉES
───────────────────────────────────────────────────────────────────────────────

- NMAP-01
  - Vulnérabilité : Exposition du service HTTP sur 3000/tcp et 8000/tcp
  - Actif concerné : localhost:3000 et localhost:8000
  - Preuve : nmap-01-port-3000.txt, nmap-backend-01-*.txt
  - Gravité technique : MOYENNE

- NMAP-02
  - Vulnérabilité : Divulgation d'informations techniques via fingerprint HTTP (HTML/métadonnées)
  - Actif concerné : Application Web (page index + en-têtes)
  - Preuve : nmap-02-service-*.txt, nmap-04-default-*.txt
  - Gravité technique : FAIBLE/MOYENNE


6️⃣ ÉVALUATION DES RISQUES EN CYBERSÉCURITÉ
───────────────────────────────────────────────────────────────────────────────

MATRICE DE RISQUES :

- NMAP-01
  - Scénario de risque : Tentatives d'exploitation contre le service exposé sur les ports 3000 et 8000
  - Probabilité : 3 (Possible)
  - Impact : 3 (Modéré)
  - Score P×I : 9
  - Niveau : MODÉRÉ

- NMAP-02
  - Scénario de risque : Reconnaissance facilitée par divulgation d'informations HTTP
  - Probabilité : 4 (Probable)
  - Impact : 2 (Mineur)
  - Score P×I : 8
  - Niveau : MODÉRÉ

JUSTIFICATION DES SCORES :

  NMAP-01 (Score 9 - Modéré) :
    Exposition réseau réelle avec probabilité moyenne d'exploitation (3/5).
    L'impact dépend des protections applicatives en place. En l'absence de
    mécanisme de défense (WAF, rate limiting, authentification), une 
    exploitation est techniquement possible.

  NMAP-02 (Score 8 - Modéré) :
    Très probable en phase de reconnaissance (4/5) car accessible à tout
    scanner. Impact direct limité (2/5) mais utile pour préparer des attaques
    ultérieures plus sophistiquées (choix d'exploits ciblés).


7️⃣ RECOMMANDATIONS DE RÉDUCTION/CORRECTION
───────────────────────────────────────────────────────────────────────────────

PRIORITÉ HAUTE (Action immédiate) :

  1. Restreindre l'exposition du service
     □ Configurer l'écoute locale stricte (127.0.0.1) au lieu de 0.0.0.0
     □ Implémenter règles de pare-feu (iptables/firewalld) pour filtrer l'accès
     □ Utiliser VPN ou tunnel SSH pour accès distant sécurisé

  2. Placer l'application derrière un reverse proxy durci
     □ Déployer Nginx ou Apache avec configuration sécurisée
     □ Activer règles de sécurité (rate limiting, WAF, filtrage IP)
     □ Centraliser la gestion des certificats SSL/TLS


PRIORITÉ MOYENNE (Planification à 30 jours) :

  3. Réduire l es informations divulguées dans les réponses HTTP
     □ Supprimer ou masquer les bannières serveur
     □ Minimiser les métadonnées dans les en-têtes HTTP
     □ Utiliser pages d'erreur génériques (éviter stack traces)

  4. Mettre en place des scans périodiques
     □ Automatiser scans Nmap hebdomadaires/mensuels
     □ Comparer les résultats avec baseline (détection de dérive)
     □ Alerter en cas de nouveau port ouvert ou service exposé


PRIORITÉ FAIBLE (Amélioration continue) :

  5. Compléter par des tests applicatifs
     □ Nikto (vulnérabilités Web)
     □ sqlmap (injections SQL)
     □ Tests d'authentification et autorisation
     □ Audit de code source
