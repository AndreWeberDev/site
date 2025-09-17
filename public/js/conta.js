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
  if (avatarImg && user.avatar) {
    avatarImg.src = user.avatar;
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

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const avatarImg = document.getElementById('avatarImg');
    avatarImg.src = e.target.result;
    
    // Salvar avatar no perfil
    auth.updateUserProfile(auth.currentUser.id, { avatar: e.target.result });
    showSuccess('Avatar atualizado com sucesso!');
  };
  reader.readAsDataURL(file);
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