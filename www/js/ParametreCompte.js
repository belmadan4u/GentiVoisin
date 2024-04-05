let infosUser;
fetch(
  "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byId?id=" +
    getCookie("id_user")
)
  .then((data) => data.json())
  .then((json) => (infosUser = json))
  .then(() => initialise(infosUser))
  .catch((error) => {
    console.error("Erreur lors de la requête fetch:", error);
  });

//INITIALISATION DES INFOS
function initialise(json) {
  document.querySelector("#inputEmail").value = infosUser.mail;
  document.querySelector("#inputNom").value = infosUser.nom;
  document.querySelector("#inputPrenom").value = infosUser.prenom;
  document.querySelector("#inputVille").value = infosUser.adresse;
  document.querySelector("#photoProfil").style.backgroundImage =
    "url('" + infosUser.photoProfil + "')";
  document.querySelector("#inputTelephone").value = infosUser.telephone;
  document.querySelector("#inputRayon").value = infosUser.rayonDeplacement;
}

//GESTION DES COOKIES
function getCookie(name) {
  const cookies = document.cookie.split(";");

  for (let i of cookies) {
    let cookie = i.trim();

    if (cookie.startsWith(name)) {
      return cookie.substring(name.length + 1, cookie.length);
    }
  }
  return "";
}

if (getCookie("id_user") == "" || getCookie("id_user") == undefined) {
  window.location = "./index.html";
}

//VERIFICATION/GESTION IMAGE
function validateFileType(fichier) {
  let file = fichier.value;
  let idxDot = file.lastIndexOf(".") + 1;
  let extFile = file.substr(idxDot, file.length).toLowerCase();
  if (extFile == "jpg" || extFile == "jpeg" || extFile == "png") {
    return true;
  } else {
    return false;
  }
}

async function envoyerResultat(result) {
  try {
    const resultat = await fetch(
      "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/updatePhotoProfil?idGenti=" +
        getCookie("id_user"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoProfil: result }),
      }
    );
    console.log(resultat);
  } catch (error) {
    console.log("Erreur lors de l'envoi des données :", error);
  }
}

//fonction pour faire apparaitre et cacher les MDP
function visibiliteMDP(elm, input) {
  elm.addEventListener("click", function () {
    if (input.type === "password") {
      elm.setAttribute("style", 'background-image: url("../img/eye.svg")');
      input.type = "text";
    } else {
      elm.setAttribute(
        "style",
        'background-image: url("../img/eye-slash.svg")'
      );
      input.type = "password";
    }
  });
}

visibiliteMDP(
  document.querySelector("#visible1"),
  document.querySelector("#mdpActuel")
);
visibiliteMDP(
  document.querySelector("#visible2"),
  document.querySelector("#nouveauMDP1")
);
visibiliteMDP(
  document.querySelector("#visible3"),
  document.querySelector("#nouveauMDP2")
);

//Réinitialisation des modals à la fermeture
function reinitModalMail() {
  document.querySelector("#mailActuel").value = "";
  document.querySelector("#nouveauMail1").value = "";
  document.querySelector("#nouveauMail2").value = "";
  document.querySelector("#errorMail").textContent = "";
  document.querySelector("#succesMail").textContent = "";
}

function reinitModalTelephone() {
  document.querySelector("#telephoneActuel").value = "";
  document.querySelector("#nouveauTelephone1").value = "";
  document.querySelector("#nouveauTelephone2").value = "";
  document.querySelector("#errorTelephone").textContent = "";
  document.querySelector("#succesTelephone").textContent = "";
}

function reinitModalMdp() {
  let mdpActuel = document.querySelector("#mdpActuel");
  let nouveauMDP1 = document.querySelector("#nouveauMDP1");
  let nouveauMDP2 = document.querySelector("#nouveauMDP2");
  document.querySelector("#errorMdp").textContent = "";
  document.querySelector("#succesMdp").textContent = "";
  mdpActuel.value = "";
  nouveauMDP1.value = "";
  nouveauMDP2.value = "";
  mdpActuel.type = "password";
  nouveauMDP1.type = "password";
  nouveauMDP2.type = "password";
  document
    .querySelector("#visible1")
    .setAttribute(
      "style",
      'background-image: url("../style/img/eye-slash.svg")'
    );
  document
    .querySelector("#visible2")
    .setAttribute(
      "style",
      'background-image: url("../style/img/eye-slash.svg")'
    );
  document
    .querySelector("#visible3")
    .setAttribute(
      "style",
      'background-image: url("../style/img/eye-slash.svg")'
    );
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("modalMail")
    .addEventListener("hidden.bs.modal", reinitModalMail);

  document
    .getElementById("modalMDP")
    .addEventListener("hidden.bs.modal", reinitModalMdp);

  document
    .getElementById("modalTelephone")
    .addEventListener("hidden.bs.modal", reinitModalTelephone);
});

