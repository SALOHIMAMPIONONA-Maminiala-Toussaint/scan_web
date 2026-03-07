═══════════════════════════════════════════════════════════════════════════════
               GUIDE D'UTILISATION - DOCUMENTS OPTIMISÉS POUR WORD
═══════════════════════════════════════════════════════════════════════════════

📋 FICHIERS DISPONIBLES
───────────────────────────────────────────────────────────────────────────────

Les documents suivants ont été spécialement formatés pour un copier-coller
direct dans Microsoft Word :

  1. README_WORD.md    → Présentation du projet et méthodologie
  2. Nmap_WORD.md      → Documentation complète de l'analyse Nmap
  3. Nikto_WORD.md     → Documentation complète de l'analyse Nikto
  4. sqlmap_WORD.md    → Documentation complète de l'analyse sqlmap
  5. Trivy_WORD.md     → Documentation complète de l'analyse Trivy


📍 EMPLACEMENT DES FICHIERS
───────────────────────────────────────────────────────────────────────────────

Tous les fichiers se trouvent dans :
  /home/mampionona/Documents/Projet/Analyse_risque/docs/


✅ AMÉLIORATIONS APPORTÉES POUR WORD
───────────────────────────────────────────────────────────────────────────────

Chaque document a été optimisé avec :

  ✓ En-tête formaté avec séparateurs visuels (═══ et ───)
  ✓ Sections numérotées avec emojis pour clarté visuelle (1️⃣ 2️⃣ 3️⃣)
  ✓ Données présentées en listes structurées (sans tableaux)
  ✓ Blocs de code présentés en format texte lisible
  ✓ Hiérarchie claire des titres et sous-titres
  ✓ Séparateurs de sections (━━━━━━━━)
  ✓ Symboles visuels (✓ ✗ ✅ ❌ ⚠️ 🔴 🔄)
  ✓ Listes à puces structurées
  ✓ Justifications et explications détaillées
  ✓ Journal de test en fin de chaque document


📝 MODE D'EMPLOI - COPIER-COLLER DANS WORD
───────────────────────────────────────────────────────────────────────────────

ÉTAPE 1 : Ouvrir le fichier
  • Utiliser un éditeur de texte (VS Code, Notepad++, gedit, etc.)
  • Ouvrir le fichier *_WORD.md souhaité

ÉTAPE 2 : Sélectionner tout le contenu
  • Appuyer sur Ctrl+A (Windows/Linux) ou Cmd+A (Mac)
  • Ou sélectionner manuellement tout le texte

ÉTAPE 3 : Copier le contenu
  • Appuyer sur Ctrl+C (Windows/Linux) ou Cmd+C (Mac)

ÉTAPE 4 : Ouvrir Microsoft Word
  • Créer un nouveau document vierge

ÉTAPE 5 : Coller le contenu
  • Appuyer sur Ctrl+V (Windows/Linux) ou Cmd+V (Mac)
  • Choisir "Conserver la mise en forme source" si demandé

ÉTAPE 6 : Ajuster la police (optionnel)
  • Police recommandée : "Courier New" ou "Consolas" (pour tableaux alignés)
  • Taille recommandée : 10pt ou 11pt
  • Sélectionner tout (Ctrl+A) → Choisir police


💡 CONSEILS POUR UN RENDU OPTIMAL DANS WORD
───────────────────────────────────────────────────────────────────────────────

1. POLICE MONOSPACE (crucial pour l'alignement des tableaux)
   
   Polices recommandées :
     • Courier New (classique)
     • Consolas (moderne, meilleure lisibilité)
     • Monaco (Mac)
   
   ⚠ Éviter polices proportionnelles (Arial, Times New Roman) car elles
      désalignent les tableaux ASCII

2. MARGES
   
   Configuration suggérée :
     • Haut    : 2 cm
     • Bas     : 2 cm
     • Gauche  : 2 cm
     • Droite  : 2 cm

3. ORIENTATION
   
   • Portrait : pour README, sqlmap, Trivy
   • Paysage (optionnel) : pour Nmap et Nikto (tableaux larges)

4. COULEURS (optionnel mais recommandé)
   
   Appliquer manuellement des couleurs pour améliorer la lisibilité :
     • Titres principaux (═══) : Bleu foncé, gras
     • Sous-titres (━━━)       : Bleu clair, gras
     • ✅ Résultats positifs   : Vert
     • ❌ Résultats négatifs   : Rouge
     • ⚠️  Avertissements       : Orange
    • Blocs de code          : Fond gris clair

5. SAUTS DE PAGE
   
   Insérer des sauts de page manuels entre les grandes sections pour
   améliorer la présentation :
     • Avant chaque section numérotée (1️⃣ 2️⃣ etc.)
    • Après la section des risques (section 6)


📊 ORDRE DE LECTURE RECOMMANDÉ
───────────────────────────────────────────────────────────────────────────────

Pour une présentation logique du projet :

  1. README_WORD.md     → Introduction et méthodologie
  2. Nmap_WORD.md       → Première phase : scan réseau
  3. Nikto_WORD.md      → Deuxième phase : scan Web
  4. sqlmap_WORD.md     → Troisième phase : test injections SQL
  5. Trivy_WORD.md      → Quatrième phase : scan conteneurs


🔖 STRUCTURE TYPE DE CHAQUE DOCUMENT
───────────────────────────────────────────────────────────────────────────────

Chaque document suit la même structure en 7 sections :

  1️⃣  Description de l'outil
  2️⃣  Commandes utilisées lors des tests
  3️⃣  Preuves des résultats (sorties terminal)
  4️⃣  Analyse et explication détaillée des résultats
  5️⃣  Vulnérabilités détectées
  6️⃣  Évaluation des risques en cybersécurité
  7️⃣  Recommandations de réduction/correction
  📋 Journal de test (en fin de document)


📁 FICHIERS DE PREUVES ASSOCIÉS
───────────────────────────────────────────────────────────────────────────────

Les preuves (sorties terminal) sont stockées dans :
  /home/mampionona/Documents/Projet/Analyse_risque/docs/evidence/

Liste des fichiers de preuve :
  • nmap-*.txt (7 fichiers)
  • nikto-*.txt (2 fichiers)
  • sqlmap-*.txt (4 fichiers)
  • trivy-*.txt (6 fichiers)

Ces fichiers peuvent être annexés au rapport Word comme preuves complémentaires.


🎨 ALTERNATIVE : EXPORT PDF
───────────────────────────────────────────────────────────────────────────────

Pour générer des PDF directement depuis les fichiers Markdown :

  Méthode 1 : Via VS Code
    1. Installer l'extension "Markdown PDF"
    2. Ouvrir le fichier *_WORD.md
    3. Clic droit → "Markdown PDF: Export (pdf)"

  Méthode 2 : Via Pandoc (ligne de commande)
    pandoc Nmap_WORD.md -o Nmap.pdf --pdf-engine=xelatex


═══════════════════════════════════════════════════════════════════════════════
                             FIN DU GUIDE D'UTILISATION
═══════════════════════════════════════════════════════════════════════════════
