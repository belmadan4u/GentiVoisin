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

function creationElement(classe = "", text = "") {
  const element = document.createElement("div");

  if (classe != "") {
    element.className = classe;
  }

  if (text != "") {
    element.innerHTML = text;
  }

  return element;
}

function difference(date1, date2) {
  return Math.abs(new Date(date2) - new Date(date1)) / (1000 * 3600 * 24);
}

let connecte = "";
let type = "recu";
let transacOuProlon = 0;
let prolongationRecu = [];
let prolongationEnvoye = [];
let transactionRecu = [];
let transactionEnvoye = [];

async function creationTransaction(transaction) {
  let cont = true;
  if (type == "recu") {
    if (new Date(transaction.dateDebut) < new Date()) {
      fetch(
        "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/refuse?idTransaction=" +
          transaction.idTransaction
      ).then(() => (cont = false));
    }
  } else {
    if (new Date(transaction.dateDebut) < new Date()) {
      fetch(
        "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/refuse?idTransaction=" +
          transaction.idTransaction
      );
    }
  }
  if (cont === true) {
    const trans = document.createElement("div");
    trans.className = "transaction";
    /* -------------- TITRE -----------------------*/

    const titre = document.createElement("div");
    titre.className = "transaction_titre";
    titre.textContent = transaction.prestation.libelle;
    /* -------------- LES INFORMATIONS -----------------------*/
    const contenu = document.createElement("div");
    contenu.className =
      "d-flex align-items-center justify-content-between transaction_contenu";

    /* -------------- IMAGE -----------------------*/
    const lesImages = await (
      await fetch(
        "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/image/byPrestation?idPrestation=" +
          transaction.prestation.idPrestation
      )
    ).json();

    const image = document.createElement("div");
    image.className = "transaction_contenu_photo";
    image.style.backgroundImage =
      lesImages.length != 0 ? "url(" + lesImages[0].base64 + ")" : "";

    /* -------------- CONTENU INFORMATION -----------------------*/
    const information = document.createElement("div");
    information.className =
      "d-flex flex-column justify-content-center transaction_contenu_information";

    // PROPRIO

    const propNote = document.createElement("div");
    propNote.className =
      "d-flex align-items-center justify-content-between transaction_contenu_information_propNote";

    const proprio = document.createElement("div");
    proprio.className =
      "d-flex align-items-center justify-content-between transaction_contenu_information_propNote_proprio";

    const proprioImg = document.createElement("div");
    proprioImg.className =
      "transaction_contenu_information_propNote_proprio_image";

    const utilisateur =
      type == "recu"
        ? transaction.gentiVoisin
        : transaction.prestation.gentiVoisin;

    proprioImg.style.backgroundImage = utilisateur.photoProfil
      ? "url(" + utilisateur.photoProfil + ")"
      : "";

    const proprioPerso = document.createElement("div");
    proprioPerso.className =
      "transaction_contenu_information_propNote_proprio_perso";

    const proprioNomP = document.createElement("div");
    proprioNomP.textContent = utilisateur.prenom + " " + utilisateur.nom;
    const proprioAdd = document.createElement("div");
    proprioAdd.textContent = utilisateur.adresse;

    proprioPerso.appendChild(proprioNomP);
    proprioPerso.appendChild(proprioAdd);

    proprio.appendChild(proprioImg);
    proprio.appendChild(proprioPerso);

    propNote.appendChild(proprio);
    information.appendChild(propNote);

    /* -------------- STATISTIQUE ET DATE -----------------------*/
    const statDate = document.createElement("div");
    statDate.className =
      "d-flex align-items-center justify-content-between transaction_contenu_information_statDate";

    // STATUT
    const statut = document.createElement("div");
    statut.className =
      "d-flex  align-items-center transaction_contenu_information_statDate_statut";

    const dateDebut = transaction.dateDebut;
    const dateFin = await (
      await fetch(
        " https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/dateFin?idTransaction=" +
          transaction.idTransaction
      )
    ).json();

    if (type === "recu") {
      statut.innerHTML =
        "<div class='transaction_contenu_information_statDate_enCours'> </div>En attente";
    } else {
      if (transaction.accepte == 1) {
        statut.innerHTML =
          "<div class='transaction_contenu_information_statDate_futur'> </div>Accepté";
      } else if (transaction.accepte == 2) {
        statut.innerHTML =
          "<div class='transaction_contenu_information_statDate_passe'> </div>Refusé";
      } else {
        statut.innerHTML =
          "<div class='transaction_contenu_information_statDate_enCours'> </div>En attente";
      }
    }
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const demande = document.createElement("div");
    demande.textContent =
      "Demandé le " +
      new Date(transaction.dateDemandeTransaction).toLocaleDateString(
        "fr-FR",
        options
      );

    statDate.appendChild(statut);
    statDate.appendChild(demande);

    information.appendChild(statDate);

    /* -------------- LES DATES DE LA TRANSACTION -----------------------*/
    const datesTrans = document.createElement("div");
    datesTrans.className =
      "d-flex align-items-center transaction_contenu_information_lesDates";

    datesTrans.textContent =
      "Du " +
      new Date(dateDebut).toLocaleDateString("fr-FR", options) +
      " au " +
      new Date(dateFin).toLocaleDateString("fr-FR", options);

    information.appendChild(datesTrans);

    /* -------------- TOTAL  -----------------------*/
    const prixTotal = await (
      await fetch(
        " https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/prix?idTransaction=" +
          transaction.idTransaction
      )
    ).json();

    const total = document.createElement("div");
    total.className =
      "d-flex align-items-center justify-content-between transaction_contenu_information_total";
    total.innerHTML = " <div>Total</div><div>" + prixTotal + "</div>";

    information.appendChild(total);

    contenu.appendChild(image);
    contenu.appendChild(information);

    /* -------------- LES BOUTONS  -----------------------*/
    const bouton = document.createElement("div");
    bouton.className =
      "d-flex flex-column align-items-center justify-content-center transaction_contenu_bouton";

    const afficher = document.createElement("div");
    afficher.className = "transaction_contenu_bouton_normal";
    afficher.textContent = "Afficher le produit";
    afficher.addEventListener("click", () => {
      window.location.href =
        "../unePrestation.html?prestation=" +
        transaction.prestation.idPrestation;
    });

    bouton.appendChild(afficher);
    if (type == "recu") {
      const refuser = document.createElement("div");
      refuser.className = "bg-danger text-white";
      refuser.textContent = "Refuser ";
      refuser.addEventListener("click", function () {
        fetch(
          "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/refuse?idTransaction=" +
            transaction.idTransaction
        );
        trans.parentNode.removeChild(trans);
      });

      const accepter = document.createElement("div");
      accepter.className = "bg-success text-white";
      accepter.textContent = "Accepter";
      accepter.addEventListener("click", function () {
        fetch(
          "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/accepte?idTransaction=" +
            transaction.idTransaction
        );
        trans.parentNode.removeChild(trans);
      });

      bouton.appendChild(accepter);
      bouton.appendChild(refuser);
    }
    contenu.append(bouton);
    /* -------------- AJOUT TITRE INFORMATION -----------------------*/
    trans.append(titre);
    trans.append(contenu);

    return trans;
  }
}

