/**** Import npm libs ****/
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require("express-session")({
  // CIR2-chat encode in sha256
  secret: "eb8fcc253281389225b4f7872f2336918ddc7f689e1fc41b64d5c4f378cdc438",
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 2 * 60 * 60 * 1000,
    secure: false
  }
});
const sharedsession = require("express-socket.io-session");
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

/**** Project configuration ****/

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Init of express, to point our assets
app.use(express.static(__dirname + '/front/'));
app.use(urlencodedParser);
app.use(session);

// Configure socket io with session middleware
io.use(sharedsession(session, {
  // Session automatiquement sauvegardée en cas de modification
  autoSave: true
}));

// Détection de si nous sommes en production, pour sécuriser en https
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  session.cookie.secure = true // serve secure cookies
}

/**** Code ****/

app.get('/', (req, res) => {
  let sessionData = req.session;
  
  // Si l'utilisateur n'est pas connecté
  if (!sessionData.pseudo) {
    res.sendFile(__dirname + '/front/html/login.html');
  } else {
    res.sendFile(__dirname + '/front/html/index2.html');
  }
});

app.post('/login', body('login').isLength({ min: 3 }).trim().escape(), (req, res) => {
  const login = req.body.login

  // Error management
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    //return res.status(400).json({ errors: errors.array() });
  } else {
    // Store login
    req.session.pseudo = login;
    req.session.save()
    res.redirect('/');
  }
});

app.post('/idRoom', body('idRoom').isLength({ min: 3 }).trim().escape(), (req, res) => {
  const idRoom = req.body.idRoom

  // Error management
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    //return res.status(400).json({ errors: errors.array() });
  } else {
    // Store login
    req.session.idRoom = idRoom;
    req.session.save()
    res.redirect('/');
    }
});



let infoRoom = new Array();   //tableau pour stocker toutes les personnes co avec leur room
let nbrPersonne = 0

let quiJoue = new Array();//tableau pour stocker le nombre de message dans chaque room
let tailleQuiJoue = 0;

let plateauRoom = new Array();//tableau pour stocker le plateau de chaque room
let taillePlateauRoom = 0;

let joueurReady = new Array();//tableau pour stocker le plateau de chaque room
let taillejoueurReady = 0;

let startGame = new Array();
let tailleStartGame = 0;


