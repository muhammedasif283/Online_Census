


/* =========================
   STATE
========================= */
let records = JSON.parse(localStorage.getItem("censusRecords")) || [];
let editIndex = null;

/* =========================
   LOGIN
========================= */
document.getElementById("login-form").addEventListener("submit", function(e) {

    e.preventDefault();

    const role = document.getElementById("loginRole").value;
    const password = document.getElementById("password").value;

    if(role === "user" && password === "user123"){

        localStorage.setItem("censusLoggedIn", "true");
        localStorage.setItem("role", "user");
        localStorage.setItem("loggedUserId", Date.now());

        document.getElementById("login-page").style.display = "none";
        document.getElementById("census-dashboard").classList.remove("hidden");

    }

    else if(role === "admin" && password === "admin123"){

        localStorage.setItem("censusLoggedIn", "true");
        localStorage.setItem("role", "admin");

        window.location.href = "records.html";

    }

    else{

        alert("Invalid login credentials");

    }

});

// document.getElementById("login-form").addEventListener("submit", e => {
//     e.preventDefault();

//     // ✅ create login session
//     localStorage.setItem("censusLoggedIn", "true");

//     document.getElementById("login-page").style.display = "none";
//     document.getElementById("census-dashboard").classList.remove("hidden");
//     renderRecords();
// });



/* =========================
   LOGOUT
========================= */

function handleLogout(){

    localStorage.clear();

    window.location.href = "index.html";

}

// function handleLogout() {
//     localStorage.removeItem("censusLoggedIn");
//     localStorage.removeItem("editIndex");
//     location.reload();
// }


/* =========================
   SAVE TO STORAGE
========================= */
function saveToStorage() {
    localStorage.setItem("censusRecords", JSON.stringify(records));
}

/* =========================
   SUBMIT / UPDATE
========================= */



function finalizeUpload() {

    const record = {

        userId: localStorage.getItem("loggedUserId"),

        street: street.value,
        ward: ward.value,
        house: house.value,
        headName: headName.value,
        category: category.value,
        members: members.value,

        water: water.checked,
        electricity: electricity.checked,
        internet: internet.checked,
        land: land.checked

    };

    records.push(record);

    localStorage.setItem("censusRecords", JSON.stringify(records));

    alert("Report Submitted Successfully");

    document.getElementById("submission-form").reset();

}


// function finalizeUpload() {

//     const record = {
//         street: document.getElementById("street").value,
//         ward: document.getElementById("ward").value,
//         house: document.getElementById("house").value,
//         headName: document.getElementById("headName").value,
//         category: document.getElementById("category").value,
//         members: document.getElementById("members").value,
//         water: document.getElementById("water").checked,
//         electricity: document.getElementById("electricity").checked,
//         internet: document.getElementById("internet").checked,
//         land: document.getElementById("land").checked
//     };

//     if (!record.ward || !record.house || !record.headName) {
//         alert("Please fill all required fields");
//         return;
//     }

//     if (editIndex === null) {
//         records.push(record);
//         alert("✅ Report Submitted Successfully");
//     } else {
//         records[editIndex] = record;
//         editIndex = null;
//         alert("✏️ Report Updated Successfully");
//     }

//     saveToStorage();
//     document.getElementById("submission-form").reset();
//     renderRecords();



//     if (editIndex === null) {
//         records.push(record);
//     } else {
//         records[editIndex] = record;
//         editIndex = null;
//     }

//     saveToStorage();
//     document.getElementById("submission-form").reset();

//     // 👉 redirect to records page
//     window.location.href = "records.html";


// }

/* =========================
   RENDER LIST
========================= */



function renderRecords() {

    const list = document.getElementById("recordsList");
    list.innerHTML = "";

    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("loggedUserId");

    records.forEach((r,i)=>{

        if(role === "user" && r.userId != userId){
            return;
        }

        const li = document.createElement("li");

        li.innerHTML = `
        <strong>${r.headName}</strong> (${r.members})<br>
        ${r.street}, Ward ${r.ward}<br>
        House: ${r.house}<br><br>

        <button onclick="editRecord(${i})">Edit</button>
        <button onclick="deleteRecord(${i})">Delete</button>
        `;

        list.appendChild(li);

    });

}

// function renderRecords() {
//     const list = document.getElementById("recordsList");
//     list.innerHTML = "";

//     records.forEach((r, i) => {
//         const li = document.createElement("li");
//         li.style.listStyle = "none";
//         li.style.marginBottom = "15px";
//         li.style.padding = "15px";
//         li.style.borderRadius = "10px";
//         li.style.background = "rgba(255,255,255,0.12)";

//         li.innerHTML = `
//             <strong>${r.headName}</strong> (${r.members} members)<br>
//             ${r.street}, Ward ${r.ward}<br>
//             House: ${r.house} | ${r.category}<br><br>
//             <button onclick="editRecord(${i})">✏️ Edit</button>
//             <button onclick="deleteRecord(${i})">🗑️ Delete</button>
//         `;

//         list.appendChild(li);
//     });


// }

/* =========================
   EDIT
========================= */
function editRecord(index) {
    const r = records[index];
    editIndex = index;

    street.value = r.street;
    ward.value = r.ward;
    house.value = r.house;
    headName.value = r.headName;
    category.value = r.category;
    members.value = r.members;
    water.checked = r.water;
    electricity.checked = r.electricity;
    internet.checked = r.internet;
    land.checked = r.land;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================
   DELETE
========================= */
function deleteRecord(index) {
    if (confirm("Are you sure you want to delete this record?")) {
        records.splice(index, 1);
        saveToStorage();
        renderRecords();
    }
}

const storedEditIndex = localStorage.getItem("editIndex");

if (storedEditIndex !== null) {
    editIndex = parseInt(storedEditIndex);
    const r = records[editIndex];

    street.value = r.street;
    ward.value = r.ward;
    house.value = r.house;
    headName.value = r.headName;
    category.value = r.category;
    members.value = r.members;
    water.checked = r.water;
    electricity.checked = r.electricity;
    internet.checked = r.internet;
    land.checked = r.land;

    localStorage.removeItem("editIndex");
}



function handleLogout() {
    localStorage.removeItem("censusLoggedIn");
    localStorage.removeItem("loggedUserId");
    localStorage.removeItem("editIndex");
    location.reload();
}
