"use strict"

const form = document.querySelector("#form");
const selectType = document.querySelector("#typePrestation");
const selectCategorie = document.querySelector("#categorie")
const modele = document.querySelector("#modele");
const taille = document.querySelector("#taille");
const marque = document.querySelector("#marque");

const dureePresta = document.querySelector("#duree");

const boutonValider = document.querySelector("#valider");
const boutonAnnuler = document.querySelector("#annuler");
const boutonRetour = document.querySelector("#retour");

const libelle = document.querySelector("#libelle");
const description = document.querySelector("#description");
const fichierImage = document.getElementById("fichierImage");
const boutonEffacer = document.querySelector("#effacer")
const categoriesSelect = document.getElementById("categorie");

const titreEtape = document.getElementById("titreEtape");

//erreur
const erreurLibelle = document.querySelector(".error-libelle");
const erreurCategorie = document.querySelector(".error-categorie");
const erreurType = document.querySelector(".error-type");
const erreurDescription = document.querySelector(".error-description");
const erreurPrix = document.querySelector(".error-prix");
const erreurImage = document.querySelector(".error-image");
const erreurMarque = document.querySelector(".error-marque");
const erreurModele = document.querySelector(".error-modele");
const erreurTaille = document.querySelector(".error-taille");
const erreurHeurePresta = document.querySelector(".error-heure");
const spansErreurs = document.querySelectorAll("[class^='error-']");
//

// sections

const sectionChoix = document.querySelector(".sectionChoix");
const sectionDescription = document.querySelector(".sectionDescription");
const sectionMateriel = document.querySelector(".sectionMateriel");
const sectionImage = document.querySelector(".sectionImage");
const sectionDuree = document.querySelector(".sectionDuree");

let pageActuelle = "";


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
if(idUser == null || idUser == ""){
    window.location="index.html";
}

// Charger les départements au chargement de la page
window.onload = function () {
    if(selectType.value == "materiel") {
        sectionDuree.style = "display : none";
        sectionMateriel.style = "display : block";
        loadCategories();
    } else if(selectType.value == "service") {
        sectionDuree.style = "display : block";
        sectionMateriel.style = "display : none";
        loadCategories();
    }
};


/* fonctions d'affichage */

function displaySection(choix, description, image, page) {

    sectionChoix.style.display = choix;
    sectionDescription.style.display = description;
    sectionImage.style.display = image;
    pageActuelle = page;
    if(page != "choix") {
        boutonRetour.style.display = "block";
        sectionMateriel.style.display = "none";
        sectionDuree.style.display = "none";
    } else {
        if(selectType.value == "materiel") {
            sectionMateriel.style.display = "block";
        } else if(selectType.value == "service") {
            sectionDuree.style.display = "block";
        }
    }
}




if(pageActuelle == "") {
    displaySection("block", "none", "none", "choix");
    boutonRetour.style.display = "none";
    sectionMateriel.style = "display : none";
    sectionDuree.style = "display : none";
    effacerSelect();
} else {
    boutonRetour.style.display = "block";
}

// Parcourir chaque span d'erreur
spansErreurs.forEach(function(span) {
    span.textContent = ""; //&#8203;
});


if(selectType.value == "materiel") {
    sectionMateriel.style = "display : block";
} else if(selectType.value == "service") {
    sectionDuree.style = "display : block";
}

selectType.addEventListener("change", function() {
    if(selectType.value == "materiel") {
        sectionDuree.style = "display : none"
        sectionMateriel.style = "display : block"
        dureePresta.value = null;
        effacerSelect();
        loadCategories();
    } else if(selectType.value == "service") {
        sectionMateriel.style = "display : none"
        sectionDuree.style = "display : block"
        erreurTaille.textContent = "";
        erreurModele.textContent = "";
        erreurMarque.textContent = "";
        taille.value = null;
        marque.value = null;
        modele.value = null;
        effacerSelect();
        loadCategories();
    }
    else {
        sectionMateriel.style = "display : none"
        sectionDuree.style = "display : none"
        taille.value = null;
        marque.value = null;
        modele.value = null;
        dureePresta.value = null;
        effacerSelect();
    }
});


//fonctions 

function effacerCategSelect() {

    let categList = document.getElementById('categSelectListe');
    let categContainer = document.getElementById('categSelect');

    while (categList.firstChild) {
        categList.removeChild(categList.firstChild);
    }

    if (categList.children.length === 0) {
        categContainer.style.display = 'none';
    } else {
        categContainer.style.display = 'block';
    }
}

function effacerSelect() {
    let select = document.getElementById("categorie");
    for (let i = select.options.length - 1; i > 0; i--) {
        select.remove(i);
    }
}


