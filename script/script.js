
//Used to define if item should be updated or added
var update = 0;

//Saves selected data to know which id to edit
var selectedData; 
var imageName;

//Info about user
var user = localStorage.getItem("user");

var request = new XMLHttpRequest();

checkUser();

//If not logged in, sent to login.html
function checkUser(){
    if(user == null){
        window.location.href = "login.html";
    }
    else{
        loadContent();
    }
}

//Fills table with content
function loadContent(){
    request.open('GET', `http://fa19server.appspot.com/api/wishlists/myWishlist?access_token=${user}`, true);
    request.onload = function() {
        var data = JSON.parse(this.response);
        if (request.readyState == 4 && request.status == 200) {
            for(var i = 0;i<data.wishItems.length;i++) {
                insertToTable(data.wishItems[i]);
            }
        } else {
            window.location.href = "login.html";
        }
    }
    request.send();
}

//Inserts item to table
function insertToTable(data) {
    var table = document.getElementById("wishlist").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.length);
    cell1 = newRow.insertCell(0);
    cell1.innerHTML = data.item;
    cell2 = newRow.insertCell(1);
    cell2.innerHTML = "$" + data.price;
    cell3 = newRow.insertCell(2);
    cell3.innerHTML = data.category;
    cell4 = newRow.insertCell(3);
    cell4.innerHTML = `<img src="${localStorage.getItem(data.image)}" alt="${data.image}" height="40" width="40">`;
    cell5 = newRow.insertCell(4);
    cell5.innerHTML = data.comment;
    cell6 = newRow.insertCell(5);   
    var edBtn = document.createElement("BUTTON");
    var delBtn = document.createElement("BUTTON");
    edBtn.innerHTML = "Edit";
    delBtn.innerHTML = "Delete";
    edBtn.onclick = function(){
        onEdit(data);
        selectedData = data;
    }
    delBtn.onclick = function(){
        onDelete(data);
    }
    cell6.appendChild(edBtn);
    cell6.appendChild(delBtn);
}

//Add item button. Opens dialog
function addWish(){
    update = 0;
    var modal = document.getElementById("dialogBox");
    modal.showModal();
}

//Submit-button in form. Checks if item is new or updated, and calls appropriate function
function onFormSubmit() {
    var formData = readFormData();
    if (update == 1){
        updateItem(formData);
    }
    else{
        insertNewItem(formData);
    }
    resetForm();
    var modal = document.getElementById("dialogBox");
    modal.close();
}

//Inserts new item 
function insertNewItem(formData){
    request.open('POST', `http://fa19server.appspot.com/api/wishlists?access_token=${user}`);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onload = function(){
        if (request.readyState == 4 && request.status == 200) {
            resetTable();
            loadContent();
        } else {
            alert('Unable to insert item.')
        }
    }
    request.send(`item=${formData.get('item')}&price=${Number(formData.get('price'))}&category=${formData.get('category')}&image=${formData.get('image')}&comment=${formData.get('comment')}`);
}

//Send update command to server
function updateItem(formData){
    request.open('POST', `http://fa19server.appspot.com/api/wishlists/${selectedData.id}/replace?access_token=${user}`);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onload = function(){
        if (request.readyState == 4 && request.status == 200) {
            resetTable();
            loadContent();
        } else {
            alert('Unable to update item.')
            resetTable();
        }
    }
    request.send(`item=${formData.get('item')}&price=${Number(formData.get('price'))}&category=${formData.get('category')}&image=${formData.get('image')}&comment=${formData.get('comment')}`);
}

//Reads input from form
function readFormData() {
    var formData = new FormData();
    formData.append("item", DOMPurify.sanitize(document.getElementById("item").value));
    formData.append("price", DOMPurify.sanitize(document.getElementById("price").value));
    formData.append("category", document.getElementById("category").value);
    formData.append("image", imageName);//localStorage.getItem(imageName));
    formData.append("comment", DOMPurify.sanitize(document.getElementById("comment").value));
    return formData;
}

//Sets all form fields to be empty
function resetForm() {
    document.getElementById("item").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("image").value = "";
    document.getElementById("comment").value = "";
}

//Resets the table
function resetTable(){
    var new_tbody = document.createElement('tbody');
    var old_tbody = document.getElementById('wishlist').getElementsByTagName('tbody')[0];
    old_tbody.parentNode.replaceChild(new_tbody, old_tbody);
}

//Edit selected item. Opens dialog with pre-filled input
function onEdit(data) {
    addWish();
    document.getElementById("item").value = data.item;
    document.getElementById("price").value = data.price;
    document.getElementById("category").value = data.category;
    document.getElementById("image").value = "";
    document.getElementById("comment").value = data.comment;
    update = 1;
}


//Delete selected item
function onDelete(data) {
    if (confirm('Are you sure to delete this record ?')) {
        request.open('DELETE', `http://fa19server.appspot.com/api/wishlists/${data.id}?access_token=${user}`);
        request.onload = function(){
            if (request.readyState == 4 && request.status == 200) {
                resetTable();
                loadContent();
            } else {
                alert('Could not delete item.')
            }
        }
        request.send();
    }
}

//Cancel button in dialog
function cancelFunc(){
    var modal = document.getElementById("dialogBox");
    modal.close();
}

//Logout
function logout(){
    request.open('POST', `http://fa19server.appspot.com/api/Users/logout?access_token=${user}`);
    request.onload = function(){
        alert("successfully logged out!");
        window.location.href = "login.html";
        localStorage.removeItem(user);
    }
    request.send();
}

//Handle upload of images. Using Firebase.
var fileButton= document.getElementById("image");


function uploadImage(e){
    var imageFile = e.files[0];
    var file = imageFile;

    // Create a storage reference
    var storageRef = firebase.storage().ref("images/" + file.name);

    // Create the file metadata
    var metadata = {
        contentType: 'image/jpeg'
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = storageRef.put(file, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed', 
    function progress(snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
            break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
            break;
        }
    }, function(error) {
                
    }, function() {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            console.log('File available at', downloadURL);
                localStorage.setItem(file.name,downloadURL);
                imageName = file.name;
            });
        });
}