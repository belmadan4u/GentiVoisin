const prestation = document.querySelector("#prestation");
const emprunt = document.querySelector("#emprunt");
const tbody = document.querySelector("#table-body");
const nbNotif = document.querySelector("#notif");
const table = document.querySelector("#table");

function getCookie(name){
    const cookies = document.cookie.split(';');

    for (let i of cookies) {
      let cookie = i.trim();
  
      if (cookie.startsWith(name)) {
        return cookie.substring(name.length + 1, cookie.length);
      }
    }
    return "";
}


const idUser = getCookie("id_user");

document.addEventListener("DOMContentLoaded", function() {
    if (idUser == null || idUser == "") {
        window.location = "index.html";
    } else { 
        loadDemandeTransaction();
        loadDemandeProlongation();
    }
});


function supprimerDonnees() {
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
}

function sortByDate(a, b) {
    if (new Date(a[3]) < new Date(b[3])) {
        return 1;
    }
    if (new Date(a[3]) > new Date(b[3])) {
        return -1;
    }
    return 0;
}

let tableauCorps = [];


//Ces deux fonctions sont celles où l'utilsateur est le propriétaire des prestations, a mettre dans un filter peut etre ?

//on récupère les transaction où l'utilisateur est propriétaire, puis on prend toutes les prolongations concernant ses transaction où la prolongation n'a pas été acceptée.

function loadDemandeTransaction() {
    fetch('https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byPropriobyStatut?idGenti='+idUser+'&statut=0')
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur HTTP, status : " + response.status);
            }
            return response.json();
        })
        .then(data => {
            if(data != []) {
                for(let donnee of data) {
                    let tab = [];
                    let personne = donnee["gentiVoisin"]["nom"] + " " + donnee["gentiVoisin"]["prenom"];
                    tab.push("Demande de transaction");
                    tab.push(donnee["prestation"]["libelle"]);
                    tab.push(personne);
                    tab.push(donnee["dateDemandeTransaction"]);
                    tab.push("./mesDemandes.html");//a modifier
                    tableauCorps.push(tab);
                }
            }
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données :", error);
        });
}

function loadDemandeProlongation() {
    fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byPropriobyStatut?idGenti="+idUser+"&statut=0")
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur HTTP, status : " + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
            for(let donnee of data) {
                fetch('https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prolongation/byTransaction?idTransaction='+donnee["idTransaction"])
                .then( response => {
                    return response.json();
                })
                .then(data => {
                    console.log(data)
                    if(data != []) {
                        for(let donnee of data) {
                            let tab = [];
                            let personne = donnee["transaction"]["gentiVoisin"]["nom"] + " " + donnee["transaction"]["gentiVoisin"]["prenom"];
                            tab.push("Demande de prolongation");
                            tab.push(donnee["transaction"]["prestation"]["libelle"]);
                            tab.push(personne)
                            tab.push(donnee["dateDemande"]);
                            tab.push("./mesDemandes.html"); //a modifier
                            tableauCorps.push(tab);
                        }
                    }  
                })

            }
            let res = tableauCorps.sort(sortByDate);
            for(let i = 0; i < res.length; i++) {
                res[i][3] = convertirDate(res[i][3]);
                
            }
            console.log(tableauCorps);
            afficherDonnees(res); 
            
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données :", error);
        });
}



function convertirDate(dateAnglaise) {
    // Extraire le jour, le mois et l'année
    return dateAnglaise.split('-').reverse().join("/")
}
/*
window.onload = function () {
    const idUser = 0;//getCookie("id_user");
    console.log(idUser);
    console.log(idUser);
    if(idUser == null || idUser == "") {
        window.location = "index.html";
    } else { 
        loadDemandeTransaction();
        loadDemandeProlongation();
    }
}*/




function afficherDonnees(Tab) {

    let tbody = document.querySelector("tbody");
    let thead = document.querySelector("thead");


    tbody.innerHTML = "";

    if (Tab.length == 0 || Tab == []) {
        nbNotif.setAttribute('style', 'white-space: pre;');
        nbNotif.textContent = "Vous n'avez pas de notifications. \r\nRevenez plus tard.";

    } else {

        thead.style.display = "table-header-group";
        table.style.visibility = "visible";
        let nombre = tableauCorps.length;
        if(nombre == 1) {
        nbNotif.textContent = "Vous avez une nouvelle notification";
        }
        nbNotif.textContent = "Vous avez " + nombre + " notifications";


        Tab.forEach((row, index) => {
            let newRow = document.createElement("tr");

            // Ajoute une cellule pour le numéro de ligne
            let rowNumberCell = document.createElement("th");
            rowNumberCell.setAttribute("scope", "row");
            rowNumberCell.textContent = index + 1;
            newRow.appendChild(rowNumberCell);

            row.forEach((cellTab, cellIndex) => {
                let cell = document.createElement("td");
                // Si c'est la dernière cellule, crée un lien
                if (cellIndex === row.length - 1) {
                    let lien = document.createElement("a");
                    lien.href = cellTab;
                    lien.textContent = "Accéder";
                    cell.appendChild(lien);
                } else {
                    cell.textContent = cellTab;
                }
                newRow.appendChild(cell);
            });

            tbody.appendChild(newRow);
        });

    }
}


