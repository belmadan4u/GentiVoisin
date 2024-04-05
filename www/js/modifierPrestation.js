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

const libelle = document.querySelector("#libelle");
const description = document.querySelector("#description");
const prix = document.querySelector("#prix");
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

const url = new URLSearchParams(window.location.search);
const idPrestation = url.get("id");


if(idPrestation == null || idPrestation == "") {
    window.location = "index.html";
}


let typePresta = "";
let idMateriel = null;
let idService = null;
let tabIdImagesSupp = [];
let tabIdCateg = [];
let tabImagesSupp = [];
let tabImagesBdd = [];



// Charger les départements au chargement de la page
window.onload = function () {

    infoPrest(idPrestation);
    chargementListImages(idPrestation);
    loadCategories();
    chargementListCategories(idPrestation);
    /*if(typePresta == "materiel" || typePresta== "service") {

    } */

};


function effacerSelect() {
    let select = document.getElementById("categorie");
    for (let i = select.options.length - 1; i > 0; i--) {
        select.remove(i);
    }
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

function convertirEnHeureString(heure) {
    let heures = Math.floor(heure);
    let minutes = Math.round((heure - heures) * 60);
    let heureString = `${heures.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return heureString;
}

let incrementeur = 0; 

async function chargementListImages(id){

    const resultat= await ((await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/image/byPrestation?idPrestation="+id)).json());
    const list= document.getElementById('imageContainer');
    resultat.forEach(element => {

        let img= document.createElement("img");
        img.src=element.base64;
        tabImages.push(img.src);
        tabImagesBdd.push(img.src);


        let div = document.createElement('div');
        div.classList.add('image-item'); 
        div.appendChild(img); 
        list.appendChild(div);



        let boutonSupprimer = document.createElement('button');
        boutonSupprimer.textContent = 'Supprimer';
        boutonSupprimer.classList.add('btnSuppImg');

        boutonSupprimer.onclick = function() {
            imageContainer.removeChild(div); 
            for(let i = 0; i < tabImages.length; i++) {
                if(tabImages[i] === img.src) {
                    tabImages.splice(i, 1); // Retire l'élément du tableau à l'index i
                    break; // Sort de la boucle une fois que l'élément est retiré
                }
            }

            for(let i = 0; i < tabImagesBdd.length; i++) {
                if(tabImagesBdd[i] === img.src) {
                    tabImagesBdd.splice(i, 1); // Retire l'élément du tableau à l'index i
                    break; // Sort de la boucle une fois que l'élément est retiré
                }
            }

            tabIdImagesSupp.push(element["idImage"]);
            tabImagesSupp.push(img.src);
            incrementeur--;
        }
        

        div.appendChild(img); 
        div.appendChild(boutonSupprimer); 
        imageContainer.appendChild(div);
        incrementeur ++;

    });
    
}



async function chargementListCategories(id) {
    const resultat= await ((await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/appartient/byPrestation?idPres="+id)).json());
    let categSelectListe = document.getElementById('categSelectListe');
    resultat.forEach(element => {

        let listItem = document.createElement('li');
        listItem.textContent = element["categorie"]["libelle"];
        listItem.setAttribute('value', element["categorie"]["idCateg"]);
        erreurCategorie.textContent ="";
    
        // Créer un bouton de suppression pour chaque élément de la liste
        let deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'Effacer';
        deleteButton.id = "btnSuppCateg";
        deleteButton.onclick = function() {
            listItem.remove(); 
            if (categSelectListe.children.length === 0) {
            document.getElementById('categSelect').style.display = 'none'; // Cacher la liste
            }
            tabIdCateg.push(element["categorie"]["idCateg"]);

        };
    
        // Ajouter le bouton de suppression à l'élément li
        listItem.appendChild(deleteButton);
    
        // Ajouter l'élément li à la liste des catégories sélectionnées
        categSelectListe.appendChild(listItem);

    
        // Afficher la liste une fois qu'au moins une catégorie est ajoutée
        document.getElementById('categSelect').style.display = 'block';
    })

}
            


function infoPrest(id) {
    fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/byId?id="+id)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur HTTP, status : " + response.status);
            }
            return response.json();
        })
        .then(data => {
            libelle.value = data["libelle"];
            description.value = data["description"];
            if(data["type"] == "materiel") {
                selectType.value = "materiel";
                typePresta = "materiel";
                sectionDuree.style = "display : none"
                sectionMateriel.style = "display : block"
                dureePresta.value = null;
                marque.value = data["marque"];
                modele.value = data["modele"];
                taille.value = data["taille"];
                idMateriel = data["idMateriel"];
            } else if(data["type"] == "service") {
                typePresta = "service";
                selectType.value = "service";
                sectionMateriel.style = "display : none";
                sectionDuree.style = "display : block";
                console.log(data["description"]);
                dureePresta.value = convertirEnHeureString(data["duree"]);
                erreurTaille.textContent = "";
                erreurModele.textContent = "";
                erreurMarque.textContent = "";
                taille.value = null;
                marque.value = null;
                modele.value = null;
                idService = data["idService"];
            }
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données :", error);
        });
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




function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


// actions

boutonEffacer.addEventListener("click", function() {
    fichierImage.value = ""; 
    let image = document.getElementById('output');
    image.src = "";
});


//pour effacer les messages d'erreurs quand l'utilisateur change les valeurs (a optimiser peut etre)

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


boutonValider.addEventListener("click", (event) => {
    event.preventDefault();

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


        console.log(tabImages);

        if(tabImages.length == 0) {
            valide = false;
            erreurImage.textContent = "Veuillez insérer au moins une image"
        } else {
            erreurImage.textContent = "";
        }

        if(valide == true) {
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

            //console.log();
    
            let categId = traiterCategories();

            if(prestation == "service") {
                updateService(libelle,description,dureeHeure,idService)
                update(categId);
            } else {
                updateMateriel(libelle,description,taille,marque,modele,idMateriel);
                update(categId);
            }

        }

    });

function update(categ) {
    for(let id_img of tabIdImagesSupp) {
        deleteImage(id_img);
    }
    for(let id_categ of tabIdCateg) {
        deleteCategorie(idPrestation, id_categ)
    }

    for(let image of tabImages) {
        let found = false;
        console.log(image);
        for(let imageBdd of tabImagesBdd) {
            console.log(imageBdd)
            if(image == imageBdd) {
                found = true;
                break;
            }
        }
        if (found == false) {
            insertImage(idPrestation, image);
        }
    }


    for(let y of categ) {
        addCategorie(idPrestation, y)
    }
    
}

            





//function d'insertion 


async function updateService(libelle, description, duree, id_service) {

    try {
        const resultat=await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/service/update?idService="+id_service+"&libelle="+libelle+"&description="+description+"&duree="+duree, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            console.log("succes "+ response);
            });
        console.log(resultat);
    } catch (error) {
        console.log('Erreur lors de l\'envoi des données :', error);
    }

}

async function updateMateriel(libelle, description, taille, marque, modele, id_materiel) {
    try {

        const resultat =await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/materiel/update?idMateriel="+id_materiel+"&libelle="+libelle+"&description="+description+"&taille="+taille+"&marque="+marque+"&modele="+modele, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then();
        console.log(resultat);
        console.log('materiel update avec succès');
    } catch (error) {
        console.log('Erreur lors de l\'envoi des données :', error);
    }
}


async function deleteImage(id_img) {
    try {
        const resultat=await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/image/delete?idImage="+id_img, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            console.log("succes "+ response);
            });
        console.log(resultat);
    } catch (error) {
        console.log('Erreur lors de l\'envoi des données :', error);
    }

}


async function insertImage(id_prest,image){
    try {
        const resultat=await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/image/insert?idPrestation="+id_prest, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ base64 : image}) // Envoyer les données Base64 dans un objet JSON
        });
        console.log(resultat);
    } catch (error) {
        console.log('Erreur lors de l\'envoi des données :', error);
    }
} 

async function deleteCategorie(id_prest,id_categ) {
    try {
        const resultat=await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/appartient/delete?idPres="+id_prest+"&idCateg="+id_categ, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            console.log("succes "+ response);
            });
        console.log(resultat);
    } catch (error) {
        console.log('Erreur lors de l\'envoi des données :', error);
    }

}




async function addCategorie(id_prest,id_categ) {
    try {
        const resultat=await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/appartient/insert?idPres="+id_prest+"&idCateg="+id_categ, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(() => {
            reinit()
            })
    } catch (error) {
        console.log('Erreur lors de l\'envoi des données :', error);
    }

}





function reinit(){
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
    tabIdCateg = [];
    tabIdImagesSupp = [];
    window.location = "gererMesAnnonces.html";
}

boutonAnnuler.addEventListener("click", (event) => {
    event.preventDefault();
    reinit()
});



// Compteur pour suivre le nombre d'images ajoutées
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
            console.log(file.name)

            let reader = new FileReader();
            reader.onload = function(e) {
                // Créer une image pour la prévisualisation
                let img = document.createElement('img');
                img.src = e.target.result;
                base64Image = reader.result;
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
                for (let i = 0; i < tabIdCateg.length; i++) {
                    if (option.value == tabIdCateg[i]) {
                        tabIdCateg.splice(i, 1); 
                        break; 
                    }
                }
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
