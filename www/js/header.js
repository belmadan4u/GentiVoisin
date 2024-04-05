

// NOTIFICATION NOMBRE 

async function afficherNombreNotif ( id) {

    const nombreNotif= (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/nombreNotification?idGenti="+id)).json());

    const notification=document.querySelector(".header_haut_icons_notif");

    if(nombreNotif>0){
        notification.style.backgroundImage=  nombreNotif<=9 ? "url('./css/../img/icon/notification/notif-"+nombreNotif+".png')" :"url('./css/../img/icon/notification/notif-plus.png')" ;
        notification.addEventListener("mouseenter",() => { notification.style.backgroundImage=nombreNotif<=9 ? "url('./css/../img/icon/notification/notifCol-"+nombreNotif+".png')" :"url('./css/../img/icon/notification/notifCol-plus.png')" ;})
        notification.addEventListener("mouseout",() => { notification.style.backgroundImage=nombreNotif<=9 ? "url('./css/../img/icon/notification/notif-"+nombreNotif+".png')" :"url('./css/../img/icon/notification/notif-plus.png')" ; })
    }
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

async function initialiserConnexion(){
    const connecte=getCookie("id_user");

    const compte=document.querySelector(".header_haut_icons_compte");;

    if(connecte){
        compte.addEventListener('click', () => { window.location.href = "tableauBord.html" });
        compte.style.backgroundImage="url('./css/../img/icon/compte/connecte.png')";

        afficherNombreNotif(connecte);
        
    }else{
        compte.addEventListener('click', () => { window.location.href = "connexion.html" });
    }
}



// NAVIGATION
let ouvert=0;

const animationNavigation = () =>{
    document.querySelector(".header").style.boxShadow="none";
    document.querySelector(".navigation").style.animation="navigationArrive 0.25s ease-in-out forwards";
}

const  afficherNavigation = async (type) =>  {

    let data=[];

        const lesCategories = document.querySelector(".navigation_droite_bas")

        if(type=="service"){
            document.querySelector(".header_bas :nth-child(2)").style.color="gray";
            document.querySelector(".header_bas :nth-child(1)").style.color="#333333";

            data= (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/categorie/byType?type=materiel")).json());
            ouvert=1;

        }else if(type=="materiel"){
            document.querySelector(".header_bas :nth-child(1)").style.color="gray";
            document.querySelector(".header_bas :nth-child(2)").style.color="#333333";

            data= (await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/categorie/byType?type=service")).json());
            ouvert=2;
        }

        animationNavigation();

        const url=type ==="" ? "recherche.html?"  : "recherche.html?type="+type+"&";

        // LES ...
        document.querySelector(".navigation_gauche :nth-child(1)").textContent=("les "+type+"s").toUpperCase();
        document.querySelector(".navigation_gauche :nth-child(1)").href=url

        // NOUVEAUTÉS
        document.querySelector(".navigation_gauche :nth-child(3)").href=(url+"nouveaute=true");

        //REVALORISÉ
        document.querySelector(".navigation_gauche :nth-child(2)").href=(url+"revalorise=true");

        //LES CATEGORIES 
        lesCategories.innerHTML="";
        data = data.filter( (elt,idx) =>  idx<24 );

        data.forEach( elt => {
            const a=document.createElement("a");
            a.textContent=elt.libelle;
            a.href="recherche.html?categorie="+elt.idCateg;

            lesCategories.appendChild(a);
        })

        if(data.length==23){
            const a=document.createElement("a");
            a.textContent="Voir plus";
            a.href="recherche.html";
            a.className="text-primary";

            lesCategories.appendChild(a);
        }
}


const cacherNavigation = () =>{
    document.querySelector(".navigation").style.animation="navigationDepart 0.25s ease-in-out forwards";
    document.querySelector(".header").style.boxShadow="0 0 5px rgba(0, 0, 0, 0.5)";

    document.querySelector(".header_bas :nth-child(1)").style.color="#333333";
    document.querySelector(".header_bas :nth-child(2)").style.color="#333333";

    ouvert=0;
}



// NAVIGATION VERSION MOBILE 

const switchNavigation = () => {
    const btnNav = document.querySelector(".header_haut_icons_nav"); 
    const header = document.querySelector(".header");

    if(ouvert){
        cacherNavigation();
        btnNav.style.backgroundImage="url('./css/../img/icon/nav.png')";
        btnNav.style.backgroundSize="80%";

        header.style.borderBottom="1px solid black";
    }else{
        animationNavigation();
        btnNav.style.backgroundImage="url('./css/../img/icon/close-2.png')";
        btnNav.style.backgroundSize="40%";

        header.style.borderBottom="none";
        ouvert=3; 
    }  
    
}


//ANIMATION BAR DE RECHERCHE 

const focusBarNavigation = (recherche, supprimer) =>{
    if(recherche.classList.length==0){
        recherche.className="rechercheAnimationVersion2";
    }
    supprimer.style.animation="closeArrive 0.25s ease-in-out 0s 1  forwards"
}

const focusOutBarNavigation =(supprimer) =>{
    supprimer.style.animation="closeDepart 0.5s  ease-in-out 1  forwards";
}




//RECHERCHE

const envoyerRecherche = (element) => {
    const valeurRecherche=element.value;
    window.location.href = "recherche.html?recherche="+valeurRecherche;
}

const envoyerRechercheEntrer = (event,element) => {
    if (event.key === "Enter") {
        envoyerRecherche(element);
    }
}


//SUPPRIMER RECHERCHE

const suppRecherche = ( element ) =>{
    element.value="";
}

async function affichageHeader() {
    /*
    try {
        const response = await fetch('header.html');
        if (!response.ok) {
            throw new Error('Erreur lors du chargement du fichier');
        }
        const data = await response.text();
        document.getElementById('header').innerHTML = data;
    } catch (error) {
        console.error('Erreur lors du chargement du fichier : ', error);
    }*/
    

    initialiserConnexion();

    //FAVORI RENVOIE HREF ( impossible sur des a vide )

    document.querySelector(".header_haut_icons_notif").addEventListener('click', () => { window.location.href = "notification.html" });
    document.querySelector(".header_haut_icons_fav").addEventListener('click', () => { window.location.href = "favori.html" });


    document.querySelector(".header_bas :nth-child(1)").addEventListener('click', ()=>{ ouvert===1 ? cacherNavigation() : afficherNavigation("service") });
    document.querySelector(".header_bas :nth-child(2)").addEventListener('click', ()=>{ ouvert===2 ? cacherNavigation() : afficherNavigation("materiel") });
    document.querySelector(".navigation_droite_haut_croix").addEventListener('click', cacherNavigation);

    document.querySelector(".header_haut_icons_nav").addEventListener('click', switchNavigation);

    const supprimer=document.querySelector(".header_haut_recherche_supprimer");
    const recherche=document.querySelector("#edt_recherche");
    const btnRecherche=document.querySelector(".header_haut_recherche_rechercher");

    recherche.addEventListener('focus',() => focusBarNavigation(recherche,supprimer))
    recherche.addEventListener('focusout', () =>focusOutBarNavigation(supprimer));


    // ANIMATION BAR DE RECHERCHE MOBILE 

    const supprimerMobile=document.querySelector(".navigation_recherche_supprimer");
    const rechercheMobile=document.querySelector("#edt_rechercheMobile")
    const btnRechercheMobile=document.querySelector(".navigation_recherche_rechercher")

    rechercheMobile.addEventListener('focus',() => focusBarNavigation(rechercheMobile,supprimerMobile))
    rechercheMobile.addEventListener('focusout', () =>focusOutBarNavigation(supprimerMobile));


    btnRecherche.addEventListener("click",() => envoyerRecherche(recherche));
    recherche.addEventListener("keypress", (event) => envoyerRechercheEntrer(event, recherche)); // BOUTON ENTRÉE

    //RECHERCHE MOBILE 

    btnRechercheMobile.addEventListener("click",() => envoyerRecherche(rechercheMobile));
    rechercheMobile.addEventListener("keypress", (event) => envoyerRechercheEntrer(event, rechercheMobile)); // BOUTON ENTRÉE


    supprimer.addEventListener('click',() => suppRecherche(recherche));

    //SUPPRIMER RECHERCHE MOBILE 

    supprimerMobile.addEventListener('click',() => suppRecherche(rechercheMobile));

}

affichageHeader();