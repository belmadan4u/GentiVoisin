//LES CATÉGORIES


let indice=0;

function afficherCateg( lesCategories){

    const divCateg =  [ document.querySelector("#categ0"),document.querySelector("#categ1"), document.querySelector("#categ2"), document.querySelector("#categ3"),document.querySelector("#categ4"), document.querySelector("#categ5")]

    divCateg.forEach( (element,index) => {
        const id = indice==0 ? index-1 : indice+index;

        if( indice!=0 || index!=0) {

            element.href="recherche.html?categorie="+lesCategories[id % lesCategories.length].idCateg;
            element.querySelector(" :nth-child(2)").textContent= lesCategories[id % lesCategories.length].libelle;
            element.querySelector(" :nth-child(1)").style.backgroundImage =lesCategories[id % lesCategories.length].photo==""? "" : "url("+lesCategories[id % lesCategories.length].photo+")";
        }
    });

    const flecheGauche= document.querySelector(".accueil_lesCategories_flecheGauche").querySelector(" :nth-child(1)");
    const flecheDroite= document.querySelector(".accueil_lesCategories_flecheDroite").querySelector(" :nth-child(1)");


    if(indice==0){
        flecheGauche.style.visibility="hidden";
        flecheDroite.style.visibility="visible";
    }else if(indice==lesCategories.length-4){
        flecheDroite.style.visibility="hidden";
        flecheGauche.style.visibility="visible";
    }else{
        flecheDroite.style.visibility="visible";
        flecheGauche.style.visibility="visible";
    }
}

//ALLER À GAUCHE
function changementFlecheGauche(lesCategories){

    indice--;

    const caroussel= document.querySelector(".accueil_lesCategories_lesCategories");
    caroussel.className="accueil_lesCategories_lesCategories carousselGauche";
    setTimeout(() => { afficherCateg(lesCategories); caroussel.classList.remove('carousselGauche'); } ,250 );

}
//ALLER À DROITE
function changementFlecheDroite(lesCategories){
    indice++;

    const caroussel= document.querySelector(".accueil_lesCategories_lesCategories");
    caroussel.className="accueil_lesCategories_lesCategories carousselDroite";
    setTimeout(() => { afficherCateg(lesCategories);  caroussel.classList.remove('carousselDroite'); },250 );
   
    

}

async function initialiserCategorie(){
    lesCategories = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/categorie/aLaUne")).json() ;

    afficherCateg(lesCategories);

    const flecheGauche= document.querySelector(".accueil_lesCategories_flecheGauche").querySelector(" :nth-child(1)");
    const flecheDroite= document.querySelector(".accueil_lesCategories_flecheDroite").querySelector(" :nth-child(1)");

    flecheGauche.addEventListener("click", () => changementFlecheGauche( lesCategories) )
    flecheDroite.addEventListener("click",  () => changementFlecheDroite( lesCategories)  )

}

// LES PRÉSTATIONS 
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



async function initialiserPrestation(){
    const connecte= getCookie("id_user");

    const titreLesPrestation = document.querySelector(".accueil_titreversion2 :nth-child(1)")
    let data=[];
    if(connecte!=""){ // CONNECTÉ -> UTILISATION API ROUTIER POUR LA GÉOLOCISATION > PAS PARFAIT SUR LA DISTANCE 
        titreLesPrestation.textContent="PROCHE DE CHEZ VOUS";
        data= await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/getAffichage?id="+connecte)).json() ;

        data = data.slice().sort(() => Math.random() - 0.5);
        data.filter( (elt,idx) => idx<=25);


        const gentiVoisin = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byId?id="+connecte)).json() ;
        
        data = await rayonDeplacement(data,gentiVoisin.adresse,gentiVoisin.rayonDeplacement);

        

    }else{ // DÉCONNECTÉ -> LES PLUS DEMANDEES 

        data= await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/lesPlusDemandees")).json() ;
        data.filter( (elt,idx) => idx<=25);
    }


    const lesPrestations = document.querySelector(".accueil_lesPrestations");
    lesPrestations.innerHTML="";

    for(let prestation of data){
        lesPrestations.appendChild( affichagePrestation(prestation,connecte));
    }

    if(data.length==0){
        const div= document.createElement("div")
        div.className="recherche_all_resultat_lesPrestations_noResultat"
        lesPrestations.appendChild(div)
    }


}

//ACCUEIL 

function initialiserAccueil(){
    initialiserCategorie();
    initialiserPrestation();
}

initialiserAccueil();
