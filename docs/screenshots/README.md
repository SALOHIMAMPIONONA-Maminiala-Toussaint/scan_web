# Guide : Génération des captures d'écran

## Preuves existantes
Toutes les sorties brutes des scans sont enregistrées dans `../evidence/` au format texte :
- Nmap : `nmap-*.txt`, `nmap-backend-*.txt`
- Nikto : `nikto-frontend-3000.txt`, `nikto-backend-8000.txt`

## Comment générer les captures d'écran (optionnel)

### Option 1 : Réexécuter les commandes et capturer
Pour générer les captures PNG manuellement, réexécutez les commandes et prenez des screenshots :

#### Nmap Frontend (port 3000)
```bash
cd /home/mampionona/Documents/Projet/Analyse_risque
cat docs/evidence/nmap-01-port-3000.txt
# Prendre capture → nmap-01-port-3000.png
```

#### Nikto Frontend
```bash
cat docs/evidence/nikto-frontend-3000.txt
# Prendre capture → nikto-01-frontend-3000.png
```

### Option 2 : Convertir les fichiers .txt en images
```bash
# Utiliser convert (ImageMagick) pour générer des images depuis le texte
convert -size 1200x800 -pointsize 10 -background black -fill white \
  label:@docs/evidence/nikto-frontend-3000.txt \
  docs/screenshots/nikto-01-frontend-3000.png
```

### Option 3 : Capturer depuis terminal
1. Afficher le contenu : `cat docs/evidence/nikto-frontend-3000.txt`
2. Utiliser outil de capture d'écran système (gnome-screenshot, flameshot, etc.)
3. Sauvegarder dans ce dossier avec le nom approprié

## Captures requises

### Nmap
- `nmap-01-port-3000.png` → voir `../evidence/nmap-01-port-3000.txt`
- `nmap-02-service-version.png` → voir `../evidence/nmap-02-service-version.txt`
- `nmap-03-vuln-scripts.png` → voir `../evidence/nmap-03-vuln-scripts.txt`
- `nmap-backend-01-port-8000.png` → voir `../evidence/nmap-backend-01-port-8000.txt`

### Nikto
- `nikto-01-frontend-3000.png` → voir `../evidence/nikto-frontend-3000.txt`
- `nikto-02-backend-8000.png` → voir `../evidence/nikto-backend-8000.txt`

### sqlmap
- À générer lors des tests sqlmap

### Trivy
- À générer lors des tests Trivy

## Note
Les fichiers de preuves textuelles dans `../evidence/` sont **suffisants** pour la documentation technique. Les captures PNG sont un complément visuel optionnel pour la présentation.
