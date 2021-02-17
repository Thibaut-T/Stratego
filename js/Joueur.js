class Joueur{
	constructor(id){
		this.id = id; //Indique si c'est le joueur 1 ou 2, pour faciliter les méthodes.
		this.pions = [1, 1, 8, 5, 4, 4, 4, 3, 2, 1, 1]; //Le tableau qui contient la quantité de pions pour chaque type : pions[0] = 1 drapeau, pions[1] = 1 espion, etc.
	}
}
