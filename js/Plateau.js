class Plateau{
	constructor(){
		this.map = Array(10); //On crée la map de 10x10 cases.
		for(let i = 0; i < 10; i++){
			this.map[i] = Array(10);
			for(let j = 0; j < 10; j++){
				this.map[i][j] = Array(-1, 0); //Les cases -1 symbolisent les cases vides sur lesquelles on peut se déplacer ; le 0 symbolise une case qui n'est pas occupée par un joueur.
			}
		}

		//Les cases -2 symbolisent les 8 cases au centre sur lesquelles on ne peut pas se déplacer.
		this.map[4][2] = Array(-2, 0);
		this.map[4][3] = Array(-2, 0);
		this.map[5][2] = Array(-2, 0);
		this.map[5][3] = Array(-2, 0);
		
		this.map[4][6] = Array(-2, 0);
		this.map[5][6] = Array(-2, 0);
		this.map[4][7] = Array(-2, 0);
		this.map[5][7] = Array(-2, 0);
	}

	initialiserPions(j1, j2){ //On place les pions un à un dans l'ordre pour chaque joueur.
		let valeurPion = 0;
		let pionsPlaces = 0;

		for(let i = 0; i < 4; i++){
			for(let j = 0; j < 10; j++){
				if(i == 3 && j >= 4){
					
				}

				else{
					this.map[i][j] = Array(valeurPion, j1.id); //Ici, on ajoute le pion et le joueur qui le possède.
					pionsPlaces++;
				}

				if(pionsPlaces == j1.pions[valeurPion]){ //Si on n'a plus de pions de cette valeur, on passe au pion suivant.
					pionsPlaces = 0;
					valeurPion++;
				}
			}
		}

		//Même fonctionnement ici mais pour le joueur 2.
		valeurPion = 0;
		pionsPlaces = 0;

		for(let i = 6; i < 10; i++){
			for(let j = 0; j < 10; j++){
				if(i == 9 && j >= 4){
					
				}
				
				else{
					this.map[i][j] = Array(valeurPion, j2.id);
					pionsPlaces++;
				}

				if(pionsPlaces == j2.pions[valeurPion]){
					pionsPlaces = 0;
					valeurPion++;
				}
			}
		}
	}
}