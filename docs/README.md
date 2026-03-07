# Projet : Évaluation des risques en cybersécurité

Ce dossier contient la documentation des tests de sécurité réalisés avec :
- Nmap
- Nikto
- sqlmap
- Trivy

## Objectif
Produire, pour chaque outil, une documentation structurée incluant :
1. Description de l’outil
2. Commandes utilisées lors des tests
3. Captures d’écran des résultats dans le terminal
4. Analyse détaillée des résultats
5. Vulnérabilités détectées
6. Évaluation des risques en cybersécurité
7. Recommandations de remédiation

## Structure du dossier
- `docs/Nmap.md`
- `docs/Nikto.md`
- `docs/sqlmap.md`
- `docs/Trivy.md`
- `docs/screenshots/` (captures d’écran)

## Méthodologie d’évaluation des risques (commune)
- **Probabilité (1 à 5)** : Rare, Peu probable, Possible, Probable, Très probable
- **Impact (1 à 5)** : Négligeable, Mineur, Modéré, Grave, Très grave
- **Niveau de risque** : `R = Probabilité × Impact`

### Interprétation suggérée
- 1 à 4 : Faible
- 5 à 9 : Modéré
- 10 à 16 : Élevé
- 17 à 25 : Critique

## Convention pour les preuves (captures)
- Format recommandé : PNG
- Nommage recommandé :
  - `nmap-01-scan-initial.png`
  - `nikto-01-scan-web.png`
  - `sqlmap-01-test-injection.png`
  - `trivy-01-image-scan.png`
- Stockage : `docs/screenshots/`

## Bonnes pratiques d’exécution
- Tester uniquement des cibles autorisées.
- Documenter la date, la cible, la commande exacte et le contexte.
- Conserver les sorties terminal brutes si possible.

## Modèle minimal par test
- **Date/Heure**
- **Outil**
- **Cible**
- **Commande**
- **Résultat brut**
- **Vulnérabilités observées**
- **Risque (P × I)**
- **Actions recommandées**