async function creationProlongation(prolongation) {
  let cont = true;
  if (type == "recu") {
    if (new Date(prolongation.dateDebut) < new Date()) {
      fetch(
        "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prolongation/refuse?idTrans=" +
          prolongation.transaction.idTransaction +
          "&dateDemande=" +
          prolongation.dateDemande
      ).then(() => (cont = false));
    }
  } else {
    if (new Date(prolongation.dateDebut) < new Date()) {
      fetch(
        "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prolongation/refuse?idTrans=" +
          prolongation.transaction.idTransaction +
          "&dateDemande=" +
          prolongation.dateDemande
      );
    }
  }
  if (cont === true) {
    const trans = document.createElement("div");
    trans.className = "transaction";
    /* -------------- TITRE -----------------------*/

    const titre = document.createElement("div");
    titre.className = "transaction_titre";
    titre.textContent = prolongation.transaction.prestation.libelle;
    /* -------------- LES INFORMATIONS -----------------------*/
    const contenu = document.createElement("div");
    contenu.className =
      "d-flex align-items-center justify-content-between transaction_contenu";

    /* -------------- IMAGE -----------------------*/
    const lesImages = await (
      await fetch(
        "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/image/byPrestation?idPrestation=" +
          prolongation.transaction.prestation.idPrestation
      )
    ).json();

    const image = document.createElement("div");
    image.className = "transaction_contenu_photo";
    image.style.backgroundImage =
      lesImages.length != 0 ? "url(" + lesImages[0].base64 + ")" : "";

    /* -------------- CONTENU INFORMATION -----------------------*/
    const information = document.createElement("div");
    information.className =
      "d-flex flex-column justify-content-center transaction_contenu_information";

    // PROPRIO

    const propNote = document.createElement("div");
    propNote.className =
      "d-flex align-items-center justify-content-between transaction_contenu_information_propNote";

    const proprio = document.createElement("div");
    proprio.className =
      "d-flex align-items-center justify-content-between transaction_contenu_information_propNote_proprio";

    const proprioImg = document.createElement("div");
    proprioImg.className =
      "transaction_contenu_information_propNote_proprio_image";

    const utilisateur =
      type == "recu"
        ? prolongation.transaction.gentiVoisin
        : prolongation.transaction.prestation.gentiVoisin;

    proprioImg.style.backgroundImage = utilisateur.photoProfil
      ? "url(" + utilisateur.photoProfil + ")"
      : "";

    const proprioPerso = document.createElement("div");
    proprioPerso.className =
      "transaction_contenu_information_propNote_proprio_perso";

    const proprioNomP = document.createElement("div");
    proprioNomP.textContent = utilisateur.prenom + " " + utilisateur.nom;
    const proprioAdd = document.createElement("div");
    proprioAdd.textContent = utilisateur.adresse;

    proprioPerso.appendChild(proprioNomP);
    proprioPerso.appendChild(proprioAdd);

    proprio.appendChild(proprioImg);
    proprio.appendChild(proprioPerso);

    propNote.appendChild(proprio);

    //NOTE
    const note = document.createElement("div");
    note.className = "d-flex transaction_contenu_information_propNote_note";

    const laNote =
      type == "recu"
        ? prolongation.transaction.noteEmprunteur
        : prolongation.transaction.noteProprio;

    if (laNote != -1) {
      for (let i = 0; i < Math.floor(laNote); i++) {
        note.appendChild(
          creationElement(
            "transaction_contenu_information_propNote_note_complet"
          )
        );
      }

      if (Math.floor(laNote) != Math.ceil(laNote)) {
        note.appendChild(
          creationElement(
            "transaction_contenu_information_propNote_note_moitie"
          )
        );
      }

      for (let i = Math.ceil(laNote); i < 5; i++) {
        note.appendChild(
          creationElement("transaction_contenu_information_propNote_note_vide")
        );
      }
    }

    propNote.appendChild(note);
    information.appendChild(propNote);

    /* -------------- STATISTIQUE ET DATE -----------------------*/
    const statDate = document.createElement("div");
    statDate.className =
      "d-flex align-items-center justify-content-between transaction_contenu_information_statDate";

    // STATUT
    const statut = document.createElement("div");
    statut.className =
      "d-flex  align-items-center transaction_contenu_information_statDate_statut";

    const dateDebut = prolongation.transaction.dateDebut;
    const dateFin = await (
      await fetch(
        " https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/dateFin?idTransaction=" +
          prolongation.transaction.idTransaction
      )
    ).json();

    if (type === "recu") {
      statut.innerHTML =
        "<div class='transaction_contenu_information_statDate_enCours'> </div>En attente";
    } else {
      if (prolongation.accepte == 1) {
        statut.innerHTML =
          "<div class='transaction_contenu_information_statDate_futur'> </div>Accepté";
      } else if (prolongation.accepte == 2) {
        statut.innerHTML =
          "<div class='transaction_contenu_information_statDate_passe'> </div>Refusé";
      } else {
        statut.innerHTML =
          "<div class='transaction_contenu_information_statDate_enCours'> </div>En attente";
      }
    }

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const demande = document.createElement("div");
    demande.textContent =
      "Demandé le " +
      new Date(prolongation.dateDemande).toLocaleDateString("fr-FR", options);

    statDate.appendChild(statut);
    statDate.appendChild(demande);

    information.appendChild(statDate);

    /* -------------- LES DATES DE LA TRANSACTION -----------------------*/
    const datesTrans = document.createElement("div");
    datesTrans.className =
      "d-flex align-items-center transaction_contenu_information_lesDates";

    datesTrans.textContent =
      "Initialement du " +
      new Date(dateDebut).toLocaleDateString("fr-FR", options) +
      " au " +
      new Date(dateFin).toLocaleDateString("fr-FR", options);

    information.appendChild(datesTrans);

    /* -------------- LES DATES DE LA PROLONGATION -----------------------*/
    const datesProlong = document.createElement("div");
    datesProlong.className =
      "d-flex align-items-center transaction_contenu_information_lesDates";

    datesProlong.textContent =
      "Prolongation du " +
      new Date(prolongation.dateDebut).toLocaleDateString("fr-FR", options) +
      " au " +
      new Date(prolongation.dateFin).toLocaleDateString("fr-FR", options);

    datesProlong.style.borderTop = "none";

    information.appendChild(datesProlong);

    /* -------------- TOTAL  -----------------------*/
    const prixTotal = await fetch(
      "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/valorisation/byTransaction?idTransaction=" +
        prolongation.transaction.idTransaction
    )
      .then((data) => data.json())
      .then(
        (json) =>
          json.prixJournalier *
          difference(prolongation.dateDebut, prolongation.dateFin)
      );

    const total = document.createElement("div");
    total.className =
      "d-flex align-items-center justify-content-between transaction_contenu_information_total";
    total.innerHTML = " <div>Total</div><div>" + prixTotal + "</div>";

    information.appendChild(total);

    contenu.appendChild(image);
    contenu.appendChild(information);

    /* -------------- LES BOUTONS  -----------------------*/
    const bouton = document.createElement("div");
    bouton.className =
      "d-flex flex-column align-items-center justify-content-center transaction_contenu_bouton";

    const afficher = document.createElement("div");
    afficher.className = "transaction_contenu_bouton_normal";
    afficher.textContent = "Afficher le produit";
    afficher.addEventListener("click", () => {
      window.location.href =
        "unePrestation.html?prestation=" +
        prolongation.transaction.prestation.idPrestation;
    });

    bouton.appendChild(afficher);
    if (type == "recu") {
      const avis = document.createElement("div");
      avis.className = "bg-success text-white";
      avis.textContent = "Accepter";

      const prolonger = document.createElement("div");
      prolonger.className = "bg-danger text-white";
      prolonger.textContent = "Refuser ";

      const refuser = document.createElement("div");
      refuser.className = "bg-danger text-white";
      refuser.textContent = "Refuser ";
      refuser.addEventListener("click", function () {
        fetch(
          "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prolongation/refuse?idTrans=" +
            prolongation.transaction.idTransaction +
            "&dateDemande=" +
            prolongation.dateDemande
        );
        trans.parentNode.removeChild(trans);
      });

      const accepter = document.createElement("div");
      accepter.className = "bg-success text-white";
      accepter.textContent = "Accepter";
      accepter.addEventListener("click", function () {
        fetch(
          "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prolongation/accepte?idTrans=" +
            prolongation.transaction.idTransaction +
            "&dateDemande=" +
            prolongation.dateDemande
        );
        trans.parentNode.removeChild(trans);
      });

      bouton.appendChild(accepter);
      bouton.appendChild(refuser);
    }
    contenu.append(bouton);
    /* -------------- AJOUT TITRE INFORMATION -----------------------*/
    trans.append(titre);
    trans.append(contenu);

    return trans;
  }
}

