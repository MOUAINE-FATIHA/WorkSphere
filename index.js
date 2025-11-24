let listeEmployes = [];
let affectationsZones = {};

if (localStorage.getItem('employes')) {
    listeEmployes = JSON.parse(localStorage.getItem('employes'));
}
if (localStorage.getItem('affectations')) {
    affectationsZones = JSON.parse(localStorage.getItem('affectations'));
}
const reglesZones = {
    receptionZ: { roles: ['Receptionniste'], max: 2, obligatoire: true },
    serverZ: { roles: ['Technicien'], max: 3, obligatoire: true },
    securiteZ: { roles: ['Agent'], max: 2, obligatoire: true },
    conferenceZ: { roles: ['tous'], max: 10, obligatoire: false },
    persoZ: { roles: ['tous'], max: 8, obligatoire: false },
    archiveZ: { roles: ['Receptionniste', 'Technicien', 'Agent', 'Manager', 'Autre'], max: 2, obligatoire: true }
};
window.addEventListener('DOMContentLoaded', function() {
    afficherEmployesNonAssignes();
    afficherToutesLesZones();
    verifierZonesVides();
    document.querySelector('.ajout').addEventListener('click', ouvrirFormulaire);
    document.getElementById('exp').addEventListener('click', ajouterChampExperience);
    document.getElementById('Photo').addEventListener('input', function() {
        const preview = document.getElementById('photo-user');
        preview.src = this.value || '';
        preview.style.display = this.value ? 'block' : 'none';
    });
    document.querySelector('.formul').addEventListener('submit', function(e) {
        e.preventDefault();
        sauvegarderEmploye();
    });
    document.querySelector('.annule').addEventListener('click', fermerFormulaire);
    document.querySelector('.infos').addEventListener('click', function(e) {
        if (e.target === this) fermerFormulaire();
    });
    document.querySelectorAll('.zone .btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            afficherModalSelection(this.getAttribute('data'));
        });
    });
});
function ouvrirFormulaire() {
    document.querySelector('.infos').style.display = 'flex';
    viderFormulaire();
}
function fermerFormulaire() {
    document.querySelector('.infos').style.display = 'none';
    viderFormulaire();
}
function viderFormulaire() {
    document.querySelector('.formul').reset();
    document.getElementById('photo-user').style.display = 'none';
    document.getElementById('experiences').innerHTML = '';
}

function ajouterChampExperience() {
    const container = document.getElementById('experiences');
    const divExp = document.createElement('div');
    divExp.className = 'experience-item';
    divExp.style.cssText = 'border:1px solid #ddd; padding:1rem; margin-top:1rem; border-radius:8px;';
    divExp.innerHTML = `
        <label>Poste</label>
        <input type="text" class="exp-poste" required />
        <label>Entreprise</label>
        <input type="text" class="exp-entreprise" required />
        <label>Date début</label>
        <input type="date" class="exp-debut" required />
        <label>Date fin</label>
        <input type="date" class="exp-fin" required />
        <button type="button" class="supprimer-exp" 
                style="margin-top:0.5rem; background:#dc2626; color:white; 
                padding:0.5rem 1rem; border:none; border-radius:6px; cursor:pointer;">Supprimer</button>`;
    container.appendChild(divExp);
    divExp.querySelector('.supprimer-exp').addEventListener('click', function() {
        divExp.remove();
    });
}
function sauvegarderEmploye() {
    const nom = document.getElementById('nom').value.trim();
    const role = document.getElementById('roles').value;
    const photo = document.getElementById('Photo').value.trim();
    const email = document.getElementById('email').value.trim();
    const tel = document.getElementById('tele').value.trim();
    
    if (nom.length < 2) {
        afficherMessage('Le nom doit contenir au moins 2 caractères', 'error');
        return;
    }
    if (!role) {
        afficherMessage('Veuillez choisir un rôle', 'error');
        return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        afficherMessage('Email invalide', 'error');
        return;
    }
    if (tel && !/^[\d\s+()-]{10,20}$/.test(tel)) {
        afficherMessage('Téléphone invalide', 'error');
        return;
    }
    const experiences = [];
    document.querySelectorAll('.experience-item').forEach(function(item) {
        const debut = item.querySelector('.exp-debut').value;
        const fin = item.querySelector('.exp-fin').value;
        
        if (new Date(debut) >= new Date(fin)) {
            afficherMessage('La date de début doit être avant la date de fin', 'error');
            return;
        }
        
        experiences.push({
            poste: item.querySelector('.exp-poste').value,
            entreprise: item.querySelector('.exp-entreprise').value,
            debut: debut,
            fin: fin
        });
    });
    listeEmployes.push({
        id: Date.now().toString(),
        nom: nom,
        role: role,
        photo: photo || 'https://via.placeholder.com/50',
        email: email,
        telephone: tel,
        experiences: experiences
    });
    sauvegarderDansLocalStorage();
    afficherEmployesNonAssignes();
    fermerFormulaire();
}

