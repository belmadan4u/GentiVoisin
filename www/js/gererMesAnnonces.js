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

function creationElement( classe="", text=""){
  const element= document.createElement("div");

  if(classe!=""){
      element.className=classe;
  }

  if(text!=""){
      element.innerHTML=text;
  }


  return element;
}



function changerVisibility(element){
  if(element.style.display!="flex"){
      element.style.display="flex"
  }else{
      element.style.display="none"
  }
}


let existe=true;

let connecte="";
let idPrestation = "";
let type="materiel";
let lesMateriels = [];
let lesServices = [];

let lesMaterielsFiltre = [];
let lesServicesFiltre = [];

let dateDebut="";
let dateFin="";


let lesTransaction=[];
let datesADesactiver=[];
let pickerFin;


let lesInfos  = [];
let inputCommentaire = [];

function validerModification(){
  window.location="modifierPrestation.html?id="+idPrestation.idPrestation;
}

async function archiver(){
  const pres = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/byId?id="+idPrestation.idPrestation )).json() ;
  
  if(type=="service"){
     await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/service/archive?idService="+pres.idService+"&archive="+(!pres.archive));

  }else{
     await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/materiel/archive?idMateriel="+pres.idMateriel+"&archive="+(!pres.archive));
    
  }

  location.reload(true);
}

async function demanderValorisation(){
  
  await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/valorisation/insert?idPrestation="+idPrestation.idPrestation ) ;
  location.reload(true);
}



function gererModale(event,prestation){ // A L'OUVERTURE 

  event.stopPropagation();
  idPrestation=prestation.prestation;

  //CHNAGER LA COULER ARCHIVER OU DÉSARCHIVER 
  const statutSelect = document.querySelector(".recherche_all_filtre_infos").querySelector('input[type="radio"]:checked').value;

  const btn =  document.querySelector("#btnArchive")
  if(statutSelect=="non"){
    btn.textContent="Archive"
    btn.className="d-flex align-items-center justify-content-center w-80 border-2 rounded p-3 m-3 transaction_contenu_bouton_refuser"
  }else{
    btn.textContent="Désarchive"
    btn.className="d-flex align-items-center justify-content-center w-80 border-2 rounded p-3 m-3 transaction_contenu_bouton_accepte"
  }

}






async function miseAJourFiltre(){
  lesMaterielsFiltre = lesMateriels.slice();
  lesServicesFiltre = lesServices.slice();
  

  const statutSelect = document.querySelector(".recherche_all_filtre_infos").querySelector('input[type="radio"]:checked').value;
 if(statutSelect=="non"){
      lesMaterielsFiltre=lesMaterielsFiltre.filter( elt => !elt.prestation.archive)
      lesServicesFiltre=lesServicesFiltre.filter(elt => !elt.prestation.archive)
 }else if(statutSelect=="oui"){
      lesMaterielsFiltre=lesMaterielsFiltre.filter( elt => elt.prestation.archive)
      lesServicesFiltre=lesServicesFiltre.filter( elt => elt.prestation.archive)
 }
  console.log(lesMaterielsFiltre)

  afficherDonnee();
}



async function afficherDonnee(){

  const lesDonnes = document.querySelector(".recherche_all_resultat_lesPrestations");

  
  /* -------------- CHANGER LE NOMBRE -----------------------*/
  const titrage = document.querySelectorAll(".recherche_all_resultat_titre div");
  titrage[0].innerHTML= "MATERIELS <span> ( "+lesMaterielsFiltre.length+" )</span>";
  titrage[1].innerHTML= "SERVICES <span> ( "+lesServicesFiltre.length+" )</span>";

  const data = type=="materiel" ? lesMaterielsFiltre : lesServicesFiltre;

  lesDonnes.innerHTML="";

  for( let elt of data){
      lesDonnes.appendChild( affichagePrestation(elt))
  }

  if(data.length==0){
      const div= document.createElement("div")
      div.className="recherche_all_resultat_lesPrestations_noResultat"
      lesDonnes.appendChild(div)
  }

}

async function changementResultat(){

  const once = {
      once: true,
  };

  const bordure = document.querySelector(".recherche_all_resultat_titre :nth-child(3)")


  if(type=="materiel"){

      const materiel = document.querySelector(".recherche_all_resultat_titre :nth-child(1)")
      bordure.style.animation = "resultatAGauche 0.25s ease-in-out forwards";

      type="service";
      await afficherDonnee();

      materiel.addEventListener("click",() => changementResultat(), once)
      
      

  }else if(type=="service"){

      const service = document.querySelector(".recherche_all_resultat_titre :nth-child(2)")
      bordure.style.animation = "resultatADroite 0.25s ease-in-out forwards";
  
      type="materiel";
      await afficherDonnee();

      service.addEventListener("click",() => changementResultat(), once)

  }
}