async function afficherDonnee() {
  const lesDonnes = document.querySelector(
    ".recherche_all_resultat_lesPrestations"
  );

  lesDonnes.innerHTML = "";

  if (transacOuProlon == 0) {
    const data = type == "recu" ? transactionRecu : transactionEnvoye;
    for (let elt of data) {
      lesDonnes.appendChild(await creationTransaction(elt));
    }
    document.getElementById("recu").textContent =
      " (" + transactionRecu.length + ")";

    document.getElementById("envoye").textContent =
      " (" + transactionEnvoye.length + ")";
  } else {
    const data = type == "recu" ? prolongationRecu : prolongationEnvoye;
    for (let elt of data) {
      lesDonnes.appendChild(await creationProlongation(elt));
    }
    document.getElementById("recu").textContent =
      " (" + prolongationRecu.length + ")";

    document.getElementById("envoye").textContent =
      " (" + prolongationEnvoye.length + ")";
  }
}

function changementResultat() {
  const once = {
    once: true,
  };

  const bordure = document.querySelector(
    ".recherche_all_resultat_titre :nth-child(3)"
  );

  if (type == "recu") {
    const recu = document.querySelector(
      ".recherche_all_resultat_titre :nth-child(1)"
    );
    recu.addEventListener("click", () => changementResultat(), once);
    bordure.style.animation = "resultatAGauche 0.25s ease-in-out forwards";
    type = "envoye";
  } else if (type == "envoye") {
    const envoye = document.querySelector(
      ".recherche_all_resultat_titre :nth-child(2)"
    );
    envoye.addEventListener("click", () => changementResultat(), once);
    bordure.style.animation = "resultatADroite 0.25s ease-in-out forwards";
    type = "recu";
  }

  afficherDonnee();
}

