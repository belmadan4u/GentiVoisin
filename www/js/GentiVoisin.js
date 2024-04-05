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

async function fillTabGentiVoisin(url) {
  return fetch(url)
    .then((res) => res.json())
    .then((v) => {
      let table = document.querySelector("#tabGentiVoisin tbody");
      table.innerHTML = "";

      v.forEach((element) => {
        let row = document.createElement("tr");
        row.innerHTML =
          `<th scope="row">` +
          element["idUser"] +
          `</th>
          <td>` +
          element["nom"] +
          `</td>
          <td>` +
          element["prenom"] +
          `</td>
          <td>
            <i
              class="bi bi-info-circle-fill h2 m-2"
              type="button"
              class="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#exampleModal"
              data-details='${JSON.stringify(element)}'
            ></i>
            <i
              class="bi bi-ban h2"
              id="icon-ban"
              type="button"
              class="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#bannirUser"
              data-idUser='${element.idUser}'

            ></i>
          </td>
      `;
        table.appendChild(row);
      });

      let infoIcons = document.querySelectorAll(".bi-info-circle-fill");
      let banIcons = document.querySelectorAll(".bi-ban");
      let correct = document.getElementById("ban-succes");

      infoIcons.forEach((icon) => {
        icon.addEventListener("click", function (event) {
          let details = JSON.parse(event.target.getAttribute("data-details"));
          displayUserDetails(details);
        });
      });

      banIcons.forEach((ban) => {
        ban.addEventListener("click", function (event) {
          correct.textContent = ""

          let userId = JSON.parse(event.target.getAttribute("data-idUser"));
          document
            .getElementById("confirmBannir")
            .setAttribute("data-idUser", userId);
        });
      });

      bannir();
    });
}

function bannir() {
  const lesBoutonsBannir = document.querySelectorAll("#confirmBannir");

  lesBoutonsBannir.forEach((bouton) => {
    bouton.addEventListener("click", function (event) {
      let userId = document
        .getElementById("confirmBannir")
        .getAttribute("data-idUser");

      let ligne;
      let correct = document.getElementById("ban-succes");

      const cellules = document.querySelectorAll("#tabGentiVoisin tbody tr th");

      cellules.forEach((cellule) => {
        if (cellule.textContent.trim() === userId.toString()) {
          ligne = cellule.parentElement;
        }
      });
      // fetch(
      //   `https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/bannir?id=${userId}`
      // ).then(() => {
      ligne.remove();
      correct.textContent =
        "L'utilisateur " + userId + " a été banni avec succès !";
      // });
    });
  });
}

fillTabGentiVoisin(
  "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byStatut?statut=1"
);

function displayUserDetails(details) {
  let modal = document.querySelector(".modal-body");
  modal.innerHTML = "";

  modal.innerHTML =
    `<div class="col-xs-12 col-md-8 mb-3">
      <div class="small">Nom</div>
      <div class="big">` +
    details.nom +
    `</div>
    </div>

    <div class="col-xs-12 col-md-4 mb-3">
      <div class="small">Prénom</div>
      <div class="big">` +
    details.prenom +
    `</div>
    </div>

    <div class="col-xs-12 col-md-8 mb-3">
      <div class="small">Adresse-mail</div>
      <div class="big">` +
    details.mail +
    `</div>
    </div>

    <div class="col-xs-12 col-md-4 mb-3">
      <div class="small">Rayon de déplacement</div>
      <div class="big">` +
    details.rayonDeplacement +
    `</div>
    </div>

    <div class="col-xs-12 col-md-8 mb-3">
      <div class="small">Numéro</div>
      <div class="big">` +
    details.telephone +
    `</div>
    </div>

    <div class="col-xs-12 col-md-4 mb-3">
      <div class="small">Crédit</div>
      <div class="big">` +
    details.credit +
    `</div>
    </div>
  `;

  document.querySelector("#annonce").href =
    "unGentiVoisin.html?voisin=" + details.idUser;
}

const btnRadioElements = document.querySelectorAll(".btn-check");
let tableGentiVoisin = document.querySelector(".container-table");

btnRadioElements.forEach((btnRadio) => {
  btnRadio.addEventListener("change", function () {
    if (this.checked) {
      const checkedId = this.getAttribute("id");
      if (checkedId === "btnradio1") {
        fillTabGentiVoisin(
          "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byStatut?statut=1"
        ).then(() => {
          document.querySelectorAll("#icon-ban").forEach((icon) => {
            icon.style.display = "";
          });
        });
      } else if (checkedId === "btnradio2") {
        fillTabGentiVoisin(
          "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byStatut?statut=2"
        ).then(() => {
          document.querySelectorAll("#icon-ban").forEach((icon) => {
            icon.style.display = "none";
          });
        });
      }
    }
  });
});
