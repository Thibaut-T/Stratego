let loggerPseudo = (function(){

    function postLog(username) {
        console.log(username);
        $.ajax({
            type: "POST",
            url: "/login/",
            data: {
                login: username
            },
            success: () => {
                window.location.href = "/";
            },
        });
    }

    return {
        sendLogin(username) {
            postLog(username);
        }, 
        
    }
})();

let loggerRoom = (function(){

    function postRoom(room) {
        console.log(room);
        $.ajax({
            type: "POST",
            url: "/idRoom/",
            data: {
                idRoom: room
            },
            success: () => {
                window.location.href = "/";
            },
        });
    }

    return {
        sendRoom(room) {
            postRoom(room);
        }, 
        
    }
})();