io.on('connection', (socket) => {
  //console.log('Un élève s\'est connecté')

  

  socket.on("room", () => {

    io.to(socket.handshake.session.idRoom).emit('new-message', 'Serveur : '+ socket.handshake.session.pseudo+' vient de rejoindre la partie');

    infoRoom.push(socket.handshake.session.idRoom);   //ajout de la room et de la l'id de la nouvelle personne co
    infoRoom.push(socket.id)
    infoRoom.push(socket.handshake.session.pseudo)
    nbrPersonne +=3;

    let i = 0

    for (let j = 0; j <infoRoom.length ; j+=4) {            //parcour du tableau pour connaitre le nombre de personne dans la room
      if(infoRoom[j] == socket.handshake.session.idRoom){
        i++;
        if(i == 2){                              //s'il y a 2 personnes dans la room, on envoie à la deuxième personne sont id, 1
          infoRoom[j+3] = 1
          io.to(socket.id).emit('id', 1)
        }
      }
    }

    if(i == 1){                                //on dit à la premiere personne de la room qu'elle a l'id 0
      infoRoom.push(0)
      io.to(socket.id).emit('id', 0)
    }
    
    if(i<=2){                                            //s'il y a 2 personnes dans la room, on peut demarrer 
      socket.join(socket.handshake.session.idRoom)

      quiJoue[tailleQuiJoue] = socket.handshake.session.idRoom;     //on stock dans le tableau le nom de la room est le nombre de messages
      quiJoue[tailleQuiJoue+1] = 0;
      tailleQuiJoue +=2 ;

      plateauRoom.push(socket.handshake.session.idRoom);     //on stock le plateau de chaque room
      plateauRoom.push(0);
      taillePlateauRoom +=2;

      joueurReady.push(socket.id);    //on stock si la personne a fini de placer ses pions
      joueurReady.push(false);
      taillejoueurReady+=2;

      startGame.push(socket.handshake.session.idRoom);
      startGame.push(0);
      tailleStartGame+=2;


      let findplateau = 0;

      while (plateauRoom[findplateau] != socket.handshake.session.idRoom){    //on recupere le plateau de la room
        findplateau++;
      }
      if(plateauRoom[findplateau+1] == 0){
        plateauRoom[findplateau+1] = initialisationPlateau();
      }
      let plateau = plateauRoom[findplateau+1];
 
      let findId = 1
      while(infoRoom[findId] != socket.id){                                   //on recupere id 0 ou 1 de l'utilisateur
        findId +=4;
      }

      let findReady = 0                                                   //regarde si le joueur a finis de placer ses pions
      while(joueurReady[findReady] != socket.id){
        findReady+=2;
      }

      let findStartGame = 0;
      while(startGame[findStartGame] != socket.handshake.session.idRoom){
        findStartGame += 2;
      }
      

      io.to(socket.id).emit('plateau', idPlateau(cpy(plateau), infoRoom[findId+2]))    //on envoie au joueur le plateau de base

      socket.on('switch', (pos1x,pos1y,pos2x,pos2y, id) =>{                       //on recoi requete de switch d'elements
        
        if(joueurReady[findReady+1] == false){
          canSwitch(plateau, pos1x,pos1y,pos2x,pos2y,id);                       //on regarde si on peut switch
        }
        
        io.to(socket.id).emit('plateau', idPlateau(cpy(plateau), infoRoom[findId+2]))        //on renvoie le bon plateau
      });

      socket.on('finPlacement', () => {                                               //on recoit que la personne a finis de placer ses pions
        io.to(socket.handshake.session.idRoom).emit('new-message',socket.handshake.session.pseudo+' a fini de placer ses pions');
        joueurReady[findReady+1] = true
        startGame[findStartGame+1]++;

        if (startGame[findStartGame+1] == 2){
          io.to(socket.handshake.session.idRoom).emit('startGame','');

          let starter = 0
          while (infoRoom[starter] != socket.handshake.session.idRoom && infoRoom[starter+3] == 0){
            starter+=4;
          }
          io.to(socket.handshake.session.idRoom).emit('quiJoue', infoRoom[starter+2]);
        }
      });

      socket.on('attaque', (pos1x,pos1y,pos2x,pos2y, id) =>{
      
      let atk = new Array();                                                    //on sotck dans un tableau les coor de l'attaquant
      atk.push(pos1x);
      atk.push(pos1y)

      let def = new Array();                                                    //on stock dans un tableau les coor du defenseur
      def.push(pos2x) 
      def.push(pos2y)

      if (plateau[atk[0]][atk[1]][1] == id){                                    //on verifie que le pion attaquant appartient à la personne qui veut attaquer

        let i = 0;
        while (quiJoue[i] !=socket.handshake.session.idRoom){                 
          i+=2;
        }
        if(quiJoue[i+1]%2 == id){                                               //on regarde c'est le tour de la personne
          
          if (peutAttaquer(plateau,atk,def) != false){                          //s'il ne fait de déplacemnt interdit, il joue

            if(plateau[def[0]][def[1]][0] != -1){                               //s'il ne ne déplace pas sur une case vide
                
              let tmpAtk = plateau[atk[0]][atk[1]][1]                           //on dévoile les 2 pions qui se battent
              let tmpDef = plateau[def[0]][def[1]][1]
              
              plateau[atk[0]][atk[1]][1] = 2
              plateau[def[0]][def[1]][1] = 2

              let findId = 1
              while(infoRoom[findId] != socket.id){                                   //on recupere id 0 ou 1 de l'utilisateur
                findId +=4;
              }
              
              let findotherId = 0
              for(findotherId; findotherId<nbrPersonne;findotherId+=4){
                if (infoRoom[findotherId] == socket.handshake.session.idRoom && infoRoom[findotherId+1] != socket.id){
                  break;
                }
              }

              io.to(socket.id).emit('plateau', idPlateau(cpy(plateau), infoRoom[findId+2])) 
              io.to(infoRoom[findotherId+1]).emit('plateau', idPlateau(cpy(plateau), infoRoom[findotherId+3])) 

              plateau[atk[0]][atk[1]][1] = tmpAtk;
              plateau[def[0]][def[1]][1] = tmpDef;

              attaquer(plateau,atk,def)                                         //on regarde quel pion gagne la bataille
              
              setTimeout(function(){                

                io.to(socket.id).emit('plateau', idPlateau(cpy(plateau), infoRoom[findId+2]))         //on réaffiche le plateau avec les pions retournés
                io.to(infoRoom[findotherId+1]).emit('plateau', idPlateau(cpy(plateau), infoRoom[findotherId+3])) 
                
                let joueur = 0;

                for(let i = 0; i<nbrPersonne;i+=4){
                  if(infoRoom[i] == socket.handshake.session.idRoom){
                    if(infoRoom[i+3] == (quiJoue[i+1]%2)){
                      joueur+=4
                    }
                  }
                }
                quiJoue[i+1]+=1;
                io.to(socket.handshake.session.idRoom).emit('quiJoue', infoRoom[joueur+2]);       //on envoie un message dans le chat indiquant à qui jouer
              }, 1000);
            
            
              if(attaquer(plateau,atk,def, id) == "win"){                                     //si l'attaque est décisive pour la partie
                let joueur = 0

                for(let i = 0; i<nbrPersonne;i+=4){
                  if(infoRoom[i] == socket.handshake.session.idRoom){
                    if(infoRoom[i+3] == id){
                      break
                    }
                    else{
                      joueur+=4
                    }
                  }
                }
                io.to(socket.handshake.session.idRoom).emit("win", infoRoom[joueur+2], id);               //on envoie un message dans le chat avec le nom du joueur victorieux
              }
            }
            else{
              attaquer(plateau,atk,def, id)                                                               //si on attaque un ecase vide

              let findId = 1
              while(infoRoom[findId] != socket.id){                                   //on recupere id 0 ou 1 de l'utilisateur
                findId +=4;
              }

              let findotherId = 0
              for(findotherId; findotherId<nbrPersonne;findotherId+=4){
                if (infoRoom[findotherId] == socket.handshake.session.idRoom && infoRoom[findotherId+1] != socket.id){
                  break;
                }
              }
              
              io.to(socket.id).emit('plateau', idPlateau(cpy(plateau), infoRoom[findId+2])) 
              io.to(infoRoom[findotherId+1]).emit('plateau', idPlateau(cpy(plateau), infoRoom[findotherId+3])) 
                
              let joueur = 0

              for(let i = 0; i<nbrPersonne;i+=4){
                if(infoRoom[i] == socket.handshake.session.idRoom){
                  if(infoRoom[i+3] == (quiJoue[i+1]%2)){
                    joueur+=4
                  }
                }
              }
              quiJoue[i+1]+=1;
              io.to(socket.handshake.session.idRoom).emit('quiJoue', infoRoom[joueur+2]);                //si l'attaque est décisive pour la partie
            }
          }
        }
      }
      });

      socket.on('messageWin', (msg)=>{                                                                              //on emit le message de victoire avec le nom du vainqueur
        io.to(socket.handshake.session.idRoom).emit('new-message', socket.handshake.session.pseudo + ' : ' +msg);
      });



      socket.on('message', (msg, val) => {                        //si on recoit un message du client
        
          io.to(socket.handshake.session.idRoom).emit('new-message', socket.handshake.session.pseudo + ' : ' +msg);   //on renvoit le message à tous les membres de la room
        
      });

      socket.on('disconnect', () => {
        io.to(socket.handshake.session.idRoom).emit('new-message', 'Serveur : '+ socket.handshake.session.pseudo+' reviendra peut être');
        
        let i = 0

        for (let j=0; j <nbrPersonne ; j+=2) {
          if(infoRoom[j] == socket.handshake.session.idRoom){
            infoRoom[j] = 0;
            infoRoom[j+1] = 0
            infoRoom[j+2] = 0
            infoRoom[j+3] = 0
          }
        }

        socket.handshake.session.destroy();                                                       //o détruit la session pour que le joueur puisse se connecter à une autre partie
      });

    }
    else{                                   
      socket.on('disconnect', () => {                 //il y a deja 2 personnes dans la room
        socket.handshake.session.destroy();
      });
    }

  });
});

