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


let data = [];
let donnee = [];
let lesCategories = [];
let type="materiel";
let connecte="";

const lesInfos  =document.querySelectorAll(".recherche_all_filtre_infos");
const lesCommenaires=lesInfos[3].querySelectorAll("input");
const lesPrix = document.querySelectorAll(".recherche_all_filtre_infos_prix input");



async function miseAJourDonnee(){
    donnee=data.slice();
    //FILTRAGE

    if(connecte){  
        //LOCALISATION
        const localisation= lesInfos[0].querySelector("input");
        const rayon= lesInfos[1].querySelector("input");

        if(rayon.value && localisation.value){

            donnee = await rayonDeplacement(donnee,localisation.value.toLowerCase(),rayon.value);

        }else if(localisation.value){
            donnee=donnee.filter( (elt) => elt.prestation.gentiVoisin.adresse.toUpperCase()==localisation.value.toUpperCase() )
        }

        //RAYON DE DÉPLACEMENT


    }

    //CATÉGORIE
    const categChecked = lesInfos[2].querySelectorAll( "input:checked");
    categChecked.forEach( elt => {
        donnee=donnee.filter( (prestation) => { 
            return prestation.lesCategories.includes(parseInt(elt.value)) 
        
        })
    })


    //COMMENTAIRE
    
    let i=0;
    while(i!=lesCommenaires.length && !lesCommenaires[i].checked){
        i++;
    }

    if(i!=lesCommenaires.length){
        donnee=donnee.filter( (elt) => elt.notation.noteMoyenne >= lesCommenaires[i].value )
    }

    //PRIX JOURNALIER
    let minJournalier= lesPrix[0].value ? lesPrix[0].value : -1;
    let maxJournalier= lesPrix[1].value ? lesPrix[1].value : Infinity;

    if(minJournalier==-1 && maxJournalier==Infinity){ // REGARDER LES CASES COCHÉS 
        const lesInputs=lesInfos[4].querySelectorAll("label input:checked");
        lesInputs.forEach( elt => {

            maxJournalier= elt.value==10 ? Infinity : elt.value+5
            minJournalier= minJournalier == -1 ? elt.value : minJournalier
        })

    }

    //PRIX TRANSACTION
    let minTransaction= lesPrix[2].value ? lesPrix[2].value : -1;
    let maxTransaction= lesPrix[3].value ? lesPrix[3].value : Infinity;

    if(minTransaction==-1 && maxTransaction==Infinity){ // REGARDER LES CASES COCHÉS 
        const lesInputs=lesInfos[5].querySelectorAll("label input:checked");
        lesInputs.forEach( elt => {
            
            maxTransaction= elt.value==20 ? Infinity : elt.value+10
            minTransaction= minTransaction == -1 ? elt.value : minTransaction
        })

    }

    //FILTRE DU PRIX 
    if(minTransaction!=-1 || maxTransaction!=Infinity || minJournalier!=-1 || maxJournalier!=Infinity ){ // FILTRE 
        donnee=donnee.filter( (elt) => elt.prix.prixTrans <= maxTransaction &&  elt.prix.prixTrans >= minTransaction 
                                && elt.prix.prixJournalier <= maxJournalier &&  elt.prix.prixJournalier >= minJournalier )


    }
    




    //TRIAGE PAR RAPPORT AU SELECT 
    const select = document.querySelector(".recherche_titre_select select");

    switch(select.value){
        case "pDecroissant" : donnee.sort( (a,b) => ((b.prix.prixTrans+b.prix.prixJournalier*7)/7) - ((a.prix.prixTrans+a.prix.prixJournalier*7)/7) )
                    break;
        case "pCroissant" : donnee.sort( (a,b) => ( (a.prix.prixTrans+a.prix.prixJournalier*7)/7) - ( (b.prix.prixTrans+b.prix.prixJournalier*7)/7) )
                    break;
        case "moyComm" : donnee.sort( (a,b) => b.notation.noteMoyenne - a.notation.noteMoyenne )
                    break;
        case "nouveaute" : donnee=donnee.filter( (elt) => elt.notation.total==0 )
                    break;  
        case "revalorise" : donnee.sort( (a,b) => new Date(b.prix.dateDecision) - new Date(a.prix.dateDecision) )
                    break;  
        default: ;
    }

    //CHANGEMENT DU TITRE 
    const titre= document.querySelector(".recherche_titre_texte");
    const texte = document.querySelector("#edt_recherche").value=="" ? "" :" POUR « "+document.querySelector("#edt_recherche").value+" »"
    titre.textContent=donnee.length==0 ? 
        "0 PRÉSTATION TROUVÉE"+texte
        :donnee.length==1 ?
        "1 PRÉSTATION TROUVÉE"+texte
        :
        "1-"+donnee.length+" SUR "+donnee.length+" PRÉSTATIONS TROUVÉES"+texte

    //NOMBRE DE SERVICE ET MATERIEL DANS LES DONNÉES 
    let nombreMateriel=0
    let nombreService=0
    donnee.forEach(elt => {
        if(elt.prestation.type=="materiel"){
            nombreMateriel++
        }else{
            nombreService++;
        }
    })

    document.querySelector(".recherche_all_resultat_titre :nth-child(1)").innerHTML="MATÉRIELS <span> ( "+nombreMateriel+" )</span>";
    document.querySelector(".recherche_all_resultat_titre :nth-child(2)").innerHTML="SERVICES <span> ( "+nombreService+" )</span>";

    afficherDonnee();
}

