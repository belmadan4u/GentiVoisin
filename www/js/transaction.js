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

async function lesDatesInvalides(){
    let result=[];

    for(let transaction of lesTransaction){
       
        let dateFin =new Date( await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/dateFin?statut=1&idTransaction="+transaction.idTransaction)).json())
        let dateDebut = new Date( transaction.dateDebut)

        while (dateDebut < dateFin) {
            result.push(dateDebut.toISOString().split("T")[0]); 
            dateDebut.setDate(dateDebut.getDate() + 1); 
        }

    }
    return result
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
let idTransaction = "";
let type="achat";
let lesAchats = [];
let lesVentes = [];

let lesAchatsFiltre = [];
let lesVentesFiltre = [];

let dateDebut="";
let dateFin="";

let valorisation;

let lesTransaction=[];
let datesADesactiver=[];
let pickerFin;


let lesInfos  = [];
let inputCommentaire = [];

function supprimerDate(){
    pickerFin.clear();  
    dateFin="";
    afficherTotal();
}


function modifierNoteModal(noteAvis){
    const lesEtoiles = document.querySelectorAll(".lesEtoiles div")

    for(let i=0;i<Math.floor(noteAvis);i++){
        lesEtoiles[i].className="lesEtoiles_complet"
    }
    if(Math.floor(noteAvis) != Math.ceil(noteAvis)){
        lesEtoiles[i].className="lesEtoiles_moitie"
    }

    for(let i=Math.ceil(noteAvis);i<5;i++){
        lesEtoiles[i].className="lesEtoiles_vide";
    }
    
}

async function validerNotation(){

    /* -------------- RECUPERATION DES DONNÉES -----------------------*/

    const laNote = document.querySelectorAll(".lesEtoiles .lesEtoiles_complet").length;
    const description = document.querySelector("#nouvelleDescription").value;

   /* -------------- MODIFICATIO DANS LA BASE DE DONNÉES -----------------------*/
   const statut = type=="achat" ? "Emprunteur" : "Proprio"; 

   await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/updateComm"+statut+"?idTrans="+idTransaction+"&note"+statut+"="+laNote+"&commentaire"+statut+"="+description)

   document.querySelector("#alert").style.display="block";

}
async function validerProl(){
    const alert=document.querySelector("#alertProl");
    alert.style.display="block";

    if( dateFin!=""){
        try{
            let laDateD = new Date(dateDebut);
            let laDateF = new Date(dateFin);
        
            const nbrJour = Math.floor((laDateF - laDateD) / (1000 * 60 * 60 * 24)); //NOMBRE DE JOUR DE PRÉSTATION
            const prixFinal = valorisation.prixJournalier*nbrJour;

            const solde= (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byId?id="+connecte)).json()).credit;

            if(solde>=prixFinal){

                await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prolongation/insert?idTransaction="+idTransaction+"&dateFin="+dateFin)

                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                

                //AJOUTER L'ALERTE
                alert.innerHTML='<div class="alert alert-success"> <strong> Reçu ! </strong> Votre demande du '+laDateD.toLocaleDateString('fr-FR', options)+' au '+laDateF.toLocaleDateString('fr-FR', options)+' a été enregistrée. </div>';
            }else{
                alert.innerHTML='<div class="alert alert-danger"> <strong>Solde insuffisant!</strong> Vous ne possedez que '+solde+' jetons sur les '+prixFinal+' nécessaires. </div>';
            }

        }catch(e){
            console.log(e);
        }
    }else{
        alert.innerHTML='<div class="alert alert-warning"> <strong>Date invalide ! </strong> Veuillez saisir les dates de la demande . </div>';
    }



    

}

function gererModale(transaction){
    idTransaction= transaction.idTransaction;

    document.querySelector("#alert").style.display="none";

    let noteAvis = type=="achat" ?  transaction.noteEmprunteur : transaction.noteProprio;
    const description = type=="achat" ?  transaction.commentaireEmprunteur : transaction.commentaireProprio; 

     /* -------------- TITRE -----------------------*/
     document.querySelector("#modalTitle").textContent= noteAvis===-1 ? "Ajouter mon avis" : "Modifier mon avis"

    /* -------------- NOTE -----------------------*/
    noteAvis= noteAvis==-1 ? 0 : noteAvis
    modifierNoteModal(noteAvis);


    /* -------------- DESCRIPTION -----------------------*/
    document.querySelector("#nouvelleDescription").value= description;

}

function afficherTotal(){
    const journalier = document.querySelectorAll(".pagePrestation_presentation_lesInfos_total")[0]
    
    if( dateFin!=""){
        let laDateD = new Date(dateDebut);
        let laDateF = new Date(dateFin);

        const nbrJour = Math.floor((laDateF - laDateD) / (1000 * 60 * 60 * 24)); //NOMBRE DE JOUR DE PRÉSTATION


        //CALCUL DU PRIX 

        
        journalier.querySelector(" :nth-child(1)").textContent= nbrJour==1 ? " 1 Jour " : nbrJour+" Jours"
        journalier.querySelector(" :nth-child(2)").textContent=valorisation.prixJournalier*nbrJour

        // TOTAL 
        document.querySelector(".pagePrestation_presentation_lesInfos_somme :nth-child(2)").textContent=valorisation.prixJournalier*nbrJour;
    }else{
        journalier.querySelector(" :nth-child(1)").textContent="";
        journalier.querySelector(" :nth-child(2)").textContent="";
        document.querySelector(".pagePrestation_presentation_lesInfos_somme :nth-child(2)").textContent="Non défini";
    }  

}


async function gererProlongation(transaction){
    /* -------------- VERIFIER SI UNE PROLONGATION A ÉTÉ DEMANDÉ AJRD -----------------------*/
    const mois = new Date().getMonth()+1 <10 ? "0"+(new Date().getMonth()+1).toString() : new Date().getMonth()+1;
    const jour = new Date().getDay() < 10 ? "0"+ new Date().getDay() :  new Date().getDay();
    existe =  (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prolongation/existe?idTransaction="+transaction.idTransaction+"&dateDemande="+new Date().getFullYear()+"-"+mois+"-"+jour)).json()).existe ; 

    idTransaction= transaction.idTransaction;

    const valider =  document.querySelector("#btnValiderProl");
    const alert = document.querySelector("#alertProl")

    const formulaire = document.querySelector(".formulaireProl");
   
    if(!existe){
        valider.style.display="block";
        formulaire.style.display="block";

        alert.style.display="none";

        dateDebut = (await (await fetch(" https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/dateFin?idTransaction="+transaction.idTransaction)).json()) ; 

        valorisation = (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/valorisation/byTransaction?idTransaction="+transaction.idTransaction)).json()) ; 
        
        /* -------------- DATE -----------------------*/
        lesTransaction =  await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byPrestationbyStatut?statut=1&idPrestation="+transaction.prestation.idPrestation)).json() ;

        datesADesactiver = await lesDatesInvalides();

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

        const demande = document.querySelector(".pagePrestation_presentation_lesInfos_lesDates_input span");
        demande.textContent= " "+(new Date(dateDebut).toLocaleDateString('fr-FR', options))


        /* -------------- PRIX TOTAL -----------------------*/

        document.querySelectorAll(".pagePrestation_presentation_lesInfos_somme div")[1].textContent=" Non défini";
    }else{

        formulaire.style.display="none";

        valider.style.display="none";

        alert.style.display="block";
        alert.innerHTML='<div class="alert alert-danger"> <strong>Prolongation impossible ! </strong> Vous avez déjà réaliser une demande de prolongation pour cette transaction '+"aujourd'hui. </div>";
    }

}

async function creationTransaction(transaction ){

    const trans = document.createElement("div");
    trans.className="transaction";
    /* -------------- TITRE -----------------------*/

    const titre = document.createElement("div");
    titre.className="transaction_titre";
    titre.textContent=transaction.prestation.libelle;
    /* -------------- LES INFORMATIONS -----------------------*/
    const contenu = document.createElement("div");
    contenu.className="d-flex align-items-center justify-content-between transaction_contenu";

    /* -------------- IMAGE -----------------------*/
    const lesImages = (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/image/byPrestation?idPrestation="+transaction.prestation.idPrestation)).json()) ; 
    
    const image = document.createElement("div");
    image.className="transaction_contenu_photo";
    image.style.backgroundImage= lesImages.length!=0 ? "url("+lesImages[0].base64+")" : "";


    /* -------------- CONTENU INFORMATION -----------------------*/
    const information = document.createElement("div");
    information.className="d-flex flex-column justify-content-center transaction_contenu_information";

    // PROPRIO 

    const propNote = document.createElement("div");
    propNote.className="d-flex align-items-center justify-content-between transaction_contenu_information_propNote";

    const proprio = document.createElement("div");
    proprio.className="d-flex align-items-center justify-content-between transaction_contenu_information_propNote_proprio";

    const proprioImg = document.createElement("div");
    proprioImg.className="transaction_contenu_information_propNote_proprio_image";

    const utilisateur = type=="achat" ? transaction.prestation.gentiVoisin : transaction.gentiVoisin; 

    proprioImg.style.backgroundImage= utilisateur.photoProfil ? "url("+ utilisateur.photoProfil+")" : ""  ;

    const proprioPerso = document.createElement("div");
    proprioPerso.className="transaction_contenu_information_propNote_proprio_perso";

    const proprioNomP = document.createElement("div");
    proprioNomP.textContent=utilisateur.prenom+" "+utilisateur.nom;
    const proprioAdd = document.createElement("div");
    proprioAdd.textContent=utilisateur.adresse;

    proprioPerso.appendChild(proprioNomP);
    proprioPerso.appendChild(proprioAdd);

    proprio.appendChild(proprioImg);
    proprio.appendChild(proprioPerso);
   
    propNote.appendChild(proprio);

    //NOTE 
    const note = document.createElement("div");
    note.className="d-flex transaction_contenu_information_propNote_note";

    const laNote = type=="achat" ?  transaction.noteProprio : transaction.noteEmprunteur; 


    if(laNote!=-1){
        for(let i=0;i<Math.floor(laNote);i++){
            note.appendChild(creationElement("transaction_contenu_information_propNote_note_complet"))
        }

        if(Math.floor(laNote) != Math.ceil(laNote)){
            note.appendChild(creationElement("transaction_contenu_information_propNote_note_moitie"))
        }

        for(let i=Math.ceil(laNote);i<5;i++){
            note.appendChild(creationElement("transaction_contenu_information_propNote_note_vide"))
        }
    }

    propNote.appendChild(note);
    information.appendChild(propNote);

    /* -------------- STATISTIQUE ET DATE -----------------------*/
    const statDate = document.createElement("div");
    statDate.className="d-flex align-items-center justify-content-between transaction_contenu_information_statDate";

    // STATUT
    const statut = document.createElement("div");
    statut.className="d-flex  align-items-center transaction_contenu_information_statDate_statut";


    const dateDebut = transaction.dateDebut
    const dateFin = (await (await fetch(" https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/dateFin?idTransaction="+transaction.idTransaction)).json()) ; 
    
    if(new Date(dateDebut) > new Date()){
        statut.innerHTML="<div class='transaction_contenu_information_statDate_futur'> </div>À venir"
    }else if(new Date(dateFin) < new Date()){
        statut.innerHTML="<div class='transaction_contenu_information_statDate_passe'> </div>Passes"
    }else{
        statut.innerHTML="<div class='transaction_contenu_information_statDate_enCours'> </div>En cours"
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    const demande = document.createElement("div");
    demande.textContent= "Acheté le "+(new Date(transaction.dateDemandeTransaction).toLocaleDateString('fr-FR', options))

    statDate.appendChild(statut);
    statDate.appendChild(demande);

    information.appendChild(statDate);

    /* -------------- LES DATES DE LA TRANSACTION -----------------------*/
    const datesTrans = document.createElement("div");
    datesTrans.className="d-flex align-items-center transaction_contenu_information_lesDates";
    
    datesTrans.textContent="Du "+(new Date(dateDebut).toLocaleDateString('fr-FR', options))+" au "+(new Date(dateFin).toLocaleDateString('fr-FR', options)) 
    
    information.appendChild(datesTrans);

    /* -------------- TOTAL  -----------------------*/
    /*
    const laValorisation = (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/valorisation/byTransaction?idTransaction="+transaction.idTransaction)).json()) ; 
        
    const fraisTrans = document.createElement("div");
    fraisTrans.className="d-flex align-items-center justify-content-between transaction_contenu_information_frais";
    fraisTrans.innerHTML=" <div>Frais de départ</div><div>"+laValorisation.prixTrans+"</div>"
   
    information.appendChild(fraisTrans);

    const fraisJour= document.createElement("div");
    const jour = Math.floor((new Date(dateFin) - new Date(dateDebut)) / (1000 * 60 * 60 * 24)); //NOMBRE DE JOUR DE PRÉSTATION
    fraisJour.className="d-flex align-items-center justify-content-between transaction_contenu_information_frais";
    fraisJour.innerHTML=" <div>Frais de départ</div><div>"+(laValorisation.prixJournalier*(jour+1))+"</div>"

    information.appendChild(fraisJour);
     */

    const prixTotal= (await (await fetch(" https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/prix?idTransaction="+transaction.idTransaction)).json()) ; 
    
    const total = document.createElement("div");
    total.className="d-flex align-items-center justify-content-between transaction_contenu_information_total";
    total.innerHTML=" <div>Total</div><div>"+prixTotal+"</div>"

    information.appendChild(total);


    contenu.appendChild(image);
    contenu.appendChild(information);

    /* -------------- LES BOUTONS  -----------------------*/
    const bouton = document.createElement("div");
    bouton.className="d-flex flex-column align-items-center justify-content-center transaction_contenu_bouton";

    const afficher = document.createElement("div");
    afficher.className="transaction_contenu_bouton_normal";
    afficher.textContent="Afficher le produit";
    afficher.addEventListener("click", () =>{window.location="unePrestation.html?prestation="+transaction.prestation.idPrestation})

    const avis = document.createElement("div");
    

    const modificationAvis = type=="achat" ? transaction.noteEmprunteur  : transaction.noteProprio; 

    avis.textContent=modificationAvis==-1 ? "Écrire un avis" : "Modifier mon avis";
    avis.className=modificationAvis==-1 ? "transaction_contenu_bouton_normal" : "transaction_contenu_bouton_modifier";
    avis.setAttribute("data-bs-toggle", "modal");
    avis.setAttribute("data-bs-target", "#modal");
    avis.addEventListener("click",() => gererModale(transaction));

    


    bouton.appendChild(afficher);
    bouton.appendChild(avis);

    
    if(new Date(dateFin) > new Date() && type=="achat"){
        const prolonger = document.createElement("div");
        prolonger.className="transaction_contenu_bouton_normal";
        prolonger.textContent="Prolonger ";
        prolonger.setAttribute("data-bs-toggle", "modal");
        prolonger.setAttribute("data-bs-target", "#modalProlongation");
        prolonger.addEventListener("click",() => gererProlongation(transaction));
        bouton.appendChild(prolonger);
    }

    contenu.append(bouton);
    /* -------------- AJOUT TITRE INFORMATION -----------------------*/
    trans.append(titre);
    trans.append(contenu);
    
    return trans;

}

async function miseAJourFiltre(){
    lesAchatsFiltre = lesAchats.slice();
    lesVentesFiltre = lesVentes.slice();
    



    //COMMENTAIRE
    
    let i=0;
    while(i!=inputCommentaire.length && !inputCommentaire[i].checked){
        i++;
    }

    if(i!=inputCommentaire.length){
        lesAchatsFiltre=lesAchatsFiltre.filter( (elt) => {
            return elt.noteProprio >= inputCommentaire[i].value
        });
        lesVentesFiltre=lesVentesFiltre.filter( (elt) => {
            return elt.noteEmprunteur >= (inputCommentaire[i].value || -1)
        });}

    //SORT BY DATE 
    const dateSelect = lesInfos[0].querySelector('input[type="radio"]:checked').value;
   if(dateSelect=="recent"){
        lesAchatsFiltre=lesAchatsFiltre.sort( (a,b) => new Date(a.dateDebut).getDate() - new Date(b.dateDebut).getDate())
        lesVentesFiltre=lesVentesFiltre.sort( (a,b) => new Date(a.dateDebut).getDate() - new Date(b.dateDebut).getDate())
   }else if(dateSelect=="ancien"){
        lesAchatsFiltre=lesAchatsFiltre.sort( (a,b) => new Date(b.dateDebut).getDate() - new Date(a.dateDebut).getDate())
        lesVentesFiltre=lesVentesFiltre.sort( (a,b) => new Date(b.dateDebut).getDate() - new Date(a.dateDebut).getDate())
   }




    afficherDonnee();
}



async function afficherDonnee(){

    const lesDonnes = document.querySelector(".recherche_all_resultat_lesPrestations");

    

    /* -------------- CHANGER LE NOMBRE -----------------------*/
    const titrage = document.querySelectorAll(".recherche_all_resultat_titre div");
    titrage[0].innerHTML= "ACHATS <span> ( "+lesAchatsFiltre.length+" )</span>";
    titrage[1].innerHTML= "VENTES <span> ( "+lesVentesFiltre.length+" )</span>";

    const data = type=="achat" ? lesAchatsFiltre : lesVentesFiltre;

    lesDonnes.innerHTML="";

    for( let elt of data){
        lesDonnes.appendChild( await creationTransaction(elt))
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


    if(type=="achat"){

        const achat = document.querySelector(".recherche_all_resultat_titre :nth-child(1)")
        bordure.style.animation = "resultatAGauche 0.25s ease-in-out forwards";

        type="vente";
        await afficherDonnee();

        achat.addEventListener("click",() => changementResultat(), once)
        
        

    }else if(type=="vente"){

        const vente = document.querySelector(".recherche_all_resultat_titre :nth-child(2)")
        bordure.style.animation = "resultatADroite 0.25s ease-in-out forwards";
    
        type="achat";
        await afficherDonnee();

        vente.addEventListener("click",() => changementResultat(), once)

    }


}


async function initialiserTransaction(){

    connecte= getCookie("id_user");

    if(!connecte){
        window.location="index.html";
    }

    /* -------------- OBTENIR LES ACHATS -----------------------*/
    lesAchats = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byGentibyStatut?statut=1&idGenti="+connecte)).json() ;
    lesAchatsFiltre=lesAchats;

    /* -------------- OBTENIR LES VENTES -----------------------*/
    lesVentes = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byPropriobyStatut?statut=1&idGenti="+connecte)).json() ;
    lesVentesFiltre=lesVentes;  

    /* -------------- SWITCH  ACHATS <-> VENTES -----------------------*/
        const ventes = document.querySelector(".recherche_all_resultat_titre :nth-child(2)");
    
        const once = {
            once: true,
        };
    
    
        ventes.addEventListener("click",() => changementResultat(), once)
         
    afficherDonnee();

    /* -------------- INITIALISER MODALE DE LA NOTE -----------------------*/

    const lesEtoiles = document.querySelectorAll(".lesEtoiles div")
    lesEtoiles.forEach((elt,idx) => {
        elt.addEventListener("click",(event) =>{event.stopImmediatePropagation(); modifierNoteModal(idx+1) });
    })
    document.querySelector(".lesEtoiles").addEventListener("click",() => modifierNoteModal(0))

    document.querySelector("#btnValider").addEventListener("click",() => validerNotation())

     /* -------------- INITIALISER MODALE DE LA PROLONGATION -----------------------*/
 

    //CLEAR LES DATES 
    document.querySelector(".pagePrestation_presentation_lesInfos_lesDates_input div").addEventListener("click",supprimerDate)

   
    //AU CHANGEMENT 
    const lesDates=document.querySelectorAll(".pagePrestation_presentation_lesInfos_lesDates_input input")
    

    pickerFin = new Pikaday({
        field: lesDates[0],
        format: 'DD/MM/YYYY', // Format de date français
        i18n: {
            previousMonth : 'Mois précédent',
            nextMonth     : 'Mois suivant',
            months        : ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
            weekdays      : ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
            weekdaysShort : ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
        }, 
        toString(date) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('fr-FR', options);
        },
        disableDayFn: function(date) {
            date.setDate(date.getDate()+1);//DECALLAGE DE 1 

            let formattedDate = date.toISOString().split("T")[0];
            const dateSelect=new Date(formattedDate);

            const dateFinal= new Date().setDate(new Date(dateDebut).getDate());

            let dateTester= new Date(dateDebut);
            datesADesactiver.forEach( elt => {
                let dateDesactiver = new Date(elt);
                if(dateDesactiver >= dateFinal && (dateFinal-dateTester > dateFinal-dateDesactiver )){
                    dateTester=dateDesactiver;
                }
            })
            const bool = (dateSelect > dateTester ) && dateDebut !="" && datesADesactiver.length!=0 && dateTester.getDate()!=new Date(dateDebut).getDate()
            

            return datesADesactiver.includes(formattedDate) || (dateSelect < new Date()) || (dateSelect < dateFinal ) || bool ;
        },onSelect: function(date) {
            date.setDate(date.getDate()+1);//DECALLAGE DE 1 

            dateFin=date.toISOString().split("T")[0];
            if(dateDebut!=""){
                afficherTotal();
            }
        }
    });

     document.querySelector("#btnValiderProl").addEventListener("click",() => validerProl())

     /* --------------INITALISER LES FILTRES -----------------------*/
 
    const lesTitres =document.querySelectorAll(".recherche_all_filtre_titreDiv");
    lesInfos  = document.querySelectorAll(".recherche_all_filtre_infos");
    inputCommentaire = lesInfos[1].querySelectorAll("input");

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

    const lesCheckBox= document.querySelectorAll('.recherche_all_filtre label');
    lesCheckBox.forEach(elt => elt.addEventListener("input", miseAJourFiltre));
}


initialiserTransaction();



