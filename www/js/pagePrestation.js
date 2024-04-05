let dateDebut="";
let dateFin="";
let prix;

let lesTransaction=[];
let pickerDebut;
let pickerFin;

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

function supprimerDate(){
    pickerDebut.clear(); 
    pickerFin.clear(); 
    dateDebut=""; 
    dateFin="";
    afficherTotal();
}


// GESTION FAVORI 
async function ajouterFavori(event,element,idPrestation, idGenti){
    event.stopPropagation();

    await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/favori/insert?idPres="+idPrestation+"+&idGenti="+idGenti) ;

    element.className="pagePrestation_presentation_lesImages_favori pagePrestation_presentation_lesImages_favori_rouge";
    //ONCE = L'EVÈNEMENT NE SE DÉCLENCHE QU'UNE SEULE FOIS
    const once = {
        once: true,
    };
    element.addEventListener("click",(event)=> supprimerFavori(event,element,idPrestation, idGenti),once)
}

async function supprimerFavori(event,element,idPrestation, idGenti){
    event.stopPropagation();

    await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/favori/delete?idPres="+idPrestation+"+&idGenti="+idGenti)

    element.className="pagePrestation_presentation_lesImages_favori";
     //ONCE = L'EVÈNEMENT NE SE DÉCLENCHE QU'UNE SEULE FOIS
    const once = {
        once: true,
    };
    element.addEventListener("click",(event)=> ajouterFavori(event,element,idPrestation, idGenti),once)
}

let affiche=false;
function visibilityDate(){
    const titre = document.querySelector(".pagePrestation_presentation_lesInfos_lesDates")

    if( affiche ){
        titre.style.animation="dateMontrer 0.25s ease-in-out forwards"
    }else{
        titre.style.animation="dateCacher 0.25s ease-in-out forwards"
    }
    affiche=!affiche
}
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

let photoSelect=0;
let lesImages = [];

function changementPhoto(id){
    //GRANDE IMAGE
    document.querySelector(".pagePrestation_presentation_lesImages").style.backgroundImage="url("+lesImages[id].base64+")";

    //CHANGEMENT OPPACITÉ
    const lesDiv = document.querySelectorAll(".pagePrestation_presentation_lesImages_uneImage");

    lesDiv[id].style.opacity="1";
    lesDiv[photoSelect].style.opacity="0.5";
    

    photoSelect=id;
}

function afficherTotal(){
    const journalier = document.querySelectorAll(".pagePrestation_presentation_lesInfos_total")[1];

    if(dateDebut!="" && dateFin!=""){
        let laDateD = new Date(dateDebut);
        let laDateF = new Date(dateFin);

        const nbrJour = Math.floor((laDateF - laDateD) / (1000 * 60 * 60 * 24)); //NOMBRE DE JOUR DE PRÉSTATION


        //CALCUL DU PRIX 
        
        journalier.querySelector(" :nth-child(1)").textContent= nbrJour==1 ? " 1 Jour " : nbrJour+" Jours"
        journalier.querySelector(" :nth-child(2)").textContent=prix.prixJournalier*nbrJour

        // TOTAL 
        document.querySelector(".pagePrestation_presentation_lesInfos_somme :nth-child(2)").textContent=prix.prixJournalier*nbrJour+prix.prixTrans;
    }else{
        journalier.querySelector(" :nth-child(1)").textContent="";
        journalier.querySelector(" :nth-child(2)").textContent="";
        document.querySelector(".pagePrestation_presentation_lesInfos_somme :nth-child(2)").textContent="Non défini";
    }  

}