function afficherDonnee(){

    const lesPrestations = document.querySelector(".recherche_all_resultat_lesPrestations");
    lesPrestations.innerHTML="";
    
    const affichage=donnee.slice().filter( elt => elt.prestation.type==type )
    affichage.forEach(prestation => {
                lesPrestations.appendChild( affichagePrestation(prestation,connecte));
    });

    if(affichage.length==0){
        const div= document.createElement("div")
        div.className="recherche_all_resultat_lesPrestations_noResultat"

        lesPrestations.appendChild(div)
    }
}

function changementResultat(){

    const once = {
        once: true,
    };

    const bordure = document.querySelector(".recherche_all_resultat_titre :nth-child(3)")

    if(type=="materiel"){

        const materiel = document.querySelector(".recherche_all_resultat_titre :nth-child(1)")
        materiel.addEventListener("click",() => changementResultat(), once)
        bordure.style.animation = "resultatAGauche 0.25s ease-in-out forwards";
        type="service";

    }else if(type=="service"){

        const service = document.querySelector(".recherche_all_resultat_titre :nth-child(2)")
        service.addEventListener("click",() => changementResultat(), once)
        bordure.style.animation = "resultatADroite 0.25s ease-in-out forwards";
        type="materiel";
    }

   afficherDonnee();
}




function changerVisibility(element){
    if(element.style.display!="flex"){
        element.style.display="flex "
    }else{
        element.style.display="none "
    }
}

async function initaliserRecherche(){

    const lesTitres =document.querySelectorAll(".recherche_all_filtre_titreDiv") 

        //GESTION CONNEXION 
        connecte=getCookie("id_user");

        if(!connecte){
            document.querySelector(".recherche_all_filtre").removeChild(lesTitres[0]);
            document.querySelector(".recherche_all_filtre").removeChild(lesTitres[1]);
            document.querySelector(".recherche_all_filtre").removeChild(lesInfos[0]);
            document.querySelector(".recherche_all_filtre").removeChild(lesInfos[1]);
        }
        //RECUPERER DONNÉES
           
            data = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/getAffichage?id="+ (connecte || "-1"))).json() ;
            
        
     
   


    let params = new URLSearchParams(window.location.search);

    //RECUPERER CATÉGORIES 

        lesCategories = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/categorie/aLaUne")).json() ;

        lesInfos[2].innerHTML="";
        lesCategories.forEach(elt => {
            const label= document.createElement("label");
            label.className="d-flex align-items-center"
            label.innerHTML="<input type='checkbox' id=btn_categ"+elt.idCateg+" value="+elt.idCateg+">"+elt.libelle;
            lesInfos[2].appendChild(label);
    })

    // AFFICHER ET CACHER LES FILTRES

    lesTitres.forEach((elt,idx) => {
        elt.addEventListener("click",() => changerVisibility(lesInfos[idx]));
    })
    
    const titre=document.querySelector(".recherche_all_filtre_titre");
    
    titre.addEventListener("click", () =>{
        lesTitres.forEach((elt) => {
            changerVisibility(elt)
        })
    });

    // SWITCH SERVICE <-> MATERIEL
    const service = document.querySelector(".recherche_all_resultat_titre :nth-child(2)");
    const materiel = document.querySelector(".recherche_all_resultat_titre :nth-child(1)");

    const once = {
        once: true,
    };

    if(params.get('type')){
        if(params.get('type')=="service"){
            type="service"
            materiel.addEventListener("click",() => changementResultat(), once)
            document.querySelector(".recherche_all_resultat_titre :nth-child(3)").style.animation = "resultatAGauche 0.25s ease-in-out forwards";
        }else{
            service.addEventListener("click",() => changementResultat(), once)
        }
    }else{
        service.addEventListener("click",() => changementResultat(), once)
    }

    //RECHERCHE 
    document.querySelector("#edt_recherche").value=params.get('recherche');
    document.querySelector("#edt_rechercheMobile").value=params.get('recherche');

    if(params.get('nouveaute')=="true"){
        document.querySelector(".recherche_titre_select select").value="nouveaute";
    }else if(params.get('revalorise')=="true"){
        document.querySelector(".recherche_titre_select select").value="revalorise";
    }

    //FILTER PAR RAPPORT À LA RECHERCHE 
        data=data.filter(elt => elt.prestation.libelle.toUpperCase().startsWith(document.querySelector("#edt_recherche").value.toUpperCase())) 
 


    //CATEGORIE
    if(params.get('categorie')){
        document.querySelector("#btn_categ"+params.get('categorie')).checked=true;
        lesInfos[2].style.display="flex";
    }
   
    //SELECT QUI CHANGE =  ACTUALISATION 
    const select = document.querySelector(".recherche_titre_select select");
    select.addEventListener("change",miseAJourDonnee);

    //MISE A JOUR QUAND ON CHANGE UN FILTRE 

    const lesCheckBox= document.querySelectorAll('.recherche_all_filtre label')
    lesCheckBox.forEach(elt => elt.addEventListener("click", miseAJourDonnee));

    const input= document.querySelectorAll('.recherche_all_filtre input[type="text"]')
    input.forEach(elt => elt.addEventListener("focusout", miseAJourDonnee));

    const numb= document.querySelectorAll('.recherche_all_filtre input[type="number"]')
    numb.forEach(elt => elt.addEventListener("focusout", miseAJourDonnee));


    miseAJourDonnee();
}

initaliserRecherche()