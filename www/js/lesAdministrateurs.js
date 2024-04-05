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

async function changementGenti(idGenti, bool){
    await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/updateAdmin?id="+idGenti+"&admin="+bool);
    location.reload(true);
}

function creationAdmin( genti , estAdmin ){
    const div = document.createElement("div")
    div.className="p-3 d-flex align-items-center justify-content-between lesAdmins_contenu_unCompte w-100";

    const compte = document.createElement("div");
    compte.className="d-flex lesAdmins_contenu_unCompte_gauche";

    const img = document.createElement("div");
    img.className="d-flex lesAdmins_contenu_unCompte_gauche_img";
    img.style.backgroundImage = genti.photoProfil ? genti.photoProfil : "";

    const email = document.createElement("span");
    email.textContent=genti.mail;

    const nom = document.createElement("span");
    nom.textContent=genti.nom;

    const prenom = document.createElement("span");
    prenom.textContent=genti.prenom;

    compte.appendChild(img);
    compte.appendChild(email);
    compte.appendChild(nom);
    compte.appendChild(prenom);

    div.appendChild(compte);



    const croix = document.createElement("div");

    if(estAdmin){
        croix.className="lesAdmins_contenu_unCompte_croix";
    }else{
        croix.className="lesAdmins_contenu_unCompte_ajouter"; 
    }

    croix.addEventListener("click",()=> changementGenti(genti.idUser,(!genti.admin)))

    div.appendChild(croix);
    return div;
}
function affichageNonAdmin(donnee,element){
    const valeur = document.querySelector(".lesAdmins_titre input").value;
    const data = donnee.slice().filter(elt => elt.mail.startsWith(valeur));

    element.innerHTML=""
    for(let genti of data){
        element.appendChild( creationAdmin(genti,false));
    }
}

async function initialiserLesAdmins(){
    redirection();

    /* --------------CHARGEMENT DES DONNÉES -----------------------*/

    const lesGentiVoisins = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byStatut?statut=1")).json() ;
    
    let lesAdmins=[];
    let lesGentiNonAdmin=[];

    lesGentiVoisins.forEach(element => {
        if(element.admin){
            lesAdmins.push(element);
        }else{
            lesGentiNonAdmin.push(element);
        }
    });

    /* -------------- AFFICHAGE DES ADMINS -----------------------*/
    const lesDiv = document.querySelectorAll(".lesAdmins_contenu")

    lesDiv[0].innerHTML=""
    for(let genti of lesAdmins){
        lesDiv[0].appendChild( creationAdmin(genti,true));
    }

    affichageNonAdmin(lesGentiNonAdmin,lesDiv[1]);

    document.querySelector(".lesAdmins_titre input").addEventListener("input", () => affichageNonAdmin(lesGentiNonAdmin,lesDiv[1]) )
  


   

}

initialiserLesAdmins()