async function demandeTransaction(connecte,idPrestation){
    
    const alert = document.querySelector("#alert");
    window.scrollTo(0,0);

    if(dateDebut!="" && dateFin!=""){
        try{
            let laDateD = new Date(dateDebut);
            let laDateF = new Date(dateFin);
        
            const nbrJour = Math.floor((laDateF - laDateD) / (1000 * 60 * 60 * 24)); //NOMBRE DE JOUR DE PRÉSTATION
            const prixFinal = prix.prixJournalier*nbrJour+prix.prixTrans;

            const solde= (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byId?id="+connecte)).json()).credit;
            
            

            if(solde>=prixFinal){
                await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/insert?idGenti="+connecte+"&idPres="+idPrestation+"&dateDebut="+dateDebut+"&dateFin="+dateFin)
                
    
                supprimerDate();

                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                

                //AJOUTER L'ALERTE
                alert.innerHTML='<div class="alert alert-success"> <strong> Reçu ! </strong> Votre demande du '+laDateD.toLocaleDateString('fr-FR', options)+' au '+laDateF.toLocaleDateString('fr-FR', options)+' a été enregistrée. </div>';
            }else{
                //SOLDE INSUFFISANT
                alert.innerHTML='<div class="alert alert-danger"> <strong>Solde insuffisant!</strong> Vous ne possedez que '+solde+' jetons sur les '+prixFinal+' nécessaires. </div>';
            }

        }catch(e){
            console.log(e);
        }
    }else{
        alert.innerHTML='<div class="alert alert-warning"> <strong>Date invalide ! </strong> Veuillez saisir les dates de la demande . </div>';
    }
}

async function initialiserPage(){

    /* -------------- RECUPERATION DU PARAMETRE PASSÉ EN GET -----------------------*/
    let params = new URLSearchParams(window.location.search);

    if(!params.get('prestation')){
        window.location="index.html";
    }

    /* -------------- RECUPERATION DES DONNÉES   -----------------------*/
    const prestation =  await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/prestation/byId?id="+params.get('prestation'))).json() ;
    
    //SI LA PRESTATION OU LE GENTIVOISIN N'EST PAS VALIDE
    if(prestation.valide!='1' || prestation.archive==true ||prestation.gentiVoisin.valide!='1'){
        window.location="index.html";
    }

    prix =  await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/valorisation/prixActuel?idPrestation="+prestation.idPrestation)).json() ;
    
    const nombreAnnonce =  (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/nombreAnnonce?idGenti="+prestation.gentiVoisin.idUser)).json()).nombre

    const noteMoyenne =   (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/noteMoyenne?idGenti="+prestation.gentiVoisin.idUser)).json())

    lesImages= await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/image/byPrestation?idPrestation="+prestation.idPrestation)).json() ;
    
    const lesCateg = await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/appartient/byPrestation?idPres="+prestation.idPrestation)).json() ;
    
    /* -------------- AFFICHAGE INFO PRESTATION  -----------------------*/
    //TITRE
    const titre= document.querySelector(".pagePrestation_presentation_lesInfos_titre");
    titre.textContent=prestation.libelle;


    //LES FRAIS
    
    const lesFrais=document.querySelectorAll(".pagePrestation_presentation_lesInfos_frais_unFrais")

    //PRIX TRANS
    lesFrais[0].querySelector(" :nth-child(2)").innerHTML=prix.prixTrans+"<div></div>"

    //PRIX JOURNALIER
    lesFrais[1].querySelector(" :nth-child(2)").innerHTML=prix.prixJournalier+"<div></div> / Jours"

    //PRIX TOTAL
    const leTotalDescription=document.querySelectorAll(".pagePrestation_presentation_lesInfos_total")
    leTotalDescription[0].querySelector(" :nth-child(2)").textContent=prix.prixTrans;


    //PROPRIO
    document.querySelector(".pagePrestation_presentation_lesInfos_proprio").href="unGentiVoisin.html?voisin="+prestation.gentiVoisin.idUser;

    document.querySelector(".pagePrestation_presentation_lesInfos_proprio_photo").style.backgroundImage=("url("+prestation.gentiVoisin.photoProfil+")" || "");
    document.querySelector(".pagePrestation_presentation_lesInfos_proprio_nom").textContent=prestation.gentiVoisin.prenom+ " "+prestation.gentiVoisin.nom

    
    document.querySelector(".pagePrestation_presentation_lesInfos_proprio_annonce").textContent= nombreAnnonce==1 ? "1 annonce" : nombreAnnonce+" annonces"

    
    const notation= document.querySelector(".pagePrestation_presentation_lesInfos_proprio_note");

    for(let i=0;i<Math.floor(noteMoyenne.noteMoyenne);i++){
        notation.appendChild(creationElement("pagePrestation_presentation_lesInfos_proprio_note_complet"))
    }

    if(Math.floor(noteMoyenne.noteMoyenne) != Math.ceil(noteMoyenne.noteMoyenne)){
        notation.appendChild(creationElement("pagePrestation_presentation_lesInfos_proprio_note_moitie"))
    }

    for(let i=Math.ceil(noteMoyenne.noteMoyenne);i<5;i++){
        notation.appendChild(creationElement("pagePrestation_presentation_lesInfos_proprio_note_vide"))
    }


    const nbr= document.createElement("span");
    nbr.textContent=" ( "+noteMoyenne.total+" ) ";
    nbr.style.width="4rem"
    notation.appendChild(nbr);

    //DESCRIPTION
    document.querySelector(".pagePrestation_bas_block_description").textContent=prestation.description

    //LES IMAGES
    
    const imageDiv = document.querySelector(".pagePrestation_presentation_lesImages")
    imageDiv.innerHTML="";
    imageDiv.style.backgroundImage=lesImages.length>0 ? "url("+lesImages[0].base64+")" : "url(./css/../img/univers/noImage.png)"

    lesImages.forEach( (elt,idx) => {
        const div = document.createElement("div")
        div.className="pagePrestation_presentation_lesImages_uneImage";
        div.style.backgroundImage="url("+elt.base64+")";
        div.addEventListener("click",() => changementPhoto(idx))
        imageDiv.appendChild(div);
    })
     //LES CATÉGORIES 
    const categori = document.querySelector(".pagePrestation_presentation_lesInfos_lesCategories");

    lesCateg.forEach( (element,idx) => {
        if(idx==lesCateg.length-1){
            categori.textContent=categori.textContent+" "+element.categorie.libelle;
        }else{
            categori.textContent=categori.textContent+element.categorie.libelle+" - ";
        }
    });


    /* -------------- GESTION FAVORI  -----------------------*/
    
    //GESTION CONNEXION 
      const connecte=getCookie("id_user");
      if(connecte){

        //FAVORI 
        const favori = document.createElement("div")
        favori.className="pagePrestation_presentation_lesImages_favori"

        const estFavori = (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/favori/existe?idPres="+prestation.idPrestation+"&idGenti="+connecte)).json()).existee ;

        const once = {
            once: true,
        };

        if(estFavori){
            favori.className="pagePrestation_presentation_lesImages_favori pagePrestation_presentation_lesImages_favori_rouge";
            
            favori.addEventListener("click",(event)=> supprimerFavori(event,favori,prestation.idPrestation,connecte),once)
        }else{

            favori.addEventListener("click",(event) => ajouterFavori(event,favori,prestation.idPrestation,connecte),once)
        }   

        imageDiv.appendChild(favori);

        /* --------------AFFICHAGE DE LA CARTE  -----------------------*/
            const data = await (await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + prestation.gentiVoisin.adresse)).json();
    
            const coord = { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    
            const map = L.map('map').setView([coord.latitude, coord.longitude], 13);
    
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
    
            const marker = L.marker([coord.latitude, coord.longitude]).addTo(map);
            marker.bindPopup("<b>"+prestation.libelle+"</b><br>Préstation réalisé par "+prestation.gentiVoisin.prenom+" "+prestation.gentiVoisin.nom).openPopup();

    }else{
        const localisation = document.querySelectorAll(".pagePrestation_bas_block")[1];
        document.querySelector(".pagePrestation_bas").removeChild(localisation);
    }

   

    /* -------------- GESTION DES DATES DE RÉSERVATION -> BIBLOTHÈQUE PIKADAY  -----------------------*/
    //DATE ET RÉSERVATION
    document.querySelector(".pagePrestation_presentation_lesInfos_lesDates_titre").addEventListener("click", visibilityDate);

    //TABLEAU DATE INVALIDE
    lesTransaction =  await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/transaction/byPrestationbyStatut?statut=1&idPrestation="+prestation.idPrestation)).json() ;

    const datesADesactiver = await lesDatesInvalides();


    //AU CHANGEMENT 
    const lesDates=document.querySelectorAll(".pagePrestation_presentation_lesInfos_lesDates_input input")
    

    // Configuration de DatePicker.js
    pickerDebut = new Pikaday({
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
            // Fonction pour formater la date en français
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('fr-FR', options);
        },
        disableDayFn: function(date) {
            date.setDate(date.getDate()+1);//DECALLAGE DE 1 

            let formattedDate = date.toISOString().split("T")[0];
            const dateSelect=new Date(formattedDate);

            const dateFinal= new Date(dateFin);

          
            let dateTester= new Date();
            datesADesactiver.forEach( elt => {
                let dateDesactiver = new Date(elt);
                if(dateDesactiver <= dateFinal && (dateFinal-dateTester > dateFinal-dateDesactiver )){
                    dateTester=dateDesactiver;
                }
            })
            const bool = ( dateSelect < dateTester ) && dateFin !="" 

            
            return datesADesactiver.includes(formattedDate)  || (dateSelect < new Date()) || (dateSelect > dateFinal ) || bool ;
        },onSelect: function(date) {
            date.setDate(date.getDate()+1);//DECALLAGE DE 1 

            dateDebut=date.toISOString().split("T")[0];
            if(dateFin!=""){
                afficherTotal();
            }
        }
    });

    pickerFin = new Pikaday({
        field: lesDates[1],
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

            const dateFinal= new Date(dateDebut);

            let dateTester= new Date(dateDebut);
            datesADesactiver.forEach( elt => {
                let dateDesactiver = new Date(elt);
                if(dateDesactiver >= dateFinal && (dateFinal-dateTester > dateFinal-dateDesactiver )){
                    dateTester=dateDesactiver;
                }
            })
            const bool = (dateSelect > dateTester ) && dateDebut !="" && datesADesactiver.length!=0 && dateTester.getTime()!=new Date(dateDebut).getTime()
            

            return datesADesactiver.includes(formattedDate) || (dateSelect < new Date()) || (dateSelect < dateFinal ) || bool ;
        },onSelect: function(date) {
            date.setDate(date.getDate()+1);//DECALLAGE DE 1 

            dateFin=date.toISOString().split("T")[0];
            if(dateDebut!=""){
                afficherTotal();
            }
        }
    });

    //CLEAR LES DATES 
    document.querySelector(".pagePrestation_presentation_lesInfos_lesDates_input div").addEventListener("click",supprimerDate)


    /* -------------- GESTION DE LA DEMANDE DE RÉSERVATION  -----------------------*/
    const btnReservation=document.querySelector(".pagePrestation_presentation_lesInfos_valider")

    if(connecte){
        btnReservation.addEventListener("click", () => demandeTransaction(connecte,prestation.idPrestation))
    }else{
        btnReservation.addEventListener("click", () => { window.location="connexion.html" })
    }



    /* -------------- DÉCOUVRIR D'AUTRES PRESTATION SIMILAIRE  -----------------------*/

    if(lesCateg.length==0){
        document.querySelector(".pagePrestation_decouvrir").style.display="none";
    }else{
        const categASelectionner=lesCateg[ Math.floor(Math.random()*100)  % lesCateg.length ].categorie.idCateg;

        document.querySelector(".pagePrestation_decouvrir_titre_voirPlus").href="recherche.html?categorie="+categASelectionner;

        let lesPrestations =  await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/appartient/byCategorieAffichage?idCateg="+categASelectionner+"&idGenti="+connecte)).json() ;

        lesPrestations = lesPrestations.slice().sort(() => Math.random() - 0.5);
        lesPrestations = lesPrestations.filter( (elt,idx) => elt.prestation.idPrestation != prestation.idPrestation && idx<11)

        const decouvert=document.querySelector(".pagePrestation_decouvrir_lesAnnonces");
        decouvert.innerHTML="";

        for(let elt of lesPrestations){
            decouvert.appendChild( affichagePrestation(elt,connecte));
        }
        
    }   
    
    /* -------------- GESTION DES COMMENTAIRES  -----------------------*/ 

    const lesCommentaires= lesTransaction.slice().filter(elt => elt.noteEmprunteur>-1);
    initialiserCommentaire(lesCommentaires);
}

initialiserPage();