# XPLIT — prototype 3D multijoueur

Arène à la première personne jouable dans un navigateur. Le serveur regroupe automatiquement les joueurs par matchs de huit, avec synchronisation des positions, tirs, dégâts et réapparitions.

## Déploiement public gratuit (bêta)

Le projet contient `render.yaml` pour Render. Pour obtenir une adresse publique :

1. Mets le contenu de ce dossier dans un dépôt GitHub.
2. Connecte Render à ce dépôt, puis choisis **New > Blueprint**.
3. Render lit `render.yaml` et crée le service `xplit-arena` avec le forfait Free.
4. Après le premier déploiement, partage l’adresse `https://xplit-arena.onrender.com` indiquée dans Render.

Le forfait gratuit est adapté pour essayer le jeu avec un petit groupe. Il peut s’endormir après 15 minutes sans trafic et redémarrer; les joueurs peuvent alors être déconnectés. Il ne propose pas de montée en charge horizontale sur le forfait Free. **Aucun hébergeur gratuit ne garantit 1 000 joueurs simultanés**; il faudra mesurer et augmenter les ressources avant d’annoncer cette capacité. Cette version répartit les joueurs en arènes de huit, mais le nombre de connexions réellement supporté dépend du CPU, de la mémoire et du trafic réseau alloués à l’instance.

Les pseudos et les statistiques ne sont pas enregistrés. Le jeu ne possède pas encore de compte, de classement persistant ni de protection anti-triche complète. Pour jouer par Internet, le serveur Render doit rester actif; il n’est pas nécessaire de télécharger une archive.

## Tester en local

1. Installer Node.js 18 ou plus récent.
2. Dans ce dossier, exécuter `npm install` puis `npm start`.
3. Ouvrir `http://localhost:3000`.

## Commandes

- Z Q S D : bouger
- Souris : regarder et viser
- Clic gauche : tirer
- 1 / 2 / 3 : fusil d’assaut, RPG, minigun
- E : shurikens de Ginx (recharge de 7 secondes)
- Maj : sprinter
- Échap : libérer la souris
