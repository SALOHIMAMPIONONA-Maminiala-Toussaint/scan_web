═══════════════════════════════════════════════════════════════════════════════
                    ÉVALUATION DES RISQUES EN CYBERSÉCURITÉ
═══════════════════════════════════════════════════════════════════════════════

Projet : Analyse de sécurité complète
Date : 06 mars 2026

───────────────────────────────────────────────────────────────────────────────

# PRÉSENTATION DU PROJET

Ce dossier contient la documentation complète des tests de sécurité réalisés avec quatre outils professionnels :

  • Nmap      → Scanner réseau et détection de services
  • Nikto     → Scanner de vulnérabilités Web
  • sqlmap    → Détection d'injections SQL
  • Trivy     → Scanner de vulnérabilités conteneurs et secrets


# OBJECTIFS DE L'AUDIT

Pour chaque outil, une documentation structurée a été produite incluant :

  1. Description de l'outil et de ses capacités
  2. Commandes utilisées lors des tests réalisés
  3. Preuves des résultats (captures d'écran / fichiers texte)
  4. Analyse détaillée et interprétation des résultats
  5. Vulnérabilités détectées avec classification
  6. Évaluation des risques selon méthodologie 5×5
  7. Recommandations de remédiation priorisées


# STRUCTURE DE LA DOCUMENTATION

Fichiers de documentation :
  • docs/Nmap.md      → Tests de sécurité réseau
  • docs/Nikto.md     → Tests de sécurité Web
  • docs/sqlmap.md    → Tests d'injection SQL
  • docs/Trivy.md     → Tests de vulnérabilités conteneurs

Fichiers de preuves :
  • docs/evidence/    → Sorties terminal (format .txt)
  • docs/screenshots/ → Captures d'écran optionnelles (format .png)


# MÉTHODOLOGIE D'ÉVALUATION DES RISQUES

## Matrice d'évaluation 5×5

Chaque risque est évalué selon deux dimensions :

**PROBABILITÉ (P)** - Échelle de 1 à 5 :
  1 = Rare (< 5% de chances)
  2 = Peu probable (5-25% de chances)
  3 = Possible (25-50% de chances)
  4 = Probable (50-75% de chances)
  5 = Très probable (> 75% de chances)

**IMPACT (I)** - Échelle de 1 à 5 :
  1 = Négligeable (aucune conséquence significative)
  2 = Mineur (gêne temporaire, impact limité)
  3 = Modéré (dégradation de service, perte de données limitée)
  4 = Grave (compromission partielle, perte de données importante)
  5 = Très grave (compromission totale, perte de données critique)

**SCORE DE RISQUE** : R = Probabilité × Impact (1-25)


## Interprétation des scores

- Score 1-4
  - Niveau : FAIBLE
  - Action requise : Surveillance, correction optionnelle

- Score 5-9
  - Niveau : MODÉRÉ
  - Action requise : Planifier correction à moyen terme

- Score 10-16
  - Niveau : ÉLEVÉ
  - Action requise : Correction prioritaire sous 30 jours

- Score 17-25
  - Niveau : CRITIQUE
  - Action requise : Correction immédiate sous 7 jours


# CONVENTION POUR LES PREUVES

## Format des fichiers de preuve

**Preuves principales (obligatoires) :**
  • Format : TXT (sortie terminal brute)
  • Stockage : docs/evidence/
  • Nommage : outil-description-cible.txt
    Exemple : nmap-01-port-3000.txt

**Captures d'écran (optionnelles) :**
  • Format : PNG
  • Stockage : docs/screenshots/
  • Nommage suggéré :
    - nmap-01-scan-initial.png
    - nikto-01-scan-web.png
    - sqlmap-01-test-injection.png
    - trivy-01-image-scan.png


# BONNES PRATIQUES D'EXÉCUTION DES TESTS

  ✓ Tester UNIQUEMENT des cibles autorisées
  ✓ Documenter systématiquement : date, heure, cible, commande exacte
  ✓ Conserver les sorties terminal brutes complètes
  ✓ Effectuer les tests dans un environnement contrôlé
  ✓ Respecter les politiques de sécurité de l'organisation
  ✓ Obtenir les autorisations nécessaires avant tout test


# MODÈLE DE DOCUMENTATION PAR TEST

Chaque test documenté contient :

  □ Date et heure d'exécution
  □ Nom de l'outil utilisé
  □ Cible testée (URL, IP, port)
  □ Commande exacte exécutée
  □ Résultat brut (sortie terminal complète)
  □ Vulnérabilités observées (classification)
  □ Score de risque (P × I) avec justification
  □ Actions recommandées (priorisées)


───────────────────────────────────────────────────────────────────────────────
Fin du document README
───────────────────────────────────────────────────────────────────────────────
