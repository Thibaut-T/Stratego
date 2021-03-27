class Plateau{
	constructor(j1, j2){
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
		this.listener();
		this.initialiserPions(j1, j2);
	}

	initialiserPions(j1, j2){ //On place les pions un à un dans l'ordre pour chaque joueur.
		let valeurPion = 0;
		let pionsPlaces = 0;

		for(let i = 0; i < 4; i++){
			for(let j = 0; j < 10; j++){
				
				this.map[i][j] = Array(valeurPion, j1); //Ici, on ajoute le pion et le joueur qui le possède.
				pionsPlaces++;

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

				this.map[i][j] = Array(valeurPion, j2);
				pionsPlaces++;

				if(pionsPlaces == j2.pions[valeurPion]){
					pionsPlaces = 0;
					valeurPion++;
				}
			}
		}
		this.Placement();
	}

	listener() {

		let Plateau = document.getElementById("Plateau")

		for (let line = 0; line < this.map.length; line++) {
			 
			for (let k = 0; k < this.map.length; k++) { //création d'un évenement de type "click" dans chaque case de la grille de jeu
				
				Plateau.rows[line].cells[k].addEventListener('click', () => {
                    this.click_event(line, k);
                });
			}
		}
	}

	click_event(pos_x, pos_y) {                                                                    
		this.map[pos_x][pos_y][0] += 1;
		this.Placement();
	}

	Placement(){
		let Plateau = document.getElementById("Plateau");
        
		for (let row = 0; row < this.map.length; ++row) {
            for (let cell = 0; cell < this.map.length; ++cell) {		
				for (let i = 0; i < Plateau.rows[row].cells[cell].childElementCount; ++i) {
					Plateau.rows[row].cells[cell].removeChild(Plateau.rows[row].cells[cell].firstChild) //Il permet de ne pas rajouter une "image" en plus à chaque case qu'il parcourt dans le tableau
				}

				//let img = document.createElement('img');
				//Plateau.rows[row].cells[cell].appendChild('img');
				//img.id = 'image';
				//Il manque la ligne où on choisit une image dans nos fichiers mais tranquille
				
				let numero = document.createElement('h1');			
				Plateau.rows[row].cells[cell].appendChild(numero);
				numero.append(this.map[row][cell][0]);

			}
		}
	}

	placerPionsDebut(joueur, caseInitiale, caseVoulue){ //Pour le placement des pions avant le début de la partie : chaque joueur peut échanger la position de tous ses pions entre eux.
	//IMPORTANT : On spécifie le joueur en paramètre, sinon on pourrait déplacer les pions de n'importe quel joueur.
		if((caseInitiale[1] && caseVoulue[1]) == joueur){
			tmp = caseInitiale[0];
			caseInitiale[0] = caseVoulue[0];
			caseVoulue[0] = tmp;
		}
	}

	//On utilise ça dès qu'un joueur veut se déplacer sur une case possédée par l'autre joueur.
//Du coup on va la foutre dans la fonction de déplacement et ça se lancera quand les deux cases auront un joueur différent.
	attaquer(atck, dfnd){ //Prend en paramètres la case qui attaque et celle qui défend.
		if(dnfd[0] == 0){
			//Si le drapeau est attaqué l'attaquant gagne, faut encore créer la fonction parce que je sais pas comment on compte l'implémenter.
		}

		else if(atck[0] == 1 && dfnd[0] == 10){ //Cas où l'espion attaque le maréchal.
			dfnd[1].detruirePion(10); //On supprime une instance de ce pion du joueur attaqué.
			dfnd[0] == -1; //La case devient neutre
			dnfd[1] == 0;
		} //La même logique est utilisée dans le code suivant.

		else if(atck[0] == 3 && dfnd[0] == 11){ //Cas où le démineur attaque une bombe.
			atck[1].detruirePion(atck[0]);
			atck[0] == -1;
			atck[1] == 0;
		}

		else if(atck[0] != 3 && dfnd[0] == 11){ //Cas où une bombe est attaquée par autre chose qu'un démineur (car elle doit rester en place).
			atck[1].detruirePion(atck[0]);
			atck[0] == -1;
			atck[1] == 0;
		}

		else if(atck[0] == dfnd[0]){ //Cas où les deux cases sont occupées par un pion de même rang (les deux tombent).
			atck[1].detruirePion(atck[0]);
			atck[0] == -1;
			atck[1] == 0;
			dfnd[1].detruirePion(dfnd[0]);
			dfnd[0] == -1;
			dnfd[1] == 0;
		}

		else if(atck[0] > dfnd[0]){ //Cas où l'attaquant a un meilleur pion, et se retrouve donc sur une nouvelle case.
			dfnd[1].detruirePion(dfnd[0]);
			dfnd[0] == atck[0]; //Déplacement de l'attaquant.
			dnfd[1] == atck[1];
			atck[0] == -1;
			atck[1] == 0;
		}

		else{ //Le seul cas restant est celui où l'attaquant a un pion moins fort.
			atck[1].detruirePion(atck[0]);
			atck[0] == -1;
			atck[1] == 0;
		}
	}
}