function verifSelect(select) {
    let categSelectListe = document.getElementById('categSelectListe');
    if(categSelectListe.children.length == 0) {
        if(select.value != "materiel" || select.value != "service") {
            return false;
        } else return true;
    }
}


function verifChaine(chaine) {
    if (chaine.value != null && chaine.value !== "") {
        const alphanumericPattern = /^[a-zA-Z0-9\s.,'’\-+()!?ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝßàáâãäåçèéêëìíîïñòóôõöùúûüýÿ]*$/;
        if (!alphanumericPattern.test(chaine.value)) {
            return "Veuillez utiliser uniquement des lettres et des chiffres.";
        }
    } else {
        return "Ce champ est obligatoire.";
    }
    return ""; 
}

function verifierChiffres(chaine) {
    if (chaine.value !== null && chaine.value !== "") {
        if (isNaN(chaine.value)) {
            return "Ce champ doit contenir uniquement des chiffres.";
        }
    } else {
        return "Ce champ est obligatoire.";
    }
    return ""
}

function validateFileType(fichier){
    if(fichier.files[0] != undefined) {
        let file = fichier.value;
        let idxDot = file.lastIndexOf(".") + 1;
        let extFile = file.substr(idxDot, file.length).toLowerCase();
        if (extFile=="jpg" || extFile=="jpeg" || extFile=="png"){
            return "";
        }else{
            return "Seulement les fichiers jpg/jpeg et png sont autorisés";
        }   
    } else {
        return "Veuillez insérer une image";
    }

}

function verifHeure(heure) {
    if(heure.value == null || extraireHeure(heure.value) == 0 || heure.value == "") {
        return "Veuillez indiquer la durée de votre préstation";
    } else {
        return "";
    }
}

function extraireHeure(chaine) {
        let temps = chaine.split(':');
        let heure = parseInt(temps[0]) + parseInt(temps[1])/60
        return heure;
}



function traiterCategories() {
    let categSelectListe = document.getElementById('categSelectListe');
    let categories = "";
    for (let i = 0; i < categSelectListe.children.length; i++) {
        categories += categSelectListe.children[i].value;
        if (i < categSelectListe.children.length - 1) {
            categories += "-";
        }
    }

    return categories;
}


function changeProgressBar(progress, titre) {
    document.querySelector(".progress-bar").style.width = progress + "%";
    document.querySelector(".progress-bar").setAttribute("aria-valuenow", progress);
    titreEtape.textContent = titre;
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


// actions


//pour effacer les messages d'erreurs quand l'utilisateur change les valeurs 

selectType.addEventListener('change', function() {
    erreurType.textContent = '';
});

selectCategorie.addEventListener('change', function() {
    erreurCategorie.textContent = '';
});

taille.addEventListener('change', function() {
    erreurTaille.textContent = '';
});

marque.addEventListener('change', function() {
    erreurMarque.textContent = '';
});

modele.addEventListener('change', function() {
    erreurModele.textContent = '';
});

description.addEventListener('change', function() {
    erreurDescription.textContent = '';
});

libelle.addEventListener('change', function() {
    erreurLibelle.textContent = '';
});

dureePresta.addEventListener('change', function() {
    erreurHeurePresta.textContent = '';
});

/* boutons */

boutonEffacer.addEventListener("click", function() {
    fichierImage.value = ""; 
    let image = document.getElementById('output');
    image.src = "";
});

boutonRetour.addEventListener("click", function() {

    if(pageActuelle == "description") {
        displaySection("block","none","none","choix");
        boutonRetour.style.display = "none";
        erreurDescription.textContent = "";
        erreurLibelle.textContent = "";
        changeProgressBar("33","Commençons par l'essentiel");

    } 

    if(pageActuelle == "image") {
        displaySection("none","block","none","description");
        erreurImage.textContent = "";
        boutonValider.textContent = "Suivant";
        changeProgressBar("66","Approfondissons les détails");
    } 

});


boutonAnnuler.addEventListener("click", (event) => {
    event.preventDefault();
    window.location = "gererMesAnnonces.html";
    libelle.value = null;
    description.value = null;
    modele.value = null;
    taille.value = null;
    marque.value = null;
    dureePresta.value = null;
    tabImages = []
    categSelectListe.innerHTML = '';
    document.getElementById('categSelect').style.display = 'none';
    removeAllChildNodes(imageContainer); 
});


boutonValider.addEventListener("click", (event) => {
    event.preventDefault();

    let verif = 0;

    if(pageActuelle == "choix") {

        let valide = true;
    
        if(verifSelect(selectType) == false) {
            erreurType.textContent = "Veuillez choisir une prestation";
            valide = false;
        } else {
            erreurType.textContent = " ";
        }
    
        if(verifSelect(selectCategorie) == false) {
            erreurCategorie.textContent = "Veuillez choisir une catégorie";
            valide = false;
        } else {
            erreurCategorie.textContent = "";
        }

        if(selectType.value == "materiel") {
        
            if(verifierChiffres(taille) != "") {
                erreurTaille.textContent = verifierChiffres(taille);
                valide = false;
                console.log(verifierChiffres(taille));
            } else {
                erreurTaille.textContent = "";
            }
    
            if(verifChaine(marque) != "") {
                erreurMarque.textContent = verifChaine(marque);
                valide = false;
            } else {
                erreurMarque.textContent = "";
            }
        
            if(verifChaine(modele) != "") {
                erreurModele.textContent = verifChaine(modele);
                valide = false;
            } else {
                erreurModele.textContent = "";
            }
        } else if(selectType.value == "service"){
            if(verifHeure(dureePresta) != "") {
                erreurHeurePresta.textContent = verifHeure(dureePresta);
                valide = false;
            } else {
                erreurHeurePresta.textContent = "";
            }
        }

        let categSelectListe = document.getElementById('categSelectListe');

        if (categSelectListe.children.length > 0) {
            erreurDescription.textContent = "";
        } else {
            erreurCategorie.textContent = "Veuillez renseigner au moins une catégorie";
            valide = false;
        }
    

        if(valide == true) {
            displaySection("none","block","none","description");
            verif = 1;
        }
    }

    if(pageActuelle == "description") {
        changeProgressBar("66","Approfondissions les détails");
        if(verif != 1) {

        let valide = true;

        if(verifChaine(libelle) != "") {
            erreurLibelle.textContent = verifChaine(libelle);
            valide = false;
        } else {
            erreurLibelle.textContent = "";
        }
    
        if(verifChaine(description) != "") {
            erreurDescription.textContent = verifChaine(description);
            valide = false;
        } else {
            erreurDescription.textContent = "";
        }

        if(valide == true) {
            displaySection("none","none","block","image");
        }

        verif = 2;

    }
    
    }

    if(pageActuelle == "image") {
        changeProgressBar("100","Finissons avec une image");
        boutonValider.textContent = "Valider";

        if(verif != 2 && verif != 1) {
        
            let valide = true;
            
            if(validateFileType(fichierImage) != "") {
                erreurImage.textContent = validateFileType(fichierImage);
                fichierImage.value = "";
                valide = false;
            } else {
                erreurImage.textContent = "";
                const formData = new FormData(form);
            
                let prestation = selectType.value;
                let libelle = formData.get("libelle");
                let description = formData.get("description");
                let modele = formData.get("modele");
                let taille = formData.get("taille");
                let marque = formData.get("marque");
                let dureeHeure = extraireHeure(dureePresta.value);
                //tabImages est initiée au dessus de la fonction ajoutImage
        
                let categId = traiterCategories();

                if(prestation == "service") {
                    insertService(libelle,description,dureeHeure,idUser,categId,tabImages);
                } else {
                    insertMateriel(libelle,description,taille,marque,modele,idUser,categId,tabImages);
                }
            }
        }

        verif = 3;
    }

});

/** fonction avec API */



async function insertService(lib, desc, duree, id, categ, tab) {

    console.log(tabImages);

    for (let i = 0; i < tab.length; i++) {
        if(tab[i] == null) {
            tab[i] = "";
        }
    } 

    try {
        const resultat=await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/service/insert?libelle="+lib+"&description="+desc+"&duree="+duree+"&idGenti="+id+"&lesCategories="+categ, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image1: tab[0],image2: tab[1],
                image3: tab[2] ,image4: tab[3],image5: tab[4] }) // Envoyer les données Base64 dans un objet JSON
        })
        .then(response => {
            console.log("succes "+ response);
            window.location = "gererMesAnnonces.html";
            libelle.value = null;
            description.value = null;
            modele.value = null;
            taille.value = null;
            marque.value = null;
            dureePresta.value = null;
            tabImages = []
            categSelectListe.innerHTML = '';
            document.getElementById('categSelect').style.display = 'none';
            removeAllChildNodes(imageContainer); 
        });
        console.log(resultat);
    } catch (error) {
        console.log('Erreur lors de l\'envoi des données :', error);
    }

}



