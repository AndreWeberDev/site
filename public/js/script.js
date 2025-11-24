// Dados dos projetos (simulando o arquivo JSON)
const projetos = [
    {
        "id": "01",
        "nome": "Dino Google",
        "descricao": "Jogo do dinossauro feito em JS.",
        "link": "https://scratch.mit.edu/projects/711633476",
        "imagem": "./assets/img/IconeJogos/controlador.png"
    },
    {
        "id": "02",
        "nome": "Gerador de Cards Aleatórios RPG",
        "descricao": "Um gerador de cards com informações de um personagem de MMORPG feito em JS, HTML e CSS.",
        "link": "https://github.com/Juninm0/rpgcard",
        "imagem": "./assets/img/IconeJogos/controle-de-jogo.png"
    },
    {
        "id": "03",
        "nome": "Mario V2",
        "descricao": "Uma pequena arte de pixels criativa.",
        "link": "https://juninnn.github.io/portifolio/public/index.html",
        "imagem": "./assets/img/IconeJogos/controle-de-video-game (1).png"
    },
    {
        "id": "04",
        "nome": "Fruit Ninja",
        "descricao": "Um clássico jogo de celular recriado para web.",
        "link": "https://juninm0.github.io/fruitninja/",
        "imagem": "./assets/img/IconeJogos/controlador.png"
    },
    {
        "id": "05",
        "nome": "Mario Game",
        "descricao": "Um dos meus primeiros jogos feito quase inteiramente em JavaScript.",
        "link": "https://github.com/Juninm0",
        "imagem": "./assets/img/IconeJogos/controle-de-jogo.png"
    },
    {
        "id": "06",
        "nome": "Próximo Projeto",
        "descricao": "Novo projeto em desenvolvimento.",
        "link": "https://github.com/Juninm0",
        "imagem": "./assets/img/IconeJogos/controle-de-video-game (1).png"
    }
];

