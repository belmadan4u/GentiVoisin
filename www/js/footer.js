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

async function initialiser(){
    const connecte= getCookie("id_user");

    const connexion = document.querySelector(".footer_navigation :nth-child(4)")

    if(connecte!=""){
        connexion.textContent="MON COMPTE";
        connexion.href="tableauBord.html";

        const admin=(await (await fetch("https://devweb.iutmetz.univ-lorraine.fr/~kobler2u/gentiVoisin/gentiVoisinS5/api/apiGV.php/gentiVoisin/byId?id="+connecte)).json()).admin;

        if(admin){
            const admin = document.createElement("a");
            admin.className="flex-fill";
            admin.href="chiffreCle.html";
            admin.textContent="ADMINISTRATION"

            const contact = document.querySelector(".footer_navigation :nth-child(7)");

            contact.parentElement.insertBefore(admin,contact);
        }
    }else{
        connexion.textContent="CONNEXION";
        connexion.href="connexion.html";
    }

}


async function affichageFooter() {
    /*try {
        const response = await fetch('footer.html');
        if (!response.ok) {
            throw new Error('Erreur lors du chargement du fichier');
        }
        const data = await response.text();
        document.getElementById('footer').innerHTML = data;
    } catch (error) {
        console.error('Erreur lors du chargement du fichier : ', error);
    }
    */
    
    initialiser();
    
}

affichageFooter();