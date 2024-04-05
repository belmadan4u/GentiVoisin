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

async function fetchCategories() {
  const res = await fetch(
    `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/categorie/get`
  );
  const data = await res.json();

  return data;
}

async function afficherCategories() {
  let parent = document.querySelector(".container-table tbody");
  const categories = await fetchCategories();

  const lignes = Object.values(categories).map((data) => createLigne(data));

  lignes.forEach((ligne) => parent.appendChild(ligne));

  getRowId();
  modifier();
  ajouter();
  archiver();
}

function createLigne(data) {
  const element = document.createElement("tr");
  const id = document.createElement("td");
  const libelle = document.createElement("td");
  const description = document.createElement("td");
  const actions = document.createElement("td");

  id.textContent = data.idCateg;
  libelle.textContent = data.libelle;
  description.textContent = data.description;

  actions.innerHTML = `
  <i
    class ="bi bi-pencil-square h3"
    id = "i-modifier"
    type="button"
    class="btn btn-primary"
    data-bs-toggle="modal"
    data-bs-target="#modifierModal"
    data-modifier='${JSON.stringify(data).replace("'", "")}'
 ></i>
  <i
    class="bi bi-archive-fill h2"
    id="i-archiver"
    type="button"
    class="btn btn-primary"
    data-bs-toggle="modal"
    data-bs-target="#archiver"
    data-archiver='${JSON.stringify(data).replace("'", "")}'

  ></i>
`;

  element.appendChild(id);
  element.appendChild(libelle);
  element.appendChild(description);
  element.appendChild(actions);

  return element;
}

function getRowId() {
  lesIconesArchiver = document.querySelectorAll("#i-archiver");
  lesIconesModifier = document.querySelectorAll("#i-modifier");

  lesIconesArchiver.forEach((icon) => {
    icon.addEventListener("click", function (event) {
      const infos = event.currentTarget.getAttribute("data-archiver");
      const categorie = JSON.parse(infos);

      if (document.querySelector("#ar-succes").textContent != "") {
        document.querySelector("#ar-succes").textContent = "";
      }

      document
        .querySelector("#btnarchiver")
        .setAttribute("data-idcat", categorie.idCateg);
    });
  });

  lesIconesModifier.forEach((icon) => {
    icon.addEventListener("click", function (event) {
      const infos = event.currentTarget.getAttribute("data-modifier");
      const categorie = JSON.parse(infos);

      if (document.querySelector("#mo-succes").textContent != "") {
        document.querySelector("#mo-succes").textContent = "";
      }
      if (document.querySelector("#mo-error").textContent != "") {
        document.querySelector("#mo-error").textContent = "";
      }

      document
        .querySelector("#confirmModifier")
        .setAttribute("data-idcat", categorie.idCateg);

      displayUserData(categorie);
    });
  });
}

async function displayUserData(data) {
  let libelle = data.libelle;
  let description = data.description;

  document.getElementById("libelle-categ").value = libelle;
  document.getElementById("description-categ").value = description;
}

function modifier() {
  const lesBoutons = document.querySelectorAll(`#confirmModifier`);

  lesBoutons.forEach((bouton) => {
    bouton.addEventListener("click", function (event) {
      const idCateg = JSON.parse(event.target.getAttribute("data-idcat"));

      let libelle = document.getElementById("libelle-categ").value;
      let description = document.getElementById("description-categ").value;

      let correct = document.getElementById("mo-succes");
      let error = document.getElementById("mo-error");

      const libelleCell = document.querySelectorAll("tr td:nth-child(1)");
      const descriptionCell = document.querySelectorAll("tr td:nth-child(1)");

      libelleCell.forEach((cellule) => {
        if (cellule.textContent.trim() === idCateg.toString()) {
          ligneLibelle = cellule.parentElement;
        }
      });
      descriptionCell.forEach((cellule) => {
        if (cellule.textContent.trim() === idCateg.toString()) {
          ligneDescription = cellule.parentElement;
        }
      });

      if (libelle.length > 0 && description.length > 0) {
        // fetch(
        //   `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/categorie/update?id=${idCateg}&libelle=${libelle}&description=${description}`
        // ).then(() => {

        error.textContent = "";
        correct.textContent = "La catégorie a été modifiée avec succès !";

        ligneLibelle.querySelector("td:nth-child(2)").innerHTML = libelle;
        ligneDescription.querySelector("td:nth-child(3)").innerHTML =
          description;
        // });
      } else {
        correct.textContent = "";
        error.textContent = "Les champs ne peuvent pas être vides !";
      }
    });
  });
}

function ajouter() {
  const btnAjouter = document.querySelector(`#btnajouter`);
  const btnNouvelleCat = document.querySelector(`#aj-cat`);

  let libelle = document.getElementById("new-cat-lib");
  let description = document.getElementById("new-cat-description");

  let correct = document.getElementById("aj-succes");
  let error = document.getElementById("aj-error");

  btnNouvelleCat.addEventListener("click", function () {
    correct.textContent = "";
    error.textContent = "";

    libelle.value = null;
    description.value = null;
  });

  btnAjouter.addEventListener("click", function () {
    let libelle = document.getElementById("new-cat-lib");
    let description = document.getElementById("new-cat-description");

    const lastRowId = document.querySelector(
      "tbody tr:last-child td:first-child"
    ).textContent;
    newId = parseInt(lastRowId) + 1;

    table = document.querySelector(".container-table tbody");

    if (libelle.value.length > 0 && description.value.length > 0) {
      fetch(
        `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/categorie/insert?libelle=${libelle.value}&description=${description.value}`
      ).then(() => {
        obj = {
          idCateg: newId,
          libelle: libelle.value,
          description: description.value,
        };
        table.appendChild(createLigne(obj));
        error.textContent = "";
        correct.textContent = "La catégorie a été ajoutée avec succès !";
      });
    } else {
      correct.textContent = "";
      error.textContent = "Les champs ne peuvent pas être vides !";
    }
  });
}

function archiver() {
  const lesBoutons = document.querySelectorAll(`#btnarchiver`);

  lesBoutons.forEach((bouton) => {
    bouton.addEventListener("click", function (event) {
      const idCateg = JSON.parse(event.target.getAttribute("data-idcat"));
      const cellules = document.querySelectorAll("tr td:first-child");

      let correct = document.querySelector("#ar-succes");
      let ligne;

      cellules.forEach((cellule) => {
        if (cellule.textContent.trim() === idCateg.toString()) {
          ligne = cellule.parentElement;
        }
      });

      fetch(
        `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/categorie/delete?id=${idCateg}`
      ).then(() => {
        ligne.remove();
        correct.textContent =
          "La catégorie " + idCateg + " a été archivée avec succès !";
      });
    });
  });
}

afficherCategories();