// Função para carregar projetos no grid (página inicial)
function carregarProjetos() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = '';
    
    projetos.forEach(projeto => {
        const card = document.createElement('div');
        card.className = 'project-card';
        
        const tecnologias = getTecnologias(projeto.nome);
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${projeto.imagem}" alt="${projeto.nome}">
                <div class="card-overlay">
                    <span class="project-id">#${projeto.id}</span>
                </div>
            </div>
            <div class="card-content">
                <h3 class="project-title">${projeto.nome}</h3>
                <p class="project-description">${projeto.descricao}</p>
                <div class="project-tags">
                    ${tecnologias.map(tech => `<span class="tag">${tech}</span>`).join('')}
                </div>
                <div class="card-actions">
                    <a href="${projeto.link}" target="_blank" class="btn-primary">
                        Ver Projeto
                    </a>
                </div>
            </div>
        `;
        
        projectsGrid.appendChild(card);
    });
}

// Função para definir tecnologias baseado no nome do projeto
function getTecnologias(nome) {
    const tech = {
        'Dino Google': ['JavaScript', 'HTML5'],
        'Gerador de Cards Aleatórios RPG': ['JavaScript', 'HTML5', 'CSS3'],
        'Piskel Art': ['Pixel Art', 'Design'],
        'Fruit Ninja': ['JavaScript', 'Canvas'],
        'Mario Game': ['JavaScript', 'Game Dev'],
        'Próximo Projeto': ['Em breve']
    };
    return tech[nome] || ['Web'];
}

// Função para editar projeto (placeholder)
function editarProjeto(id) {
    alert(`Editar projeto ${id} - Funcionalidade em desenvolvimento`);
}

// Função para adicionar novo projeto
function adicionarProjeto(event) {
    event.preventDefault();
    
    const form = event.target;
    const icones = [
        "./assets/img/IconeJogos/controlador.png",
        "./assets/img/IconeJogos/controle-de-jogo.png",
        "./assets/img/IconeJogos/controle-de-video-game (1).png"
    ];
    
    const novoProjeto = {
        id: String(projetos.length + 1).padStart(2, '0'),
        nome: form.nome.value,
        descricao: form.descricao.value,
        link: form.link.value,
        imagem: form.imagem.value || icones[projetos.length % 3]
    };
    
    projetos.push(novoProjeto);
    carregarProjetos();
    form.reset();
    
    // Animação de sucesso
    mostrarNotificacao('Projeto adicionado com sucesso!', 'success');
}

// Função para mostrar notificações
function mostrarNotificacao(mensagem, tipo) {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensagem;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Aguardar sistema de autenticação estar pronto
function initializePageContent() {
    // Forçar verificação após pequeno delay
    setTimeout(() => {
        if (window.location.pathname.includes('contatos.html')) {
            checkContactsAuth();
        } else if (window.location.pathname.includes('meusProjetos.html')) {
            checkProjectsAuth();
        } else {
            carregarProjetos();
        }
    }, 50);
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Sempre mostrar aviso por padrão primeiro
    if (window.location.pathname.includes('contatos.html') || window.location.pathname.includes('meusProjetos.html')) {
        const loginRequired = document.getElementById('loginRequired');
        if (loginRequired) {
            loginRequired.style.display = 'block';
        }
    }
    
    // Aguardar evento de auth pronto
    if (window.auth) {
        initializePageContent();
    } else {
        window.addEventListener('authReady', initializePageContent);
        // Fallback caso o evento não dispare
        setTimeout(initializePageContent, 300);
    }
    
    const formProjeto = document.getElementById('form-projeto');
    if (formProjeto) {
        formProjeto.addEventListener('submit', adicionarProjeto);
    }
});

// Verificar autenticação para contatos
function checkContactsAuth() {
    const loginRequired = document.getElementById('loginRequired');
    const contactsContent = document.getElementById('contactsContent');
    
    if (!loginRequired || !contactsContent) {
        console.log('Elementos não encontrados na página de contatos');
        return;
    }
    
    let isLoggedIn = false;
    
    try {
        isLoggedIn = window.auth && typeof auth.isLoggedIn === 'function' && auth.isLoggedIn();
    } catch (error) {
        console.log('Erro ao verificar login:', error);
        isLoggedIn = false;
    }
    
    console.log('Status de login (contatos):', isLoggedIn);
    
    if (isLoggedIn) {
        loginRequired.style.display = 'none';
        contactsContent.style.display = 'block';
    } else {
        loginRequired.style.display = 'block';
        contactsContent.style.display = 'none';
    }
}

// Verificar autenticação para projetos
function checkProjectsAuth() {
    const loginRequired = document.getElementById('loginRequired');
    const projectsContent = document.getElementById('projectsContent');
    
    if (!loginRequired || !projectsContent) {
        console.log('Elementos não encontrados na página de projetos');
        return;
    }
    
    let isLoggedIn = false;
    
    try {
        isLoggedIn = window.auth && typeof auth.isLoggedIn === 'function' && auth.isLoggedIn();
    } catch (error) {
        console.log('Erro ao verificar login:', error);
        isLoggedIn = false;
    }
    
    console.log('Status de login (projetos):', isLoggedIn);
    
    if (isLoggedIn) {
        loginRequired.style.display = 'none';
        projectsContent.style.display = 'block';
        loadProjectsFromStorage();
    } else {
        loginRequired.style.display = 'block';
        projectsContent.style.display = 'none';
    }
}

// Carregar projetos do localStorage (para usuários logados)
function loadProjectsFromStorage() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;
    
    const storedProjects = JSON.parse(localStorage.getItem('projects')) || [];
    const allProjects = [...projetos, ...storedProjects];
    
    projectsGrid.innerHTML = '';
    
    allProjects.forEach(projeto => {
        const card = document.createElement('div');
        card.className = 'project-card';
        
        const tecnologias = getTecnologias(projeto.nome || projeto.title);
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${projeto.imagem || projeto.image}" alt="${projeto.nome || projeto.title}">
                <div class="card-overlay">
                    <span class="project-id">#${projeto.id}</span>
                </div>
            </div>
            <div class="card-content">
                <h3 class="project-title">${projeto.nome || projeto.title}</h3>
                <p class="project-description">${projeto.descricao || projeto.description}</p>
                <div class="project-tags">
                    ${tecnologias.map(tech => `<span class="tag">${tech}</span>`).join('')}
                </div>
                <div class="card-actions">
                    <a href="${projeto.link}" target="_blank" class="btn-primary">
                        Ver Projeto
                    </a>
                </div>
            </div>
        `;
        
        projectsGrid.appendChild(card);
    });
}
