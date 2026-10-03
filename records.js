// 🔐 LOGIN CHECK
if (localStorage.getItem("censusLoggedIn") !== "true") {
    alert("Unauthorized access. Please login first.");
    window.location.href = "index.html";
}


let records = JSON.parse(localStorage.getItem("censusRecords")) || [];


function renderRecords() {

    const list = document.getElementById("recordsList");
    list.innerHTML = "";

    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("loggedUserId");

    records.forEach((r, i) => {

        // normal users see only their records
        if (role === "user" && r.userId != userId) return;

        const li = document.createElement("li");

        li.style.listStyle = "none";
        li.style.marginBottom = "15px";
        li.style.padding = "15px";
        li.style.borderRadius = "10px";
        li.style.background = "rgba(255,255,255,0.12)";

        li.innerHTML = `
            <strong>${r.headName}</strong> (${r.members})<br>
            ${r.street}, Ward ${r.ward}<br>
            House: ${r.house}<br><br>

            <button class="action-btn edit-btn" onclick="editRecord(${i})">✏️ Edit</button>
            <button class="action-btn delete-btn" onclick="deleteRecord(${i})">🗑️ Delete</button>
        `;

        list.appendChild(li);

    });

}



// function renderRecords() {
//     const list = document.getElementById("recordsList");
//     list.innerHTML = "";

//     const isLoggedIn = localStorage.getItem("censusLoggedIn") === "true";

//     records.forEach((r, i) => {
//         const li = document.createElement("li");
//         li.style.listStyle = "none";
//         li.style.marginBottom = "15px";
//         li.style.padding = "15px";
//         li.style.borderRadius = "10px";
//         li.style.background = "rgba(255,255,255,0.12)";
//         li.style.backdropFilter = "blur(6px)";
//         li.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";

//         li.innerHTML = `
//             <strong>${r.headName}</strong> (${r.members})<br>
//             ${r.street}, Ward ${r.ward}<br>
//             House: ${r.house}<br><br>
//             ${
//                 isLoggedIn
//                 ? `
//                 <button class="action-btn edit-btn" onclick="editRecord(${i})">✏️ Edit</button>
//                 <button class="action-btn delete-btn" onclick="deleteRecord(${i})">🗑️ Delete</button>
//                 `
//                 : `<em style="color:#ccc;">Login required to modify records</em>`
//             }
//         `;

//         list.appendChild(li);
//     });
// }




function editRecord(index) {
    localStorage.setItem("editIndex", index);
    window.location.href = "index.html";
}


function deleteRecord(index) {
    if (confirm("Delete this record?")) {
        records.splice(index, 1);
        localStorage.setItem("censusRecords", JSON.stringify(records));
        renderRecords();
    }
}

function goBack() {
    localStorage.removeItem("editIndex");
    window.location.href = "index.html";
}

renderRecords();
