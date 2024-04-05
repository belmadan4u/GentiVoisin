"use strict";
var formulaireConnexion = document.getElementById("formulaireCo");
var formulaireInscription = document.getElementById("formulaireInscription");
var btnSinscrire = document.getElementById("Sinscrire");
var btnSeCo = document.getElementById("SeCo");
formulaireConnexion.addEventListener("submit", function (e) {
    e.preventDefault();
    var loginInput = document.getElementById("login").value.trim();
    var passwordInput = document.getElementById("password").value.trim();
    if (loginInput === '' || passwordInput === '') {
        alert("Veuillez renseigner tous les champs");
        return;
    }
    fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/verifierMdp?id=".concat(encodeURI(loginInput), "&mdp=").concat(encodeURI(passwordInput)))
        .then(function (response) {
        if (!response.ok) {
            throw new Error('La requête a échoué');
        }
        return response.json();
    })
        .then(function (res) {
        if (res) {
            console.log(res);
            return fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byId/?id=".concat(res));
        }
        else {
            alert("Connexion échouée");
        }
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error('La requête a échoué');
        }
        return response.json();
    })
        .then(function (data) {
        if (data['valide'] == 0) { // si user non validé
            alert("L'administrateur ne vous as toujours pas validé. Veuillez réessayer ulterieurement.");
        }
        else if (data['valide'] == 1) { // si user validé
            document.cookie = "id_user=".concat(data['idUser']);
            window.location.href = "index.html";
        }
        else if (data['valide'] == 2) { // si user banni
            alert("Vous avez été banni, contactez l'administrateur pour plus d'informations");
        }
    })
        .catch(function (error) {
        console.error('Erreur lors de la récupération des données:', error);
    });
});
// pour afficher soit le formulaire de connexion soit le formulaire d'inscription
formulaireInscription.style.display = "none";
btnSinscrire.addEventListener("click", function (e) {
    formulaireConnexion.style.display = "none";
    formulaireInscription.style.display = "";
    btnSeCo.className = "inactive underlineHover";
    btnSinscrire.className = "active";
});
btnSeCo.addEventListener("click", function (e) {
    formulaireConnexion.style.display = "";
    formulaireInscription.style.display = "none";
    btnSeCo.className = "active";
    btnSinscrire.className = "inactive underlineHover";
});
//pour valider l'inscription
formulaireInscription.addEventListener("submit", function (e) {
    e.preventDefault();
    var nomInput = document.getElementById("nom").value.trim();
    var prenomInput = document.getElementById("prenom").value.trim();
    var adresse = document.getElementById("adresse").value.trim();
    var telInput = document.getElementById("telephone").value.trim();
    var mailInput = document.getElementById("email").value.trim();
    var mdpInput = document.getElementById("motDePasse").value.trim();
    var mdp2Input = document.getElementById("motDePasse2").value.trim();
    var rayonDeDeplacement = document.getElementById("rayonDeplacement").value.trim();
    if (mdpInput != mdp2Input) {
        alert("Les mots de passe ne sont pas identiques");
    }
    else {
        fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/insert?nom=".concat(encodeURI(nomInput), "&prenom=").concat(encodeURI(prenomInput), "&adresse=").concat(encodeURI(adresse), "&mail=").concat(encodeURI(mailInput), "&mdp=").concat(encodeURI(mdpInput), "&telephone=").concat(encodeURI(telInput), "&rayonDeplacement=").concat(encodeURI(rayonDeDeplacement)))
            .then(function (response) {
            console.log(response);
            alert("Inscription réussie, vous pouvez essayer de vous connecter avec vos nouveaux identifiants");
            window.location.reload();
        })
            .catch(function (error) { return console.error('Erreur lors de la récupération des données:', error); });
    }
    ;
});
