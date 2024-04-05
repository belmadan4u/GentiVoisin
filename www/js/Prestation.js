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
async function redirection() {
  const connecte = getCookie("id_user");

  if (!connecte) {
    window.location = "index.html";
  }

  const voisin = await (
    await fetch(
      "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byId?id=" +
        connecte
    )
  ).json();

  if (!voisin.admin) {
    window.location = "index.html";
  }
}
redirection();

let prestations = {};

async function fetchPrestations(etat) {
  const res = await fetch(
    "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/byStatut?statut=0"
  );
  const data = await res.json();
  let tabPres = [];
  data.forEach((prestation) => {
    if (prestation.archive === etat) tabPres.push(prestation);
  });
  return tabPres;
}

async function afficherPrestations(etat) {
  let parent = document.querySelector(".container-table tbody");
  const prestations = await fetchPrestations(etat);
  const lignes = Object.values(prestations).map((data) => createLigne(data));
  lignes.forEach((ligne) => parent.appendChild(ligne));

  getRowId(etat);
  archiver();
}

function createLigne(data) {
  const element = document.createElement("tr");
  const id = document.createElement("td");
  const libelle = document.createElement("td");
  const type = document.createElement("td");
  const actions = document.createElement("td");

  id.textContent = data.idPrestation;
  libelle.textContent = data.libelle;

  let t = "";
  data.type == "materiel" ? (t = "Materiel") : (t = "Service");
  type.textContent = t;

  actions.innerHTML = `
    <i
      class="bi bi bi-check-square-fill h2"
      id="i-archive"
      type="button"
      class="btn btn-primary"
      data-bs-toggle="modal"
      data-bs-target="#archiver"
      data-details='${JSON.stringify(data).replace("'", "")}
    '></i>`;

  element.appendChild(id);
  element.appendChild(libelle);
  element.appendChild(type);
  element.appendChild(actions);

  return element;
}

function getRowId() {
  lesIcones = document.querySelectorAll("#i-archive");

  lesIcones.forEach((icon) => {
    icon.addEventListener("click", function (event) {
      const infos = event.currentTarget.getAttribute("data-details");
      const prestation = JSON.parse(infos);

      document
        .querySelector("#btn-refuser")
        .setAttribute("data-idPrestation", prestation.idPrestation);
      document
        .querySelector("#btn-accepter")
        .setAttribute("data-idPrestation", prestation.idPrestation);
    });
  });
}

function archiver() {
  const lesBoutonsAccepter = document.querySelectorAll(`#btn-accepter`);
  const lesBoutonsRefuser = document.querySelectorAll(`#btn-refuser`);

  lesBoutonsAccepter.forEach((bouton) => {
    bouton.addEventListener("click", async function (event) {
      const idPres = JSON.parse(event.target.getAttribute("data-idPrestation"));
      const cellules = document.querySelectorAll("tr td:first-child");

      let ligne;
      let type;
      let nomType;
      let url;
      let idService;
      let idMateriel;

      cellules.forEach((cellule) => {
        if (cellule.textContent.trim() === idPres.toString()) {
          ligne = cellule.parentElement;
          type = document.querySelector("td:nth-child(3)").textContent;
        }
      });

      const res = await fetch(
        `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/byId?id=${idPres}`
      );

      const data = await res.json();

      if (type === "Service") {
        nomType = "service";
      } else {
        nomType = "materiel";
      }

      if (data.type === "service") {
        idService = data.idService;
      } else {
        idMateriel = data.idMateriel;
      }

      if (data.type === "service") {
        url = `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/service/valide?idService=${idService}`;
      } else {
        url = `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/materiel/valide?idMateriel=${idMateriel}`;
      }  fetch(url).then(() => {
      ligne.remove();

       });
    });
  });

  lesBoutonsRefuser.forEach((bouton) => {
    bouton.addEventListener("click", async function (event) {
      const idPres = JSON.parse(event.target.getAttribute("data-idPrestation"));

      const cellules = document.querySelectorAll("tr td:first-child");

      let ligne;
      let type;
      let nomType;
      let url;
      let idService;
      let idMateriel;

      cellules.forEach((cellule) => {
        if (cellule.textContent.trim() === idPres.toString()) {
          ligne = cellule.parentElement;
          type = document.querySelector("td:nth-child(3)").textContent;
        }
      });

      const res = await fetch(
        `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/byId?id=${idPres}`
      );

      const data = await res.json();

      if (type === "Service") {
        nomType = "service";
      } else if (type === "Materiel") {
        nomType = "materiel";
      }

      if (data.type === "service") {
        idService = data.idService;
      } else if (data.type === "materiel") {
        idMateriel = data.idMateriel;
      }

      if (data.type === "service") {
        url = `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/service/banni?idService=${idService}`;
      } else {
        url = `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/materiel/banni?idMateriel=${idMateriel}`;
      }  fetch(url).then(() => {
      ligne.remove();

       });
    });
  });
}

afficherPrestations(false);

