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

let type="annonce";
let datalesCommentaires=[];
let lesAnnonces=[];
let connecte="";

let lesSousTitres = [];
let lesInputs = [];
let  lesPrix = [];

let voisin;

function afficherCacher(elt){
    if(elt.style.display!="flex"){
        elt.style.display="flex";
    }else{
        elt.style.display="none";
    }
}

function changementType(){
    const once = {
        once: true,
    };
    const annonce= document.querySelector(".gentiVoisin_lesTitres :nth-child(1)");
    const avis= document.querySelector(".gentiVoisin_lesTitres :nth-child(2)");
    const anime= document.querySelector(".gentiVoisin_lesTitres :nth-child(3)");


    if(type=="annonce"){
        affichageAvis();
        type="avis";

        anime.style.animation="gentiVoisinAGauche 0.35s ease-in-out forwards";
        annonce.addEventListener("click", changementType,once);
       
    }else{
        affichageAnnonce();
        type="annonce";

        anime.style.animation="gentiVoisinADroite 0.35s ease-in-out forwards";
        avis.addEventListener("click", changementType,once);
    }

    changementVisibility();
}



function changementVisibility(){
    const lesTitres = document.querySelectorAll(".recherche_all_filtre_titre");
    
    const lesNotes = document.querySelector(".commentaire_lesNotes");
    const separation = document.querySelector(".commentaire_separation");

    const div = document.querySelector(".recherche_all_resultat_lesPrestations");

    const flex = type=="annonce" ? "none" : "flex";
    const nonFlex = type=="annonce" ? "flex" : "none";

    if(type=="annonce"){
       div.style.display="flex";
    }else{
        div.style.display="block";
    }

    lesTitres[0].style.display=flex;
    lesNotes.style.display=flex;
    separation.style.display=flex;

    lesSousTitres.forEach( (elt,idx) => {
        if(idx<2){
            elt.style.display=flex;
            lesInputs[idx].style.display="none";
        }else{
            elt.style.display=nonFlex;
            lesInputs[idx].style.display="none";
        }
    })

}



function affichageAnnonce(){
    let dataAnnonce = lesAnnonces.slice();


    /* -------------- CATEGORIE -----------------------*/

    const categChecked = lesInputs[3].querySelectorAll( "input:checked");
    categChecked.forEach( elt => {
        dataAnnonce=dataAnnonce.filter( (prestation) => { 
            return prestation.lesCategories.includes(parseInt(elt.value)) 
        
        })
    })

    /* -------------- COMMENTAIRE -----------------------*/
    const inputCommentaire = lesInputs[4].querySelectorAll("input");

    let i=0;
    while(i!=inputCommentaire.length && !inputCommentaire[i].checked){
        i++;
    }

    if(i!=inputCommentaire.length){
        dataAnnonce=dataAnnonce.filter( (elt) => elt.notation.noteMoyenne >= inputCommentaire[i].value )
    }


    /* -------------- PRIX JOURNALIER -----------------------*/
    let minJournalier= lesPrix[0].value ? lesPrix[0].value : -1;
    let maxJournalier= lesPrix[1].value ? lesPrix[1].value : Infinity;

    if(minJournalier==-1 && maxJournalier==Infinity){ // REGARDER LES CASES COCHÉS 
        const inputJournalier=lesInputs[5].querySelectorAll("label input:checked");
        inputJournalier.forEach( elt => {

            maxJournalier= elt.value==10 ? Infinity : elt.value+5
            minJournalier= minJournalier == -1 ? elt.value : minJournalier
        })
    }

    /* -------------- PRIX TRANSACTION -----------------------*/

     let minTransaction= lesPrix[2].value ? lesPrix[2].value : -1;
     let maxTransaction= lesPrix[3].value ? lesPrix[3].value : Infinity;
 
     if(minTransaction==-1 && maxTransaction==Infinity){ // REGARDER LES CASES COCHÉS 
         const inpuTrans=lesInputs[6].querySelectorAll("label input:checked");
         inpuTrans.forEach( elt => {
             
             maxTransaction= elt.value==20 ? Infinity : elt.value+10
             minTransaction= minTransaction == -1 ? elt.value : minTransaction
         })
 
     }
 
     //FILTRE DU PRIX 
     if(minTransaction!=-1 || maxTransaction!=Infinity || minJournalier!=-1 || maxJournalier!=Infinity ){ // FILTRE 
        dataAnnonce=dataAnnonce.filter( (elt) => elt.prix.prixTrans <= maxTransaction &&  elt.prix.prixTrans >= minTransaction 
                                 && elt.prix.prixJournalier <= maxJournalier &&  elt.prix.prixJournalier >= minJournalier )
 
 
     }

    /* -------------- TRIÉ PAR -----------------------*/

     const select =  lesInputs[2].querySelector('input[type="radio"]:checked').value;

     switch(select){
         case "pDecroissant" : dataAnnonce.sort( (a,b) => ((b.prix.prixTrans+b.prix.prixJournalier*7)/7) - ((a.prix.prixTrans+a.prix.prixJournalier*7)/7) )
                     break;
         case "pCroissant" : dataAnnonce.sort( (a,b) => ( (a.prix.prixTrans+a.prix.prixJournalier*7)/7) - ( (b.prix.prixTrans+b.prix.prixJournalier*7)/7) )
                     break;
         case "moyComm" : dataAnnonce.sort( (a,b) => b.notation.noteMoyenne - a.notation.noteMoyenne )
                     break;
         case "nouveaute" : dataAnnonce=dataAnnonce.filter( (elt) => elt.notation.total==0 )
                     break;  
         case "revalorise" : dataAnnonce.sort( (a,b) => new Date(b.prix.dateDecision) - new Date(a.prix.dateDecision) )
                     break;  
         default: ;
     }

 
     

     
    
    const conteneur = document.querySelector(".recherche_all_resultat_lesPrestations")
    conteneur.innerHTML="";
    
    for(let elt of dataAnnonce){
        conteneur.appendChild( affichagePrestation(elt,connecte));
    }

    if(dataAnnonce.length==0){
        const div= document.createElement("div")
        div.className="recherche_all_resultat_lesPrestations_noResultat"
        conteneur.appendChild(div)
    }

}