async function insertMateriel(lib, desc, Taille, Marque, Modele, Id, categ, tab) {
    try {

        for (let i = 0; i < tab.length; i++) {
            if(tab[i] == null) {
                tab[i] = "";
            }
        } 

        const resultat =await fetch(`https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/materiel/insert?libelle=${lib}&description=${desc}&taille=${Taille}&marque=${Marque}&modele=${Modele}&idGenti=${Id}`+`&lesCategories=`+categ, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({image1 : tab[0], image2 : tab[1], image3 : tab[2], image4 : tab[0], image5 : tab[4]})
        })
        .then(response => {
            console.log(response);
            window.location = "gererMesAnnonces.html";
            libelle.value = null;
            description.value = null;
            modele.value = null;
            taille.value = null;
            marque.value = null;
            dureePresta.value = null;
            tabImages = []
            categSelectListe.innerHTML = '';
            document.getElementById('categSelect').style.display = 'none';
            removeAllChildNodes(imageContainer); 
        }
        );
        console.log(resultat);
        console.log('materiel inséré avec succès');
    } catch (error) {
        console.log('Erreur lors de l\'envoi des données :', error);
    }
}

function loadCategories() {
    fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/categorie/get")
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur HTTP, status : " + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log(data.libelle);
            data.forEach(function (categorie) {
                let option = document.createElement("option");
                option.text = categorie.libelle;
                option.value = categorie.idCateg;
                categoriesSelect.add(option);
            });
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données :", error);
        });
}






