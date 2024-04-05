//GESTION DE LA CONNEXION
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
async function redirection(){
  const connecte=getCookie("id_user");

  if(!connecte){
      window.location="index.html";
  }

  const voisin = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byId?id="+connecte)).json() ;

  if(!voisin.admin){
      window.location="index.html";
  }
}
redirection();

let prestations = {};

async function fetchPrestations() {
  const res = await fetch(
    "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/valorisation/byStatut?statut=0"
  );
  const data = await res.json();

  return data;
}

async function afficherPrestations() {
  let parent = document.querySelector(".container-table tbody");
  const prestations = await fetchPrestations();

  const lignes = Object.values(prestations).map((data) => createLigne(data));

  lignes.forEach((ligne) => parent.appendChild(ligne));

  getRowId();
  validationOrRefus("confirmValoriser");
  validationOrRefus("refusValoriser");
}

function createLigne(data) {
  if (data.prestation.archive === false) {
    const element = document.createElement("tr");
    const id = document.createElement("td");
    const libelle = document.createElement("td");
    const type = document.createElement("td");
    const actions = document.createElement("td");

    id.textContent = data.prestation.idPrestation;
    libelle.textContent = data.prestation.libelle;

    let t = "";
    data.prestation.type == "materiel" ? (t = "Matériel") : (t = "Service");
    type.textContent = t;

    actions.innerHTML = `
  <i
    class ="bi bi bi-coin h3"
    id = "i-valoriser"
    type="button"
    class="btn btn-primary"
    data-bs-toggle="modal"
    data-bs-target="#valoriser"
    data-details='${JSON.stringify(data).replace("'", "")}
    '
    

 ></i>`;

    element.appendChild(id);
    element.appendChild(libelle);
    element.appendChild(type);
    element.appendChild(actions);

    return element;
  }
}

function getRowId() {
  lesIcones = document.querySelectorAll("#i-valoriser");

  lesIcones.forEach((icon) => {
    icon.addEventListener("click", function (event) {
      const infos = event.currentTarget.getAttribute("data-details");
      const prestation = JSON.parse(infos);
      const infosPrestation = prestation.prestation;

      document
        .querySelector("#confirmValoriser")
        .setAttribute("data-idPrestation", infosPrestation.idPrestation);
      document
        .querySelector("#refusValoriser")
        .setAttribute("data-idPrestation", infosPrestation.idPrestation);
      document
        .querySelector("#confirmValoriser")
        .setAttribute("data-datevalo", prestation.dateValorisation);
      document
        .querySelector("#refusValoriser")
        .setAttribute("data-datevalo", prestation.dateValorisation);

      displayUserData(prestation);
    });
  });
}

async function displayUserData(data) {
  let title = data.prestation.libelle;
  let pxJour = data.prixJournalier;
  let pxTransac = data.prixJournalier;

  document.getElementById("titre-modal").textContent = title;
  document.getElementById("px-jour").value = pxJour;
  document.getElementById("px-transac").value = pxTransac;
}

function validationOrRefus(actionType) {
  const lesBoutons = document.querySelectorAll(`#${actionType}`);

  lesBoutons.forEach((bouton) => {

    bouton.addEventListener("click", function (event) {

      const idPrestation = JSON.parse(
        event.target.getAttribute("data-idPrestation")
      );
      const dateValo = event.target.getAttribute("data-datevalo");

      let pxJour = document.getElementById("px-jour").value;
      let pxTransac = document.getElementById("px-transac").value;

      const cellules = document.querySelectorAll("tr td:first-child");

      const error = document.getElementById("error");
      error.style.display = "none";
      
      const entierPositifRegex = /^[1-9]\d*$/;
      
      let ligne;

      cellules.forEach((cellule) => {
        if (cellule.textContent.trim() === idPrestation.toString()) {
          ligne = cellule.parentElement;
        }
      });

      if (
        actionType === "confirmValoriser" &&
        entierPositifRegex.test(pxJour) &&
        entierPositifRegex.test(pxTransac)
      ) {
        fetch(
          `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/valorisation/accepte?idPres=${idPrestation}&dateValorisation=${dateValo}&prixJournalier=${pxJour}&prixTrans=${pxTransac}`
        ).then(() => {
          ligne.remove();
          $("#valoriser").modal("hide");
          error.style.display = "none";
        });
      } else if (actionType === "refusValoriser") {
        fetch(
          `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/valorisation/refuse?idPres=${idPrestation}&dateValorisation=${dateValo}`
        ).then(() => {
          ligne.remove();
          $("#valoriser").modal("hide");
          error.style.display = "none";
        });
      } else if (
        actionType === "confirmValoriser" &&
        !(entierPositifRegex.test(pxJour) && entierPositifRegex.test(pxTransac))
      ) {
        error.style.display = "block";
      }
    });
  });
}

afficherPrestations();
