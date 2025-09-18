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

let currentImageFile = null;
let currentImageData = null;

async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    // Validar arquivo
    ImageProcessor.validateFile(file);
    
    currentImageFile = file;
    
    // Ler arquivo para preview
    const reader = new FileReader();
    reader.onload = function(e) {
      currentImageData = e.target.result;
      showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
  } catch (error) {
    showError(error.message);
  }
}

function showImagePreview(imageSrc) {
  const modal = document.getElementById('imagePreviewModal');
  const previewImg = document.getElementById('previewImage');
  const sizeSlider = document.getElementById('cropSize');
  const sizeValue = document.getElementById('sizeValue');
  
  previewImg.src = imageSrc;
  modal.classList.remove('hidden');
  
  // Atualizar tamanho em tempo real
  sizeSlider.oninput = function() {
    const size = this.value;
    previewImg.style.width = size + 'px';
    previewImg.style.height = size + 'px';
    sizeValue.textContent = size + 'px';
  };
  
  // Definir tamanho inicial
  previewImg.style.width = '200px';
  previewImg.style.height = '200px';
}

function cancelCrop() {
  const modal = document.getElementById('imagePreviewModal');
  modal.classList.add('hidden');
  currentImageFile = null;
  currentImageData = null;
  
  // Limpar input
  document.getElementById('avatarInput').value = '';
}

async function applyCrop() {
  if (!currentImageData) return;
  
  const sizeSlider = document.getElementById('cropSize');
  const targetSize = parseInt(sizeSlider.value);
  
  try {
    // Processar imagem com tamanho personalizado
    const processedImage = await ImageProcessor.processImage(currentImageFile, targetSize);
    
    // Atualizar avatar na página
    const avatarImg = document.getElementById('avatarImg');
    avatarImg.src = processedImage;
    
    // Mostrar preview na página
    showAvatarPreview(processedImage);
    
    // Salvar no perfil
    auth.updateUserProfile(auth.currentUser.id, { 
      avatar: processedImage,
      avatarType: currentImageFile.type
    });
    
    showSuccess(`Avatar ${currentImageFile.type === 'image/gif' ? 'GIF' : ''} atualizado com sucesso!`);
    updateSidebarAvatar(processedImage);
    
    // Fechar modal
    cancelCrop();
    
  } catch (error) {
    showError(error.message);
  }
}

function showAvatarPreview(imageSrc) {
  // Criar ou atualizar preview na página
  let previewContainer = document.getElementById('avatarPreviewContainer');
  
  if (!previewContainer) {
    previewContainer = document.createElement('div');
    previewContainer.id = 'avatarPreviewContainer';
    previewContainer.className = 'avatar-preview-container';
    previewContainer.innerHTML = `
      <h4>Sua Nova Foto:</h4>
      <div class="avatar-preview-img">
        <img id="avatarPreviewImg" src="" alt="Preview">
      </div>
    `;
    
    // Inserir após a seção de avatar
    const profileSection = document.querySelector('.profile-section-account');
    profileSection.appendChild(previewContainer);
  }
  
  const previewImg = document.getElementById('avatarPreviewImg');
  previewImg.src = imageSrc;
  
  // Animação de entrada
  previewContainer.style.opacity = '0';
  previewContainer.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    previewContainer.style.transition = 'all 0.5s ease';
    previewContainer.style.opacity = '1';
    previewContainer.style.transform = 'translateY(0)';
  }, 100);
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