function afficherEmployesNonAssignes() {
    const container = document.querySelector('.members .content');
    container.innerHTML = '';
    
    const nonAssignes = listeEmployes.filter(function(emp) {
        return !estAssigne(emp.id);
    });
    
    if (nonAssignes.length === 0) {
        container.innerHTML = '<p style="color:white; text-align:center; padding:1rem;">Aucun employé</p>';
        return;
    }
    
    nonAssignes.forEach(function(emp) {
        container.appendChild(creerCarteEmploye(emp));
    });
}
function estAssigne(idEmploye) {
    for (let zone in affectationsZones) {
        if (affectationsZones[zone].includes(idEmploye)) return true;
    }return false;
}
function creerCarteEmploye(employe) {
    const div = document.createElement('div');
    div.draggable = true;
    div.dataset.id = employe.id;
    div.style.cssText = 'background:white; border-radius:12px; padding:1rem; margin-bottom:0.8rem; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.1);';
    div.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.8rem;">
            <img src="${employe.photo}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;" />
            <div style="flex:1;">
                <div style="font-weight:600; color:#333;">${employe.nom}</div>
                <div style="font-size:0.85rem; color:#666;">${employe.role}</div>
            </div>
        </div>
    `;
    div.addEventListener('click', function() {
        afficherProfilEmploye(employe);
    });
    div.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('employeId', employe.id);
        div.style.opacity = '0.5';
    });
    
    div.addEventListener('dragend', function() {
        div.style.opacity = '1';
    });
    
    return div;
}

function afficherToutesLesZones() {
    ['conferenceZ', 'receptionZ', 'serverZ', 'securiteZ', 'persoZ', 'archiveZ'].forEach(afficherZone);
}

function afficherZone(idZone) {
    const bouton = document.querySelector('[data="' + idZone + '"]');
    const containerUsers = bouton.closest('.zone').querySelector('.users');
    containerUsers.innerHTML = '';
    
    if (!affectationsZones[idZone]) {
        affectationsZones[idZone] = [];
    }
    
    affectationsZones[idZone].forEach(function(idEmp) {
        const employe = trouverEmploye(idEmp);
        if (employe) containerUsers.appendChild(creerCarteZone(employe, idZone));
    });
    
    activerDragDropZone(containerUsers, idZone);
}

function creerCarteZone(employe, idZone) {
    const div = document.createElement('div');
    div.draggable = true;
    div.dataset.id = employe.id;
    div.style.cssText = 'background:white; border-radius:12px; padding:0.8rem; margin-bottom:0.6rem; cursor:move; box-shadow:0 2px 4px rgba(0,0,0,0.1);';
    
    div.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.8rem;">
            <img src="${employe.photo}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" />
            <div style="flex:1;">
                <div style="font-weight:600; font-size:0.9rem; color:#333;">${employe.nom}</div>
                <div style="font-size:0.75rem; color:#666;">${employe.role}</div>
            </div>
            <button class="btn-retirer" style="background:#dc2626; color:white; border:none; 
                    border-radius:50%; width:24px; height:24px; cursor:pointer; font-weight:bold;">×</button>
        </div>
    `;
    
    div.querySelector('.btn-retirer').addEventListener('click', function(e) {
        e.stopPropagation();
        retirerDeLaZone(employe.id);
    });
    
    div.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('employeId', employe.id);
        div.style.opacity = '0.5';
    });
    
    div.addEventListener('dragend', function() {
        div.style.opacity = '1';
    });
    
    return div;
}

