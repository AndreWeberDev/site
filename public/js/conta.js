// Verificar autenticação e carregar dados da conta
document.addEventListener('DOMContentLoaded', function() {
  if (!checkAuth()) return;
  
  loadUserInfo();
  
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', handleChangePassword);
  }
  
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
}

function handleProfileUpdate(e) {
  e.preventDefault();
  
  const displayName = document.getElementById('displayName').value;
  const username = document.getElementById('username').value;
  const nickname = document.getElementById('nickname').value;
  const bio = document.getElementById('bio').value;
  
  const profileData = {
    displayName,
    username,
    nickname,
    bio
  };
  
  try {
    auth.updateUserProfile(auth.currentUser.id, profileData);
    loadUserInfo();
    showSuccess('Perfil atualizado com sucesso!');
  } catch (error) {
    showError('Erro ao atualizar perfil');
  }
});

function loadUserInfo() {
  const userInfo = document.getElementById('userInfo');
  if (!userInfo || !auth.currentUser) return;
  
  const user = auth.currentUser;
  
  userInfo.innerHTML = `
    <div class="user-details">
      <h2>${user.displayName || user.name}</h2>
      <p class="username">@${user.username || user.email.split('@')[0]}</p>
      <p class="nickname">${user.nickname || 'Sem apelido'}</p>
      <p class="bio">${user.bio || 'Nenhuma biografia definida'}</p>
      <span class="user-badge ${user.isAdmin ? 'admin' : 'user'}">
        ${user.isAdmin ? 'Admin' : 'Usuário'}
      </span>
    </div>
  `;
  
  // Carregar avatar
  const avatarImg = document.getElementById('avatarImg');
  if (avatarImg) {
    avatarImg.src = user.avatar || './assets/img/default-avatar.png';
    // Suporte para GIFs animados
    if (user.avatarType === 'image/gif') {
      avatarImg.style.imageRendering = 'auto';
    }
  }
  
  // Atualizar avatar no sidebar
  if (user.avatar) {
    updateSidebarAvatar(user.avatar);
  }
  
  // Preencher formulário
  loadProfileForm();
}

function loadProfileForm() {
  const user = auth.currentUser;
  if (!user) return;
  
  document.getElementById('displayName').value = user.displayName || user.name;
  document.getElementById('username').value = user.username || user.email.split('@')[0];
  document.getElementById('nickname').value = user.nickname || '';
  document.getElementById('bio').value = user.bio || '';
}

function showTab(tabName) {
  // Remover classe active de todas as abas
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
  
  // Ativar aba selecionada
  event.target.classList.add('active');
  document.getElementById(tabName + 'Tab').style.display = 'block';
}

async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const avatarImg = document.getElementById('avatarImg');
  const originalSrc = avatarImg.src;
  
  try {
    // Validar arquivo
    ImageProcessor.validateFile(file);
    
    // Mostrar loading
    avatarImg.style.opacity = '0.5';
    
    // Processar imagem
    const processedImage = await ImageProcessor.processImage(file);
    
    // Atualizar avatar
    avatarImg.src = processedImage;
    avatarImg.style.opacity = '1';
    
    // Salvar no perfil
    auth.updateUserProfile(auth.currentUser.id, { 
      avatar: processedImage,
      avatarType: file.type
    });
    
    showSuccess(`Avatar ${file.type === 'image/gif' ? 'GIF' : ''} atualizado com sucesso!`);
    updateSidebarAvatar(processedImage);
    
  } catch (error) {
    avatarImg.src = originalSrc;
    avatarImg.style.opacity = '1';
    showError(error.message);
  }
}

// Atualizar avatar no sidebar
function updateSidebarAvatar(avatarUrl) {
  const sidebarHeader = document.querySelector('.sidebar-header');
  if (!sidebarHeader || !auth.isLoggedIn()) return;
  
  let avatarElement = sidebarHeader.querySelector('.sidebar-avatar');
  if (!avatarElement) {
    avatarElement = document.createElement('div');
    avatarElement.className = 'sidebar-avatar';
    avatarElement.innerHTML = '<img src="" alt="Avatar">';
    sidebarHeader.appendChild(avatarElement);
  }
  
  const img = avatarElement.querySelector('img');
  img.src = avatarUrl;
}

function handleChangePassword(e) {
  e.preventDefault();
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  
  if (auth.currentUser.password !== currentPassword) {
    showError('Senha atual incorreta');
    return;
  }
  
  if (newPassword !== confirmNewPassword) {
    showError('Novas senhas não coincidem');
    return;
  }
  
  try {
    auth.validatePassword(newPassword);
    
    // Atualizar senha
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === auth.currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      auth.currentUser.password = newPassword;
      
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(auth.currentUser));
      
      showSuccess('Senha alterada com sucesso!');
      e.target.reset();
    }
  } catch (error) {
    showError(error.message);
  }
}