//AFFICHER LA PRESTATION
function affichagePrestation(prestation){
  const elt = prestation.prestation;

  const unePrestation = creationElement("d-flex flex-column justify-content-center align-items-center unePrestation")
  unePrestation.addEventListener("click",() => { window.location="unePrestation.html?prestation="+elt.idPrestation } )

  //IMAGE
  const img=creationElement("unePrestation_img");
  img.style.backgroundImage = prestation.image==""? "" : "url("+prestation.image+")";
  

  const titre=creationElement("unePrestation_titre",elt.libelle);

  //PRIX
  const prix= creationElement("unePrestation_prix d-flex align-items-center",prestation.prix.prixTrans+" <div></div> + "+prestation.prix.prixJournalier+" <div></div> / Jour");

  //NOTATION
  let notation;
  if(prestation.notation.total){
      notation= creationElement("unePrestation_notation d-flex align-items-center")//<div></div><div></div><div></div><div></div><div></div><p>"+prestation.notation.total+"</p>
      
      for(let i=0;i<Math.floor(prestation.notation.noteMoyenne);i++){
          notation.appendChild(creationElement("unePrestation_notation_complet"))
      }

      if(Math.floor(prestation.notation.noteMoyenne) != Math.ceil(prestation.notation.noteMoyenne)){
          notation.appendChild(creationElement("unePrestation_notation_moitie"))
      }

      for(let i=Math.ceil(prestation.notation.noteMoyenne);i<5;i++){
          notation.appendChild(creationElement("unePrestation_notation_vide"))
      }


      const nbr= document.createElement("p");
      nbr.textContent=prestation.notation.total
      notation.appendChild(nbr);
  
  }else{
      notation= creationElement("unePrestation_notation d-flex align-items-center","")
      const nouveau = creationElement("unePrestation_notation_text","Nouveau");
      notation.appendChild(nouveau);
  }



  unePrestation.appendChild(img);
  unePrestation.appendChild(titre);


      //PROPRIO
      const proprio = creationElement();
      
      const nomPrenom = creationElement("", "Moi");
      const adresse = creationElement("", elt.gentiVoisin.adresse );

      proprio.appendChild(nomPrenom);
      proprio.appendChild(adresse);

      //REGLAGE 
      const reglage = creationElement("unePrestation_proprio_favori" );
      
        reglage.className="unePrestation_proprio_favori unePrestation_proprio_favori_reglage";
        reglage.setAttribute("data-bs-toggle", "modal");
        reglage.setAttribute("data-bs-target", "#modal");
        reglage.addEventListener("click",(event)=> {event.preventDefault() ;gererModale(event,prestation)} )
    
      const superProprio = creationElement("unePrestation_proprio");


      superProprio.appendChild(proprio);
      superProprio.appendChild(reglage);
      
      unePrestation.appendChild(superProprio);
   


  unePrestation.appendChild(prix);
  unePrestation.appendChild(notation);

  return unePrestation;
}

async function initialiserTransaction(){

  connecte= getCookie("id_user");

  if(!connecte){
      window.location="index.html";
  }

  /* -------------- OBTENIR LES ACHATS -----------------------*/
  const lesAnnonces = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/byGentiValideAffichageV2?idGenti="+connecte+"&idVisiteur=-1" )).json() ;
  
  for(let prestation of lesAnnonces){
    if(prestation.prestation.type=="materiel"){
      lesMateriels.push(prestation);
    }else{
      lesServices.push(prestation);
    }
  }
  
  lesMaterielsFiltre=lesMateriels;

  /* -------------- OBTENIR LES VENTES -----------------------*/
  lesServicesFiltre=lesServices;  

  /* -------------- SWITCH  ACHATS <-> VENTES -----------------------*/
      const services = document.querySelector(".recherche_all_resultat_titre :nth-child(2)");
  
      const once = {
          once: true,
      };
  
  
      services.addEventListener("click",() => changementResultat(), once)
       
  miseAJourFiltre();

  /* -------------- INITIALISER MODALE DE REGLAGE -----------------------*/

  
  document.querySelector("#btnModifer").addEventListener("click",() => validerModification())
  document.querySelector("#btnValoriser").addEventListener("click",() => demanderValorisation())
  document.querySelector("#btnArchive").addEventListener("click",() => archiver())

   /* --------------INITALISER LES FILTRES -----------------------*/

  const lesTitres =document.querySelectorAll(".recherche_all_filtre_titreDiv");
  lesInfos  = document.querySelectorAll(".recherche_all_filtre_infos");


  lesTitres.forEach((elt,idx) => {
      elt.addEventListener("click",() => changerVisibility(lesInfos[idx]));
  })
  
  const titre=document.querySelectorAll(".recherche_all_filtre_titre");
  
  titre[0].addEventListener("click", () =>{
      lesTitres.forEach((elt) => {
          changerVisibility(elt)
      })
      lesInfos.forEach(elt => elt.style.display="none")
  });

  // FILTRAGE AU CHANGEMENT 

  const lesCheckBox= document.querySelectorAll('.recherche_all_filtre input');
  lesCheckBox.forEach(elt => elt.addEventListener("input", miseAJourFiltre));

}


initialiserTransaction();



