// Sistema de menu lateral dinâmico
function updateSidebar() {
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (!sidebarNav) return;

  const isLoggedIn = auth.isLoggedIn();
  const isAdmin = auth.isAdmin();
  
  // Menu base
  let menuItems = `
    <a href="./index.html" class="nav-item ${window.location.pathname.includes('index.html') || window.location.pathname === '/' ? 'active' : ''}">
      <span class="nav-icon">🏠</span>
      <span class="nav-text">Home</span>
    </a>
    <a href="./meusProjetos.html" class="nav-item ${window.location.pathname.includes('meusProjetos.html') ? 'active' : ''}">
      <span class="nav-icon">💼</span>
      <span class="nav-text">Projetos</span>
    </a>
    <a href="./contatos.html" class="nav-item ${window.location.pathname.includes('contatos.html') ? 'active' : ''}">
      <span class="nav-icon">📞</span>
      <span class="nav-text">Contatos</span>
    </a>
  `;

  if (isLoggedIn) {
    // Menu para usuários logados
    if (isAdmin) {
      menuItems += `
        <a href="./admin.html" class="nav-item ${window.location.pathname.includes('admin.html') ? 'active' : ''}">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">Admin</span>
        </a>
      `;
    }
    menuItems += `
      <a href="./conta.html" class="nav-item ${window.location.pathname.includes('conta.html') ? 'active' : ''}">
        <span class="nav-icon">👤</span>
        <span class="nav-text">Sua Conta</span>
      </a>
      <a href="#" class="nav-item" onclick="logout()">
        <span class="nav-icon">🚪</span>
        <span class="nav-text">Sair</span>
      </a>
    `;
  } else {
    // Menu para usuários não logados
    menuItems += `
      <a href="./login.html" class="nav-item ${window.location.pathname.includes('login.html') ? 'active' : ''}">
        <span class="nav-icon">🔑</span>
        <span class="nav-text">Login</span>
      </a>
      <a href="./register.html" class="nav-item ${window.location.pathname.includes('register.html') ? 'active' : ''}">
        <span class="nav-icon">📝</span>
        <span class="nav-text">Cadastro</span>
      </a>
    `;
  }

  sidebarNav.innerHTML = menuItems;
}

// Atualizar sidebar quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
  updateSidebar();
});

// Atualizar sidebar após login/logout
function refreshSidebar() {
  updateSidebar();
}