async function initialiserTransaction() {
  let connecte = getCookie("id_user");

  if (!connecte) {
    window.location = "../index.html";
  }

  /* -------------- OBTENIR LES TRANSACTIONS RECUS PAS ENCORE ACCEPTES-----------------------*/
  transactionRecu = await (
    await fetch(
      "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byProprio?idGenti=" +
        connecte
    ).then((data) => data.json())
  ).filter((transaction) => transaction.accepte == 0);

  /* -------------- OBTENIR LES TRANSACTIONS ENVOYES -----------------------*/
  transactionEnvoye = await (
    await fetch(
      "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byGenti?idGenti=" +
        connecte
    )
  ).json();

  /* -------------- OBTENIR LES PROLONGATIONS RECUS-----------------------*/
  prolongationRecu = await (
    await fetch(
      "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prolongation/byPropriobyStatut?idGenti=" +
        connecte +
        "&statut=0"
    ).then((data) => data.json())
  ).filter((prolongation) => prolongation.accepte == 0);

  /* -------------- OBTENIR LES PROLONGATIONS ENVOYES-----------------------*/
  prolongationEnvoye = await (
    await fetch(
      "https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prolongation/byGentibyStatut?idGenti=" +
        connecte +
        "&statut=0"
    )
  ).json();

  /* -------------- SWITCH  ACHATS <-> envoyeS -----------------------*/
  const envoyes = document.querySelector(
    ".recherche_all_resultat_titre :nth-child(2)"
  );

  const once = {
    once: true,
  };

  envoyes.addEventListener("click", () => changementResultat(), once);

  afficherDonnee();
}

for (radio of document.querySelectorAll('input[type="radio"][name="type"]')) {
  radio.addEventListener("change", (event) => {
    transacOuProlon = event.target.value;
    afficherDonnee();
  });
}

initialiserTransaction();