//MODAL MAIL
function verifMail(val) {
  if (!val.match(/\S+@\S+\.\S+/)) {
    return false;
  }
  if (val.indexOf(" ") != -1 || val.indexOf("..") != -1) {
    return false;
  }
  return true;
}

document
  .querySelector("#btnValiderMail")
  .addEventListener("click", function () {
    let mailActuel = document.querySelector("#mailActuel");
    let nouveauMail1 = document.querySelector("#nouveauMail1");
    let nouveauMail2 = document.querySelector("#nouveauMail2");
    let erreur = document.querySelector("#errorMail");
    if (document.querySelector("#succesMail").textContent != "") {
      document.querySelector("#succesMail").textContent = "";
    }
    if (
      mailActuel.value != "" &&
      nouveauMail1.value != "" &&
      nouveauMail2.value != ""
    ) {
      if (
        verifMail(mailActuel.value) == true &&
        verifMail(nouveauMail1.value) == true &&
        verifMail(nouveauMail2.value) == true
      ) {
        if (infosUser.mail == mailActuel.value) {
          if (nouveauMail1.value === nouveauMail2.value) {
            fetch(
              "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/existeUser?id=" +
                nouveauMail1.value
            )
              .then((data) => data.json())
              .then(function (json) {
                if (json.existe === false) {
                  fetch(
                    "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/update?id=" +
                      infosUser.idUser +
                      "&nom=" +
                      infosUser.nom +
                      "&prenom=" +
                      infosUser.prenom +
                      "&adresse=" +
                      infosUser.adresse +
                      "&mail=" +
                      nouveauMail1.value +
                      "&telephone=" +
                      infosUser.telephone +
                      "&rayonDeplacement=" +
                      infosUser.rayonDeplacement
                  )
                    .then(function () {
                      infosUser.mail = nouveauMail1.value;
                      document.querySelector("#inputEmail").value =
                        nouveauMail1.value;
                      reinitModalMail();
                      document.querySelector("#succesMail").textContent =
                        "Modification réalisée avec succès";
                    })
                    .catch((error) =>
                      console.log("erreur lors de l'update : " + error)
                    );
                } else {
                  erreur.textContent =
                    "Le nouveau mail est déjà assigné à un compte";
                }
              });
          } else {
            erreur.textContent =
              "Les champs de nouvelles adresses mail doivent etre identiques.";
          }
        } else {
          erreur.textContent =
            "L'adresse mail actuelle que vous avez saisi ne correspond pas à celle de votre compte.";
        }
      } else {
        erreur.textContent = "Veuillez saisir des adresses mails valides.";
      }
    } else {
      erreur.textContent = "Vous devez remplir tout les champs.";
    }
  });

//MODAL TELEPHONE
const regexTelephone = /^(\+\d{1,3})?\d{10}$/;
document
  .querySelector("#btnValiderTelephone")
  .addEventListener("click", function () {
    let telephoneActuel = document.querySelector("#telephoneActuel");
    let nouveauTelephone1 = document.querySelector("#nouveauTelephone1");
    let nouveauTelephone2 = document.querySelector("#nouveauTelephone2");
    let erreur = document.querySelector("#errorTelephone");
    if (document.querySelector("#succesTelephone").textContent != "") {
      document.querySelector("#succesTelephone").textContent = "";
    }
    if (
      telephoneActuel.value != "" &&
      nouveauTelephone1.value != "" &&
      nouveauTelephone2.value != ""
    ) {
      if (
        telephoneActuel.value.match(regexTelephone) &&
        nouveauTelephone1.value.match(regexTelephone) &&
        nouveauTelephone2.value.match(regexTelephone)
      ) {
        if (infosUser.telephone == telephoneActuel.value) {
          if (nouveauTelephone1.value === nouveauTelephone2.value) {
            fetch(
              "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/existeUser?id=" +
                nouveauTelephone1.value
            )
              .then((data) => data.json())
              .then(function (json) {
                if (json.existe === false) {
                  fetch(
                    "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/update?id=" +
                      infosUser.idUser +
                      "&nom=" +
                      infosUser.nom +
                      "&prenom=" +
                      infosUser.prenom +
                      "&adresse=" +
                      infosUser.adresse +
                      "&mail=" +
                      infosUser.mail +
                      "&telephone=" +
                      nouveauTelephone1.value +
                      "&rayonDeplacement=" +
                      infosUser.rayonDeplacement
                  )
                    .then(function () {
                      infosUser.telephone = nouveauTelephone1.value;
                      document.querySelector("#inputTelephone").value =
                        nouveauTelephone1.value;
                      reinitModalTelephone();
                      document.querySelector("#succesTelephone").textContent =
                        "Modification réalisée avec succès";
                    })
                    .catch((error) =>
                      console.log("erreur lors de l'update : " + error)
                    );
                } else {
                  erreur.textContent =
                    "Le nouveau numéro est déjà assigné à un compte.";
                }
              });
          } else {
            erreur.textContent =
              "Les champs de nouveaux numéros doivent être identiques.";
          }
        } else {
          erreur.textContent =
            "Le numéro actuel que vous avez saisi ne correspond pas à celui lié à votre compte.";
        }
      } else {
        erreur.textContent = "Veuillez saisir des numéros valides.";
      }
    } else {
      erreur.textContent = "Vous devez remplir tout les champs.";
    }
  });