function activerDragDropZone(container, idZone) {
    container.addEventListener('dragover', function(e) {
        e.preventDefault();
        container.style.background = 'rgba(59, 130, 246, 0.1)';
    });
    
    container.addEventListener('dragleave', function() {
        container.style.background = 'rgba(255, 235, 205, 0.215)';
    });
    
    container.addEventListener('drop', function(e) {
        e.preventDefault();
        container.style.background = 'rgba(255, 235, 205, 0.215)';
        
        const idEmploye = e.dataTransfer.getData('employeId');
        const employe = trouverEmploye(idEmploye);
        
        if (!employe) return;
        
        if (peutAssigner(employe, idZone)) {
            retirerDeLaZone(idEmploye);
            affectationsZones[idZone].push(idEmploye);
            sauvegarderDansLocalStorage();
            afficherEmployesNonAssignes();
            afficherToutesLesZones();
            verifierZonesVides();
        } else {
            afficherMessage('Cet employé ne peut pas être assigné à cette zone', 'error');
        }
    });
}

function peutAssigner(employe, idZone) {
    const regles = reglesZones[idZone];
    
    if (affectationsZones[idZone].length >= regles.max) {
        afficherMessage('Capacité maximale atteinte (' + regles.max + ')', 'error');
        return false;
    }
    
    if (employe.role === 'Manager') return true;
    if (employe.role === 'Nettoyage' && idZone !== 'archiveZ') return true;
    if (regles.roles.includes('tous')) return true;
    
    return regles.roles.includes(employe.role);
}

function retirerDeLaZone(idEmploye) {
    for (let zone in affectationsZones) {
        affectationsZones[zone] = affectationsZones[zone].filter(function(id) {
            return id !== idEmploye;
        });
    }
    sauvegarderDansLocalStorage();
    afficherEmployesNonAssignes();
    afficherToutesLesZones();
    verifierZonesVides();
}

function afficherModalSelection(idZone) {
    const eligibles = listeEmployes.filter(function(emp) {
        return !estAssigne(emp.id) && peutAssigner(emp, idZone);
    });
    
    if (eligibles.length === 0) {
        afficherMessage('Aucun employé disponible pour cette zone', 'error');
        return;
    }
    
    const modal2 = document.getElementById('modal-2');
    let html = '<div style="background:white; padding:2rem; border-radius:16px; max-width:500px; margin:5rem auto; max-height:80vh; overflow-y:auto;"><h2 style="margin-bottom:1rem;">Sélectionnez un employé</h2><div id="liste-selection">';
    
    eligibles.forEach(function(emp) {
        html += `<div class="item-selection" data-id="${emp.id}" style="padding:1rem; border:1px solid #ddd; margin-bottom:0.5rem; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:1rem;">
            <img src="${emp.photo}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" />
            <div><div style="font-weight:600;">${emp.nom}</div><div style="font-size:0.85rem; color:#666;">${emp.role}</div></div></div>`;
    });
    
    html += '</div><button id="fermer-modal2" style="margin-top:1rem; padding:0.6rem 1.5rem; background:#dc2626; color:white; border:none; border-radius:999px; cursor:pointer; font-weight:bold;">Annuler</button></div>';
    
    modal2.innerHTML = html;
    modal2.style.display = 'block';
    
    modal2.querySelectorAll('.item-selection').forEach(function(item) {
        item.addEventListener('click', function() {
            affectationsZones[idZone].push(this.dataset.id);
            sauvegarderDansLocalStorage();
            afficherEmployesNonAssignes();
            afficherToutesLesZones();
            verifierZonesVides();
            modal2.style.display = 'none';
        });
    });
    
    modal2.querySelector('#fermer-modal2').addEventListener('click', function() {
        modal2.style.display = 'none';
    });
}

