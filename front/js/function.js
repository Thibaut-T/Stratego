function finPlacement(){
    socket.emit('finPlacement','');
}

function placement(map){
    let Plateau = document.getElementById("Plateau");
        
		for (let row = 0; row < map.length; ++row) {
            for (let cell = 0; cell < map.length; ++cell) {		
				for (let i = 0; i < Plateau.rows[row].cells[cell].childElementCount; ++i) {
					Plateau.rows[row].cells[cell].removeChild(Plateau.rows[row].cells[cell].firstChild) //Il permet de ne pas rajouter une "image" en plus à chaque case qu'il parcourt dans le tableau
				}

				let img = document.createElement('img')
            Plateau.rows[row].cells[cell].appendChild(img)
            img.id = 'image';

            switch(map[row][cell][0]){
                case 0:
                    img.src = 'pictures/0.png';
                    break;
                case 1:
                    img.src = 'pictures/1.png';
                    break;
                case 2:
                    img.src = 'pictures/2.png';
                    break;
                case 3:
                    img.src = 'pictures/3.png';
                    break;
                case 4:
                    img.src = 'pictures/4.png';
                    break;
                case 5:
                    img.src = 'pictures/5.png';
                    break;
                case 6:
                    img.src = 'pictures/6.png';
                    break;
                case 7:
                    img.src = 'pictures/7.png';
                    break;
                case 8:
                    img.src = 'pictures/8.png';
                    break;
                case 9:
                    img.src = 'pictures/9.png';
                    break;
                case 10:
                    img.src = 'pictures/10.png';
                    break;
                case 11:
                    img.src = 'pictures/11.png';
                    break;
                case -2:
                    img.src= 'pictures/fond-bleu.png';
                    break;
                case -3:
                    img.src= 'pictures/-3.png';
                    break;
            }
				/*let numero = document.createElement('h1');			
				Plateau.rows[row].cells[cell].appendChild(numero);
				numero.append(map[row][cell][0]);
                */
			}
		}
}

function listener() {

    let Plateau = document.getElementById("Plateau")

    for (let line = 0; line <map.length; line++) {
         
        for (let k = 0; k <map.length; k++) { //création d'un évenement de type "click" dans chaque case de la grille de jeu
            
            Plateau.rows[line].cells[k].addEventListener('click', () => {
                click_event(line, k);
            });
        }
    }
}

function click_event(pos_x, pos_y) { 

    if(etat == 0) {                                                             //position du pion 1
        tmp[0] = pos_x
        tmp[1] = pos_y
        etat=1
        
    }

    else{                                                                   //position du pion 2
        tmp2[0] = pos_x
        tmp2[1] = pos_y

        etat = 0
        
        if(gameStart == false){                                                     //si la game n'a pas demarré, on switch les 2 pions
            socket.emit('switch',tmp[0],tmp[1],tmp2[0],tmp2[1], id);
        }
        else{                                                                       //sinon, c'est la phase d'attaque
            socket.emit('attaque',tmp[0],tmp[1],tmp2[0],tmp2[1], id);
        }

    }	
        
}


function initialisationPlateau(){
    map = Array(10); //On crée la map de 10x10 cases.
    for(let i = 0; i < 10; i++){
        map[i] = Array(10);
        for(let j = 0; j < 10; j++){
            map[i][j] = Array(-1, -1); //Les cases -1 symbolisent les cases vides sur lesquelles on peut se déplacer ; le -1 symbolise une case qui n'est pas occupée par un joueur.
        }
    }
  
    map[4][2] = Array(-2, -1);
    map[4][3] = Array(-2, -1);
    map[5][2] = Array(-2, -1);
    map[5][3] = Array(-2, -1);
    
    map[4][6] = Array(-2, -1);
    map[5][6] = Array(-2, -1);
    map[4][7] = Array(-2, -1);
    map[5][7] = Array(-2, -1);
  
    let pions = [1, 1, 8, 5, 4, 4, 4, 3, 2, 1, 1, 6];
    let valeurPion = 0;
    let pionsPLaces = 0;
  
    for (let i = 0; i<4;i++){                       //on place les pions spécifiques
      for(let j= 0;j<10;j++){
        map[i][j] = Array(valeurPion, 0);
        map[9-i][j] = Array(valeurPion, 1);
        pionsPLaces++;
        if(pionsPLaces == pions[valeurPion]){
          pionsPLaces = 0
          valeurPion++;
        }
      }
    }
  
    return map
  }