function affichageAvis(){
    let dateAvis = datalesCommentaires.slice();

     /* -------------- FILTRE PAR NOTE -----------------------*/
     const inputCommentaire = lesInputs[1].querySelectorAll("input");

     let i=0;
     while(i!=inputCommentaire.length && !inputCommentaire[i].checked){
         i++;
     }
 
     if(i!=inputCommentaire.length){
        dateAvis=dateAvis.filter( (elt) => { 
            if(elt.gentiVoisin.idUser==voisin.idUser){
                return elt.noteProprio >= inputCommentaire[i].value
            }else{
                return elt.noteEmprunteur >= inputCommentaire[i].value
            }
       } )
     }
    
    
     /* -------------- FILTRE PAR DATE -----------------------*/
 
    const dateSelect = lesInputs[0].querySelector('input[type="radio"]:checked').value;

    if(dateSelect=="ancien"){
        dateAvis.sort( (a,b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
    }else if(dateSelect=="recent"){
        dateAvis.sort( (a,b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())
    }
 

    const conteneur = document.querySelector(".recherche_all_resultat_lesPrestations")

    conteneur.innerHTML="";
    for (let transaction of dateAvis) {
        conteneur.appendChild(affichageCommentaire(transaction,voisin.idUser));
    }

    if(dateAvis.length==0){
        const div= document.createElement("div")
        div.className="recherche_all_resultat_lesPrestations_noResultat"
        conteneur.appendChild(div)
    }


}





async function initialiserGenti(){

    let params = new URLSearchParams(window.location.search);

    if(!params.get('voisin')){
        window.location="index.html";
    }

    voisin =  await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byId?id="+params.get('voisin'))).json() ;

    if(voisin.valide!='1'){
        window.location="index.html";
    }

   /* -------------- PROPRIÉTAIRE -----------------------*/
   const nbrAnnonce =  (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/nombreAnnonce?idGenti="+params.get('voisin'))).json()).nombre ;
   let nbrTransaction = (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byGentibyStatut?statut=1&idGenti="+params.get('voisin'))).json()).length ;
   nbrTransaction += (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byPropriobyStatut?statut=1&idGenti="+params.get('voisin'))).json()).length ;

   const note=  (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/noteMoyenne?idGenti="+voisin.idUser)).json())

   document.querySelector(".gentiVoisin_photo").innerHTML=""
   document.querySelector(".gentiVoisin_photo").style.backgroundImage=voisin.photoProfil ? "url("+voisin.photoProfil+")" : "url(./css/../img/univers/noImage.png)" ;

   document.querySelector(".gentiVoisin_nom").textContent=voisin.prenom+" "+voisin.nom;

    const annonceTransaction = document.querySelectorAll(".gentiVoisin_annonceTransaction div");

    annonceTransaction[0].textContent=nbrAnnonce<2 ? nbrAnnonce+" annonce" : nbrAnnonce+" annonces";
    annonceTransaction[1].textContent=nbrTransaction<2 ? nbrTransaction+" transaction" : nbrTransaction+" transactions"; 

    connecte= getCookie("id_user");
    const location=document.querySelector(".gentiVoisin_localiser")
    if(connecte){
        location.textContent=voisin.adresse
        location.style.backgroundImage="url(./css/../img/icon/localisation.png)"
    }else{
        document.querySelector(".gentiVoisin_contenu").removeChild(location);
    }

    /* -------------- NOTATION PROPRIÉTAIRE -----------------------*/ 

    const notation= document.querySelector(".gentiVoisin_note");

    for(let i=0;i<Math.floor(note.noteMoyenne);i++){
        notation.appendChild(creationElement("gentiVoisin_note_complet"))
    }

    if(Math.floor(note.noteMoyenne) != Math.ceil(note.noteMoyenne)){
        notation.appendChild(creationElement("gentiVoisin_note_moitie"))
    }

    for(let i=Math.ceil(note.noteMoyenne);i<5;i++){
        notation.appendChild(creationElement("gentiVoisin_note_vide"))
    }

    const total=document.createElement("span")
    total.textContent="( "+note.total+" )";
    notation.appendChild(total);

    /* -------------- RECUPERATION DES COMMENTAIRES  -----------------------*/

    let commentaireClient  = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byGentibyStatut?statut=1&idGenti="+params.get('voisin'))).json() ;
    commentaireClient=commentaireClient.filter(elt => elt.noteEmprunteur >-1 )

    let commentaireProprio = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byPropriobyStatut?statut=1&idGenti="+params.get('voisin'))).json() ;
    commentaireProprio=commentaireProprio.filter(elt => elt.noteProprio >-1 )
    
    datalesCommentaires = commentaireClient.concat(commentaireProprio);
    datalesCommentaires = datalesCommentaires.sort( (a,b) => new Date(b.dateDebut).getTime-new Date(a.dateDebut).getTime)

    /* -------------- RECUPERATION DES ANNONCES  -----------------------*/
    lesAnnonces = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/byGentiValideAffichage?idGenti="+params.get('voisin')+"&idVisiteur="+ (connecte || "-1"))).json() ;
    
     /* -------------- RECUPERATION DES CATEGORIES  -----------------------*/

    const lesCategories = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/categorie/aLaUne")).json() ;

    lesSousTitres = document.querySelectorAll(".recherche_all_filtre_titreDiv");
    lesInputs = document.querySelectorAll(".recherche_all_filtre_infos");
    lesPrix = document.querySelectorAll(".recherche_all_filtre_infos_prix input");

    lesInputs[3].innerHTML="";
    lesCategories.forEach(elt => {
            const label= document.createElement("label");
            label.className="d-flex align-items-center"
            label.innerHTML="<input type='checkbox' id=btn_categ"+elt.idCateg+" value="+elt.idCateg+">"+elt.libelle;
            lesInputs[3].appendChild(label);
    })
     /* -------------- EVENEMENT OUVERTURE ET FERMETURE FILTRE  -----------------------*/

    
    lesSousTitres.forEach( (elt,idx) =>{
        elt.addEventListener("click", () => afficherCacher(lesInputs[idx]));
    })

    /* -------------- SWITCH ANNONCES <-> AVIS  -----------------------*/ 

    const once = {
        once: true,
    };

    document.querySelector(".gentiVoisin_lesTitres :nth-child(2)").addEventListener("click", changementType,once);
    affichageAnnonce();

    /* -------------- AFFICHAGE NOTE MOYENNE  -----------------------*/ 

    let result=[0,0,0,0,0,0];
    for (let transaction of datalesCommentaires) {
        if(transaction.gentiVoisin.idUser==voisin.idUser){
            result[transaction.noteProprio]++;
        }else{
            result[transaction.noteEmprunteur]++;
        }
    }

    const somme = datalesCommentaires.length;

    const lesNotes = document.querySelectorAll(".commentaire_lesNotes_uneNote_total");

    lesNotes.forEach( (elt,idx) => {
        elt.querySelector("div").style.width=result[5-idx]/somme*100+"%"
    })

    /* -------------- EVÈNEMENT D'AFFICHAGE  -----------------------*/ 

    lesInputs.forEach( (elt,idx) => {
        const lesCheckBox = elt.querySelectorAll("input");
        if(idx<2){
            lesCheckBox.forEach(elt => {
                elt.addEventListener("input", () => { 
                if(type=="avis"){
                    affichageAvis();
                }})
            })
        }else{
            lesCheckBox.forEach(elt => {
                elt.addEventListener("input", () => { 
                if(type=="annonce"){
                    affichageAnnonce();
                }})
            })
        }
    })

}

initialiserGenti()