//MODAL MDP
document.querySelector("#btnValiderMdp").addEventListener("click", function () {
  let mdpActuel = document.querySelector("#mdpActuel");
  let nouveauMDP1 = document.querySelector("#nouveauMDP1");
  let nouveauMDP2 = document.querySelector("#nouveauMDP2");
  let erreur = document.querySelector("#errorMdp");
  if (document.querySelector("#succesMdp").textContent != "") {
    document.querySelector("#succesMdp").textContent = "";
  }
  if (
    mdpActuel.value != "" &&
    nouveauMDP1.value != "" &&
    nouveauMDP2.value != ""
  ) {
    fetch(
      "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/verifierMdp?id=" +
        infosUser.mail +
        "&mdp=" +
        mdpActuel.value
    )
      .then((data) => data.json())
      .then(function (json) {
        if (json != "") {
          {
            if (nouveauMDP1.value === nouveauMDP2.value) {
              fetch(
                "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/updateMdp?id=" +
                  infosUser.idUser +
                  "&mdp=" +
                  nouveauMDP1.value
              )
                .then(() => reinitModalMdp())
                .then(function () {
                  document.querySelector("#succesMdp").textContent =
                    "Modification réalisée avec succès";
                })
                .catch((error) =>
                  console.log("erreur lors de l'update : " + error)
                );
            } else {
              erreur.textContent =
                "Les champs de nouveaux mot de passe doivent être identiques.";
            }
          }
        } else {
          erreur.textContent =
            "Le mot de passe actuel que vous avez saisi ne correspond pas à celui lié à votre compte.";
        }
      })
      .catch((error) => console.log("erreur : " + error));
  } else {
    erreur.textContent = "Vous devez remplir tout les champs.";
  }
});

//INFORMATIONS GENERALES
document
  .querySelector("#btnInfosGenerales")
  .addEventListener("click", function () {
    let nom = document.querySelector("#inputNom").value;
    let prenom = document.querySelector("#inputPrenom").value;
    let ville = document.querySelector("#inputVille").value;
    let rayon = document.querySelector("#inputRayon").value;
    if (nom != "" && prenom != "" && ville != "" && rayon != "") {
      if (rayon.match(/^\d+$/)) {
        fetch(
          "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/update?id=" +
            infosUser.idUser +
            "&nom=" +
            nom +
            "&prenom=" +
            prenom +
            "&adresse=" +
            ville +
            "&mail=" +
            infosUser.mail +
            "&telephone=" +
            infosUser.telephone +
            "&rayonDeplacement=" +
            rayon
        )
          .then(function () {
            infosUser.nom = nom;
            infosUser.prenom = prenom;
            infosUser.adresse = ville;
            infosUser.rayonDeplacement = rayon;
            document.querySelector("#errorGenerale").textContent = "";
            alert("modification effectuée avec succès");
          })
          .catch((error) => console.log("erreur lors de l'update : " + error));
      } else {
        document.querySelector("#errorGenerale").textContent =
          "Le rayon de déplacement doit être un nombre";
      }
    } else {
      document.querySelector("#errorGenerale").textContent =
        "Vous devez remplir tout les champs.";
    }
  });

//PHOTO DE PROFIL
let base64Image;
document.querySelector("#btnValiderPhoto").addEventListener("click", () => {
  let error = document.querySelector("#errorPhoto");
  if (document.querySelector("#succesPhoto").textContent != "") {
    document.querySelector("#succesPhoto").textContent = "";
  }
  if (document.querySelector("#inputPhotoProfil").value != "") {
    if (base64Image) {
      envoyerResultat(base64Image);
      base64Image = "";
      document.querySelector("#inputPhotoProfil").value = "";
      document.querySelector("#succesPhoto").textContent =
        "Photo ajouté avec succès";
    } else {
      error.textContent = "Le fichier n'est pas une image";
    }
  } else {
    error.textContent = "Ajoutez une image avant de valider";
  }
});

document
  .querySelector("#inputPhotoProfil")
  .addEventListener("change", (event) => {
    if (document.querySelector("#succesPhoto").textContent != "") {
      document.querySelector("#succesPhoto").textContent = "";
    }
    if (document.querySelector("#errorPhoto").textContent != "") {
      document.querySelector("#errorPhoto").textContent = "";
    }
    if (validateFileType(document.querySelector("#inputPhotoProfil"))) {
      const file = event.target.files[0];

      const reader = new FileReader();

      reader.onload = function () {
        base64Image = reader.result;
        document.querySelector("#photoProfil").style.backgroundImage =
          "url('" + base64Image + "')";
      };

      reader.readAsDataURL(file);
    }
  });
