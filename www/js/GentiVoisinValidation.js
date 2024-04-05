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

let enAttente = {};

async function fetchGentiVoisin() {
  const res = await fetch(
    "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byStatut?statut=0"
  );
  const data = await res.json();

  return data;
}

async function afficherEnAttente() {
  let parent = document.querySelector(".container-table tbody");
  const enAttente = await fetchGentiVoisin();

  const lignes = Object.values(enAttente).map((data) => createLigne(data));

  lignes.forEach((ligne) => parent.appendChild(ligne));

  getRowId();
  validation();
  // fermerModal();
}

function createLigne(data) {
  const element = document.createElement("tr");
  const id = document.createElement("td");
  const nom = document.createElement("td");
  const prenom = document.createElement("td");
  const actions = document.createElement("td");

  id.textContent = data.idUser;
  nom.textContent = data.nom;
  prenom.textContent = data.prenom;

  actions.innerHTML = `
  <i
    class ="bi bi-check-circle-fill h3"
    id = "i-valider"
    type="button"
    class="btn btn-primary"
    data-bs-toggle="modal"
    data-bs-target="#exampleModal"
    data-details='${JSON.stringify(data)}'

 ></i>`;

  element.appendChild(id);
  element.appendChild(nom);
  element.appendChild(prenom);
  element.appendChild(actions);

  return element;
}

function getRowId() {
  lesIcones = document.querySelectorAll("#i-valider");
  let correct = document.getElementById('val-succes')

  lesIcones.forEach((icon) => {
    icon.addEventListener("click", function (event) {
      correct.textContent = ""
      const data = JSON.parse(event.target.getAttribute("data-details"));
      document
        .querySelector("#confirmValider")
        .setAttribute("data-userId", data.idUser);

      displayUserData(data);
    });
  });
}

async function displayUserData(data) {
  let modal = document.querySelector(".modal-body");
  modal.innerHTML = "";

  modal.innerHTML =
    `<div class="col-xs-12 col-md-8 mb-3">
      <div class="small">Nom</div>
      <div class="big">` +
    data.nom +
    `</div>
    </div>

    <div class="col-xs-12 col-md-4 mb-3">
      <div class="small">Prénom</div>
      <div class="big">` +
    data.prenom +
    `</div>
    </div>

    <div class="col-xs-12 col-md-8 mb-3">
      <div class="small">Adresse-mail</div>
      <div class="big">` +
    data.mail +
    `</div>
    </div>

    <div class="col-xs-12 col-md-4 mb-3">
      <div class="small">Rayon de déplacement</div>
      <div class="big">` +
    data.rayonDeplacement +
    `</div>
    </div>

    <div class="col-xs-12 col-md-8 mb-3">
      <div class="small">Numéro</div>
      <div class="big">` +
    data.telephone +
    `</div>
    </div>

    <div class="col-xs-12 col-md-4 mb-3">
      <div class="small">Crédit</div>
      <div class="big">` +
    data.credit +
    `</div>
    </div>
  `;
}

function fermerModal() {
  lesBoutons = document.querySelectorAll("#valider");

  lesBoutons.forEach((bouton) => {
    bouton.addEventListener("click", function () {
      let maModal = document.getElementById("exampleModal");
      maModal.addEventListener("hidden.bs.modal", function () {
        let backdrop = document.querySelector(".modal-backdrop");
        if (backdrop !== null) {
          backdrop.parentNode.removeChild(backdrop);
        }
      });
    });
  });
}

function validation() {
  let lesBoutonsValider = document.querySelectorAll("#confirmValider");

  lesBoutonsValider.forEach((bouton) => {
    bouton.addEventListener("click", function (event) {
      let idUser = JSON.parse(event.target.getAttribute("data-userId"));

      let ligne;
      let cellules = document.querySelectorAll("tr td:first-child");
      let correct = document.querySelector('#val-succes')

      cellules.forEach((cellule) => {
        if (cellule.textContent.trim() === idUser.toString()) {
          ligne = cellule.parentElement;
        }
      });

      // fetch(
      //   `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/valide?id=${idUser}`
      // ).then(() => {

      ligne.remove();
      correct.textContent = "L'utilisateur "+ idUser +"  a été validé avec succès !"

      // });
    });
  });
}

afficherEnAttente();
