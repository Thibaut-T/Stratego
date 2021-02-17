class Plateau{
	constructor(){
		this.map = Array(10); //On crée la map de 10x10 cases.
		for(let i = 0; i < 10; i++){
			this.map[i] = Array(10);
			for(let j = 0; j < 10; j++){
				this.map[i][j] = -1; //Les cases -1 symbolisent les cases vides sur lesquelles on peut se déplacer.
			}
		}
		//Les cases -2 symbolisent les 8 cases au centre sur lesquelles on ne peut pas se déplacer.
		this.map[2][4] = -2;
		this.map[3][4] = -2;
		this.map[2][5] = -2;
		this.map[3][5] = -2;
		
		this.map[6][4] = -2;
		this.map[6][5] = -2;
		this.map[7][4] = -2;
		this.map[7][5] = -2;
	}
}