function afficherProfilEmploye(employe) {
    let zoneActuelle = 'Non assigné';
    const nomsZones = {
        conferenceZ: 'Salle de conférence', receptionZ: 'Réception', serverZ: 'Salle des serveurs',
        securiteZ: 'Salle de sécurité', persoZ: 'Salle du personnel', archiveZ: "Salle d'archives"
    };
    
    for (let zone in affectationsZones) {
        if (affectationsZones[zone].includes(employe.id)) {
            zoneActuelle = nomsZones[zone];
            break;
        }
    }
    
    const modal2 = document.getElementById('modal-2');
    let html = `<div style="background:white; padding:2.5rem; border-radius:16px; max-width:600px; margin:3rem auto; max-height:85vh; overflow-y:auto;">
        <div style="text-align:center;">
            <img src="${employe.photo}" style="width:150px; height:150px; border-radius:50%; object-fit:cover; margin-bottom:1rem;" />
            <h2>${employe.nom}</h2>
            <p style="color:#666; font-size:1.1rem; margin-bottom:1rem;">${employe.role}</p>
        </div>
        <div style="margin-top:1.5rem; line-height:1.8;">
            <p><strong>Email:</strong> ${employe.email || 'Non renseigné'}</p>
            <p><strong>Téléphone:</strong> ${employe.telephone || 'Non renseigné'}</p>
            <p><strong>Localisation:</strong> ${zoneActuelle}</p>`;
    
    if (employe.experiences && employe.experiences.length > 0) {
        html += '<h3 style="margin-top:1.5rem; margin-bottom:0.5rem;">Expériences</h3>';
        employe.experiences.forEach(function(exp) {
            html += `<div style="background:#f3f4f6; padding:1rem; border-radius:8px; margin-bottom:0.5rem;">
                <div style="font-weight:600;">${exp.poste}</div>
                <div style="color:#666;">${exp.entreprise}</div>
                <div style="font-size:0.85rem; color:#888;">${exp.debut} - ${exp.fin}</div></div>`;
        });
    }
    
    html += `</div><div style="display:flex; gap:1rem; margin-top:2rem;">
        <button id="supprimer-emp" data-id="${employe.id}" style="flex:1; padding:0.8rem; background:#dc2626; color:white; border:none; border-radius:999px; cursor:pointer; font-weight:bold;">Supprimer</button>
        <button id="fermer-profil" style="flex:1; padding:0.8rem; background:#6b7280; color:white; border:none; border-radius:999px; cursor:pointer; font-weight:bold;">Fermer</button>
    </div></div>`;
    
    modal2.innerHTML = html;
    modal2.style.display = 'block';
    
    modal2.querySelector('#supprimer-emp').addEventListener('click', function() {
        if (confirm('Supprimer cet employé ?')) {
            supprimerEmploye(this.dataset.id);
            modal2.style.display = 'none';
        }
    });
    
    modal2.querySelector('#fermer-profil').addEventListener('click', function() {
        modal2.style.display = 'none';
    });
}

function supprimerEmploye(id) {
    listeEmployes = listeEmployes.filter(function(emp) {
        return emp.id !== id;
    });
    retirerDeLaZone(id);
}

function verifierZonesVides() {
    for (let idZone in reglesZones) {
        const regles = reglesZones[idZone];
        const zoneDiv = document.querySelector('[data="' + idZone + '"]').closest('.item');
        
        if (regles.obligatoire && (!affectationsZones[idZone] || affectationsZones[idZone].length === 0)) {
            zoneDiv.style.backgroundColor = 'rgba(255, 200, 200, 0.3)';
        } else {
            zoneDiv.style.backgroundColor = '';
        }
    }
}

function trouverEmploye(id) {
    return listeEmployes.find(function(emp) {
        return emp.id === id;
    });
}

function sauvegarderDansLocalStorage() {
    localStorage.setItem('employes', JSON.stringify(listeEmployes));
    localStorage.setItem('affectations', JSON.stringify(affectationsZones));
}

function afficherMessage(texte, type) {
    const ancienMsg = document.querySelector('.message-personnalise');
    if (ancienMsg) ancienMsg.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-personnalise';
    messageDiv.style.cssText = `position:fixed; top:20px; left:50%; transform:translateX(-50%); background:${type === 'error' ? '#dc2626' : '#16a34a'}; color:white; padding:1rem 2rem; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3); z-index:9999; font-weight:600; animation:slideDown 0.3s ease;`;
    messageDiv.textContent = texte;
    document.body.appendChild(messageDiv);
    
    setTimeout(function() {
        messageDiv.style.animation = 'slideUp 0.3s ease';
        setTimeout(function() {
            messageDiv.remove();
        }, 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = '@keyframes slideDown{from{top:-100px;opacity:0}to{top:20px;opacity:1}}@keyframes slideUp{from{top:20px;opacity:1}to{top:-100px;opacity:0}}';
document.head.appendChild(style);