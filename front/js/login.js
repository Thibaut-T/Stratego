let form = document.getElementById('formulaire');
let inputPseudo = document.getElementById('idpseudo');
let inputRoom = document.getElementById('idroom');

let Pseudo = inputPseudo.value;

//export default Pseudo;

// Envoi du login via le module de connexion
form.addEventListener('submit', event => {
    
    event.preventDefault();
    loggerPseudo.sendLogin(inputPseudo.value);
    loggerRoom.sendRoom(inputRoom.value);
    
});