class Joueur{ 
	constructor(id){
		this.pret = false; //On utilise ça pour savoir si le joueur a terminé de placer ses pions au début.
		this.id = id; //Indique si c'est le joueur 1 ou 2, pour faciliter les méthodes.
		this.pions = [1, 1, 8, 5, 4, 4, 4, 3, 2, 1, 1, 6]; //Le tableau qui contient la quantité de pions pour chaque type : pions[0] = 1 drapeau, pions[1] = 1 espion, etc.
		//Y'a moyen que cette liste soit inutile en fait, à voir si on la garde
	}

	detruirePion(valeur){ //On indique la valeur du pion et on en supprime une copie dans la liste des pions
		this.pions[valeur] -= 1;
	}
}