function idPlateau(map, id){                  //fonction qui retourne le tableau avec les pions adversaires cachés
for(let i = 0; i < 10; i++){
    for(let j = 0; j < 10; j++){
        if (map[i][j][1] != id && map[i][j][1]>=0){
            if (map[i][j][1] != 2){
                map[i][j] = Array(-3,-3);
            }
        }
    }
}
return map;
}

function nbrPions(map, id){
    let pions = new Array();

    let mapPions = new Map();

    mapPions.set(0, "Drapeau")
    mapPions.set(1, "Espion")
    mapPions.set(2, "Eclaireur(s)")
    mapPions.set(3, "Démineur(s)")
    mapPions.set(4, "Sergent(s)")
    mapPions.set(5, "Lieutenant(s)")
    mapPions.set(6, "Capitaine(s)")
    mapPions.set(7, "Commandat(s)")
    mapPions.set(8, "Colonnel(s)")
    mapPions.set(9, "Général")
    mapPions.set(10, "Maréchal")
    mapPions.set(11, "Bombe(s)")


    for(let i = 0;i<12;i++){
        pions.push(0)
    }

    for(let i = 0; i < 10; i++){                                //on détermine le nombre de chaque pions restant
        for(let j = 0; j < 10; j++){
                if (map[i][j][1] == id){
                    pions[map[i][j][0]]++;
                }
        }
    }

    let message = ""                                            //on écrit le message indiquant les pions restant
    for(let i =0; i<12;i++){
        message += pions[i]+" "
        message += mapPions.get(i)+" "
        if(i != 11){
            message += ", "
        }
    }

    return message
}

function valPions(){
    var img = document.createElement("img");
    img.src = "../pictures/pions.png";
    swal(img);

}

function regles(){
    swal("Règles du stratetgo","Les pièces représentent des unités militaires et ont deux faces. Une face ne peut être vue que par un seul joueur à la fois, l'autre ne voyant que la couleur de la pièce. Les pièces sont placées de telle façon que le joueur ne voit que le rang de ses propres pièces.\n Au début de la partie chaque joueur dispose ses pièces comme il l'entend sur ses quatre premières rangées. Cette pré-phase du jeu est stratégique et déterminante pour la suite de la partie.\n Chaque joueur déplace une pièce d'une case par tour : à gauche, à droite, en avant ou en arrière (pas en diagonale). Une attaque se produit quand le joueur déplace sa pièce sur une case déjà occupée par l'adversaire. Chaque joueur montre alors sa pièce à l'adversaire. La pièce la plus forte reste en jeu, l'autre est éliminée en cas d'égalité, les deux sont éliminées. \n\n Le but du jeu est de capturer le Drapeau de l'adversaire ou d'éliminer assez de pièces adverses afin que l'adversaire ne puisse plus faire de déplacements.\n\nCertaines pièces obéissent à des règles spéciales :\nSi l'Espion, grade le plus faible, attaque le Maréchal, grade le plus élevé, l'Espion gagne (si le Maréchal attaque en premier, le Maréchal gagne)\nToute pièce attaquant une Bombe est éliminée, sauf le Démineur qui prend alors la place de la Bombe (si une pièce autre qu'un Démineur attaque une Bombe, cette pièce est éliminée, et la Bombe reste en place jusqu'à l'éventuelle attaque d'un Démineur)\nL'Éclaireur peut se déplacer d'autant de cases libres qu'il le souhaite, en ligne droite. ")
}