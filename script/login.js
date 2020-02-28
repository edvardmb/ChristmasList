function login(){
    localStorage.removeItem("user");
    var request = new XMLHttpRequest();
    var username = DOMPurify.sanitize(document.getElementById("username").value);
    var password = DOMPurify.sanitize(document.getElementById("pswd").value);
    request.open("POST", "http://fa19server.appspot.com/api/Users/login");
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onload = function(){
        var user = JSON.parse(this.response);
        localStorage.setItem("user", user.id);
        if (request.readyState == 4 && request.status == 200) {
            window.location.href = "index.html";
        } else {
            alert('Wrong username or password')
        }
    }
    request.send(`username=${username}&password=${password}`);
}