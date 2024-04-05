let lesCommentaires=[];
let lesCommentairesDonnee=[];

let lesInfos  = [];
let inputCommentaire = [];

function changerVisibility(element){
    if(element.style.display!="flex"){
        element.style.display="flex"
    }else{
        element.style.display="none"
    }
}

function miseAJourCommentaire(){
    lesCommentairesDonnee=lesCommentaires.slice();
    
    //COMMENTAIRE
    
    let i=0;
    while(i!=inputCommentaire.length && !inputCommentaire[i].checked){
        i++;
    }

    if(i!=inputCommentaire.length){
        lesCommentairesDonnee=lesCommentairesDonnee.filter( (elt) => elt.noteEmprunteur >= inputCommentaire[i].value )
    }

    //SORT BY DATA 
    const dateSelect = document.querySelector('input[type="radio"]:checked').value;
   if(dateSelect=="recent"){
        lesCommentairesDonnee=lesCommentairesDonnee.sort( (a,b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
   }else if(dateSelect=="ancien"){
        lesCommentairesDonnee=lesCommentairesDonnee.sort( (a,b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())
   }

    const zoneComme = document.querySelector(".recherche_all_resultat_lesPrestations");
    zoneComme.innerHTML="";
    for (let transaction of lesCommentairesDonnee) {
        zoneComme.appendChild(affichageCommentaire(transaction));
    }
    
    if(lesCommentairesDonnee.length==0){
        const div= document.createElement("div")
        div.className="recherche_all_resultat_lesPrestations_noResultat"
        zoneComme.appendChild(div)
    }
}

function affichageCommentaire(transaction,voisin=""){
    const unCommentaire = document.createElement("div");
    unCommentaire.className="commentaire_unCommentaire";

    /* -------------- PROPRIÉTAIRE -----------------------*/
    const leCommentateur= voisin!=transaction.prestation.gentiVoisin.idUser ? transaction.prestation.gentiVoisin : transaction.gentiVoisin ;


    const proprio = document.createElement("div");
    proprio.className="d-flex align-items-center commentaire_unCommentaire_proprio";

    const img= document.createElement("div");
    img.className="commentaire_unCommentaire_proprio_photo";
    img.style.backgroundImage= leCommentateur.photoProfil


    const contenu = document.createElement("div");
    contenu.className="commentaire_unCommentaire_proprio_contenu";

    const titre=document.createElement("div");
    titre.className="commentaire_unCommentaire_proprio_titre";
    titre.textContent= leCommentateur.prenom+ " "+leCommentateur.nom;

    const date=document.createElement("div");
    date.className="commentaire_unCommentaire_proprio_date";

    const dateInitiale = new Date(transaction.dateDebut);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    date.textContent= dateInitiale.toLocaleDateString('fr-FR', options);

    contenu.appendChild(titre);
    contenu.appendChild(date);

    proprio.appendChild(img);
    proprio.appendChild(contenu);

    proprio.addEventListener("click",() => { window.location.href="unGentiVoisin.html?voisin="+leCommentateur.idUser })
    
    /* -------------- NOTE DU COMMENTAIRE -----------------------*/

    const notation= document.createElement("div");
    notation.className="d-flex align-items-center commentaire_unCommentaire_note";

    for(let i=0;i<Math.floor(transaction.noteEmprunteur);i++){
        notation.appendChild(creationElement("commentaire_unCommentaire_note_complet"))
    }

    if(Math.floor(transaction.noteEmprunteur) != Math.ceil(transaction.noteEmprunteur)){
        notation.appendChild(creationElement("commentaire_unCommentaire_note_moitie"))
    }

    for(let i=Math.ceil(transaction.noteEmprunteur);i<5;i++){
        notation.appendChild(creationElement("commentaire_unCommentaire_note_vide"))
    }

    /* -------------- DESCRIPTION -----------------------*/

    const description= document.createElement("div");
    description.className="d-flex align-items-center commentaire_unCommentaire_description";
    description.textContent=transaction.commentaireEmprunteur

    /* -------------- AJOUT -----------------------*/
    unCommentaire.appendChild(proprio);
    unCommentaire.appendChild(notation);
    unCommentaire.appendChild(description);

    return unCommentaire;
}

function initialiserCommentaire(data){
    lesCommentaires=data;

    const zoneComme = document.querySelector(".recherche_all_resultat_lesPrestations");
    zoneComme.innerHTML="";
    
    let result=[0,0,0,0,0,0];
    for (let transaction of lesCommentaires) {
        zoneComme.appendChild(affichageCommentaire(transaction));

        result[transaction.noteEmprunteur]++;
    }
    if(lesCommentaires.length==0){
            const div= document.createElement("div")
            div.className="recherche_all_resultat_lesPrestations_noResultat"
            zoneComme.appendChild(div)
    }

     /* -------------- NOTE  -----------------------*/

    const somme= lesCommentaires.length;

    const lesNotes = document.querySelectorAll(".commentaire_lesNotes_uneNote_total");

    lesNotes.forEach( (elt,idx) => {
        elt.querySelector("div").style.width=result[5-idx]/somme*100+"%"
    })
    
     /* -------------- FILTRE -----------------------*/

    // AFFICHER ET CACHER LES FILTRES
    const lesTitres =document.querySelectorAll(".recherche_all_filtre_titreDiv");
    lesInfos  = document.querySelectorAll(".recherche_all_filtre_infos");
    inputCommentaire = lesInfos[1].querySelectorAll("input");

    lesTitres.forEach((elt,idx) => {
        elt.addEventListener("click",() => changerVisibility(lesInfos[idx]));
    })
    
    const titre=document.querySelectorAll(".recherche_all_filtre_titre");
    
    titre[1].addEventListener("click", () =>{
        lesTitres.forEach((elt) => {
            changerVisibility(elt)
        })
    });

    // FILTRAGE AU CHANGEMENT 

    const lesCheckBox= document.querySelectorAll('.recherche_all_filtre label');
    lesCheckBox.forEach(elt => elt.addEventListener("input", miseAJourCommentaire));
    
}