function signup(){
    var request = new XMLHttpRequest();
    var username = DOMPurify.sanitize(document.getElementById("username").value);
    var email = DOMPurify.sanitize(document.getElementById("email").value);
    var password = DOMPurify.sanitize(document.getElementById("pswd").value);
    var password2 = DOMPurify.sanitize(document.getElementById("pswd2").value);
    if(!password == password2){
        alert("Password must be the same!");
    }
    request.open("POST", "http://fa19server.appspot.com/api/Users");
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onload = function(){
        var user = JSON.parse(this.response);
        localStorage.setItem("user", user.id);
        if (request.readyState == 4 && request.status == 200) {
            alert("successful sign up!");
            window.location.href = "login.html";
        } else {
            alert('An error has occured')
        }
    }
    request.send(`username=${username}&email=${email}&password=${password}`);
}