http.listen(4200, () => {
  console.log("Serveur lancé sur le port 4200")
});


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

  for (let i = 0; i<4;i++){
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

function canSwitch(plateau,pos1x,pos1y,pos2x,pos2y,id){                               //on vérifie si on peut intervertir les pions
  if(plateau[pos1x][pos1y][1] == id && plateau[pos2x][pos2y][1] == id){
    let tmp = plateau[pos1x][pos1y];
    plateau[pos1x][pos1y] = plateau[pos2x][pos2y];
    plateau[pos2x][pos2y] = tmp;
  }
}

function attaquer(plateau,atck, dfnd){ //Prend en paramètres la case qui attaque et celle qui défend.

    if(plateau[dfnd[0]][dfnd[1]][0] == 0){		//si on attaque le 0, on a gagne
    
      return "win"
    }
    else if (winFF(plateau, dfnd) == true){
      return "win"
    }
    else if(plateau[atck[0]][atck[1]][0] == 1 && plateau[dfnd[0]][dfnd[1]][0] == 10){ //Cas où l'espion attaque le maréchal.
       //On supprime une instance de ce pion du joueur attaqué.
      plateau[dfnd[0]][dfnd[1]][0] = plateau[atck[0]][atck[1]][0]
      plateau[dfnd[0]][dfnd[1]][1] = plateau[atck[0]][atck[1]][1]
      plateau[atck[0]][atck[1]][0] = -1  //La case devient neutre
      plateau[atck[0]][atck[1]][1] = -1

    } //La même logique est utilisée dans le code suivant.

    else if(plateau[atck[0]][atck[1]][0] == 3 && plateau[dfnd[0]][dfnd[1]][0] == 11){ //Cas où le démineur attaque une bombe.
    
      plateau[dfnd[0]][dfnd[1]][0] = plateau[atck[0]][atck[1]][0] 
      plateau[dfnd[0]][dfnd[1]][1] = plateau[atck[0]][atck[1]][1] 
      plateau[atck[0]][atck[1]][0] = -1
      plateau[atck[0]][atck[1]][1] = -1
    }

    else if(plateau[atck[0]][atck[1]][0] != 3 && plateau[dfnd[0]][dfnd[1]][0] == 11){ //Cas où une bombe est attaquée par autre chose qu'un démineur (car elle doit rester en place).
    
      plateau[atck[0]][atck[1]][0] = -1
      plateau[atck[0]][atck[1]][1] = -1
    }

    else if(plateau[atck[0]][atck[1]][0] == plateau[dfnd[0]][dfnd[1]][0]){ //Cas où les deux cases sont occupées par un pion de même rang (les deux tombent).
    
      plateau[atck[0]][atck[1]][0] = -1
      plateau[atck[0]][atck[1]][1] = -1
      plateau[dfnd[0]][dfnd[1]][0] = -1
      plateau[dfnd[0]][dfnd[1]][1] = -1
    }

    if(plateau[atck[0]][atck[1]][0] > plateau[dfnd[0]][dfnd[1]][0]) { //Cas où l'attaquant a un meilleur pion, et se retrouve donc sur une nouvelle case.
      
      plateau[dfnd[0]][dfnd[1]][0] = plateau[atck[0]][atck[1]][0] ;
      plateau[dfnd[0]][dfnd[1]][1] = plateau[atck[0]][atck[1]][1] ;
      plateau[atck[0]][atck[1]][0] = -1;
      plateau[atck[0]][atck[1]][1] = -1;
    
    }

    else{ //Le seul cas restant est celui où l'attaquant a un pion moins fort.
      plateau[atck[0]][atck[1]][0] = -1
      plateau[atck[0]][atck[1]][1] = -1
    }
}

function peutAttaquer(plateau,atck, dfnd){
  let bonneAttaque = true

  if(atck[0] != dfnd[0] && atck[1] != dfnd[1]) {       //pas de diagonales

    bonneAttaque = false;
  }
  
  else if (plateau[atck[0]][atck[1]][1] == plateau[dfnd[0]][dfnd[1]][1] ){      //friendly fire
    bonneAttaque = false;
  }

  else if((Math.abs(atck[0] - dfnd[0]) > 1  || Math.abs(atck[1] - dfnd[1]) > 1) && plateau[atck[0]][atck[1]][0] != 2){		//distance egale a 1 + ajout eclai
    bonneAttaque = false;

  }

  else if(plateau[dfnd[0]][dfnd[1]][0] == -2)		//aller dans l'eau
  {

    bonneAttaque = false;
  }


  else if(plateau[atck[0]][atck[1]][0] == 11 || plateau[atck[0]][atck[1]][0] == 0) {		//on ne peut pas bouger le drpeau et les bombes

    bonneAttaque = false;

  }

  else if(plateau[atck[0]][atck[1]][1] == plateau[dfnd[0]][dfnd[1]][1]) {		//on ne peut pas bouger le drpeau et les bombes

    bonneAttaque = false;

  }

  else if(plateau[atck[0]][atck[1]][0] == 2) {            //deplacement 2

    let pos1 

    if(atck[0] != dfnd[0]) {

      if(dfnd[0] > atck[0]) {

        for (let index = atck[0] + 1; index <= dfnd[0] ; index++) {
          
          if(plateau[index][atck[1]][1] >= 0) {

            pos1 = index
            break
          }

          else if(plateau[index][atck[1]][0] == -2) {

            pos1 = index
            break
          }
        }

        if (pos1 < dfnd[0]) {
          bonneAttaque = false
        }
        else if(pos1 == -2){
          bonneAttaque = false
        }

      }

      else if(dfnd[0] < atck[0]) {

        for (let index = atck[0] - 1; index >= dfnd[0] ; index--) {
          
          if(this.map[index][atck[1]][1] >= 0) {

            pos1 = index
            
            break
          }
          else if(this.map[index][atck[1]][1] == -2) {

            pos1 = index
            
            break
          }
        }
        if (pos1 > dfnd[0]) {

          bonneAttaque = false
        }
        else if(pos1 == -2){
          bonneAttaque = false
        }
      }

    }

    else if(atck[1] != dfnd[1]) {

      if(dfnd[1] > atck[1]) {

        for (let index = atck[1] + 1; index <= dfnd[1] ; index++) {
          
          if(this.map[atck[0]][index][1] >= 0) {

            pos1 = index
            
            break
          }
          else if (this.map[atck[0]][index][0] == -2) {

            pos1 = index
            
            break
          }


        }
        if (pos1 < dfnd[1]) {
          bonneAttaque = false;
        }
        else if( pos1 == -2){
          bonneAttaque = false;
        }
      }

      else if(dfnd[1] < atck[1]) {

        for (let index = atck[1] - 1; index >= dfnd[1] ; index--) {

          if(this.map[atck[0]][index][1] >= 0) {

            pos1 = index
            
            break
          }

        }   
        if (pos1 > dfnd[1]) {

          bonneAttaque = false
        }


      }

    }
    

  }

  return bonneAttaque;
}

function winFF(plateau, dfnd){
  let id = plateau[dfnd[0]][dfnd[1]][1]

  for(let i = 0; i < 10; i++){
    for(let j = 0; j < 10; j++){
        if((plateau[i][j][0] != 0 || plateau[i][j][0] != 11) && plateau[i][j][1] == id){          //si l'on trouve un autre pion qu'un drapeau ou une bombe, le joueur n'a pas perdu
          return false;
        }
    }
  }

  return true
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

function cpy(plateau){
  let cpy = Array(10); //On crée la map de 10x10 cases.
  for(let i = 0; i < 10; i++){
      cpy[i] = Array(10);
      for(let j = 0; j < 10; j++){
          cpy[i][j] = plateau[i][j]; //Les cases -1 symbolisent les cases vides sur lesquelles on peut se déplacer ; le -1 symbolise une case qui n'est pas occupée par un joueur.
      }
  }

  return cpy;

}