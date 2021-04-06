let chatForm = document.getElementById('chatForm');
let inputMessage = document.getElementById('input');


const btnFinPlac = document.getElementById('finPlacementBtn');
btnFinPlac.addEventListener('click', finPlacement);

let id=0;
let etat = 0;
let win = 0;
let gameStart = false;
let map;
let tmp = new Array(2);
let tmp2 = new Array(2); 


socket.emit('room', '');

socket.on('id', val => {

    id = val;
    map = initialisationPlateau();


    socket.on('plateau', map =>{
        if(win == 0){
            placement(map);                                                  //affiche de la map/plateau
            plateau = map;

            let paraPions = document.getElementById("paraPions")            //on indique en temps réel le nombre de pions restants
            Pions.removeChild(paraPions)
            let para = document.createElement("p")
            para.setAttribute("id", "paraPions")
            para.textContent = "Il te reste "+nbrPions(plateau, val)
            Pions.appendChild(para)
        }
    });

    listener();
    
    socket.on('startGame',() =>{
        if(win == 0){
            let item = document.createElement('li');
            item.textContent = 'La partie va démarrer';
            messages.appendChild(item);
            gameStart = true;
        }
    });

    socket.on('quiJoue',(player) =>{                                                        //ecris dans le chat qui joue
        if(win == 0){
            let item = document.createElement('li');
            item.textContent = "C\'est à "+player+" de jouer" ;
            messages.appendChild(item);
        }
    });

    socket.on('win',(winner, id) =>{                                                        
        win++
        let messageWin = winner + " a gagné !"
        swal(messageWin)
        if(val == id){

            socket.emit('messageWin', "J'ai gagné avec "+nbrPions(plateau, val))
        }
    });


    // Gestion de l'envoi d'un message
    chatForm.addEventListener('submit', event => {
        event.preventDefault(); //remember
        if (input.value) {
            socket.emit('message', inputMessage.value, val);
            inputMessage.value = '';
        }
    });

    // Affichage d'un message
    socket.on('new-message', msg => {
        let item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
    });
});