let incrementeur = 0; // Compteur pour suivre le nombre d'images ajoutées
let imageContainer = document.getElementById('imageContainer');
let nomImage = []; // Tableau pour stocker les noms de fichiers des images déjà ajoutées
let tabImages = [];
let base64Image;

function ajoutImage(event) {

    let input = event.target;

    if(validateFileType(fichierImage) != "") {
        erreurImage.textContent = validateFileType(fichierImage);
        fichierImage.value = "";
    } else {

        erreurImage.textContent = "";

        if (input.files && input.files[0]) {
            if (incrementeur >= 5) {
                erreurImage.textContent = "Vous avez atteint le nombre maximum d'images autorisées (5).";
                setTimeout(function () {
                    erreurImage.textContent = "";
                }, 3000);
                input.value = ""; 
                return;
            }

            let file = input.files[0]; 

            let reader = new FileReader();
            reader.onload = function(e) {
                // Créer une image pour la prévisualisation
                let img = document.createElement('img');
                img.src = e.target.result;
                base64Image = reader.result;
                console.log(base64Image);
                tabImages.push(base64Image);

                // Créer un bouton pour supprimer l'image
                let boutonSupprimer = document.createElement('button');
                boutonSupprimer.textContent = 'Supprimer';
                boutonSupprimer.classList.add('btnSuppImg');

                boutonSupprimer.onclick = function() {
                    imageContainer.removeChild(div); 
                    nomImage.splice(nomImage.indexOf(file.name), 1); 
                    let index = tabImages.findIndex(image => image.name === file.name);
                    tabImages.splice(index, 1);
                    incrementeur--; 
                };

                let div = document.createElement('div');
                div.classList.add('image-item'); 
                div.appendChild(img); 
                div.appendChild(boutonSupprimer); 
                imageContainer.appendChild(div);

                incrementeur++; 
                nomImage.push(file.name); 
            };
            reader.readAsDataURL(file);

        }
    }
}

function ajoutCategorieSelect() {
let categSelectListe = document.getElementById('categSelectListe');
if(selectCategorie.value != "") {
     // Vérifier si le nombre d'éléments dans la liste est inférieur à 5
     if (categSelectListe.children.length < 5) {
        // Parcourir toutes les options sélectionnées dans le select
        for (let option of selectCategorie.selectedOptions) {
            // Vérifier si l'option n'existe pas déjà dans la liste
            if (!categSelectListe.querySelector(`[value="${option.value}"]`)) {
                // Créer un nouvel élément li pour chaque option sélectionnée
                let listItem = document.createElement('li');
                listItem.textContent = option.text;
                listItem.setAttribute('value', option.value);
                erreurCategorie.textContent ="";

                // Créer un bouton de suppression pour chaque élément de la liste
                let deleteButton = document.createElement('button');
                deleteButton.innerHTML = 'Effacer';
                deleteButton.id = "btnSuppCateg";
                deleteButton.onclick = function() {
                    listItem.remove(); // Supprimer l'élément de la liste
                    // Vérifier si la liste est vide après la suppression
                    if (categSelectListe.children.length === 0) {
                        document.getElementById('categSelect').style.display = 'none'; // Cacher la liste
                    }
                };

                // Ajouter le bouton de suppression à l'élément li
                listItem.appendChild(deleteButton);

                // Ajouter l'élément li à la liste des catégories sélectionnées
                categSelectListe.appendChild(listItem);

                // Afficher la liste une fois qu'au moins une catégorie est ajoutée
                document.getElementById('categSelect').style.display = 'block';
            }
        }
    } else {
        erreurCategorie.textContent = "Vous avez attenint le nombre maximum de catégories";

        setTimeout(function () {
            erreurCategorie.textContent = "";
        }, 3000);
    }   
}

}
