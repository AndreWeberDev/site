// Sistema de configurações
class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
    this.applySettings();
  }

  loadSettings() {
    const defaultSettings = {
      fontSize: 'normal',
      highContrast: false,
      reduceMotion: false,
      hardwareAcceleration: true,
      animations: true,
      blurEffects: true
    };

    const saved = localStorage.getItem('userSettings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  }

  saveSettings() {
    localStorage.setItem('userSettings', JSON.stringify(this.settings));
  }

  applySettings() {
    const body = document.body;
    const html = document.documentElement;

    // Remover classes anteriores
    body.classList.remove('font-large', 'font-extra-large', 'high-contrast', 'reduce-motion', 'no-hardware-acceleration', 'no-animations', 'no-blur');

    // Aplicar configurações
    if (this.settings.fontSize === 'large') {
      body.classList.add('font-large');
    } else if (this.settings.fontSize === 'extra-large') {
      body.classList.add('font-extra-large');
    }

    if (this.settings.highContrast) {
      body.classList.add('high-contrast');
    }

    if (this.settings.reduceMotion) {
      body.classList.add('reduce-motion');
    }

    if (!this.settings.hardwareAcceleration) {
      body.classList.add('no-hardware-acceleration');
    }

    if (!this.settings.animations) {
      body.classList.add('no-animations');
    }

    if (!this.settings.blurEffects) {
      body.classList.add('no-blur');
    }
  }

  updateSetting(key, value) {
    this.settings[key] = value;
    this.applySettings();
  }

  resetToDefaults() {
    this.settings = {
      fontSize: 'normal',
      highContrast: false,
      reduceMotion: false,
      hardwareAcceleration: true,
      animations: true,
      blurEffects: true
    };
    this.applySettings();
    this.updateUI();
  }

  updateUI() {
    document.getElementById('fontSize').value = this.settings.fontSize;
    document.getElementById('highContrast').checked = this.settings.highContrast;
    document.getElementById('reduceMotion').checked = this.settings.reduceMotion;
    document.getElementById('hardwareAcceleration').checked = this.settings.hardwareAcceleration;
    document.getElementById('animations').checked = this.settings.animations;
    document.getElementById('blurEffects').checked = this.settings.blurEffects;
  }
}

// Instância global
const settingsManager = new SettingsManager();

// Inicializar página de configurações
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('configuracoes.html')) {
    initializeSettingsPage();
  }
});

function initializeSettingsPage() {
  // Atualizar UI com configurações atuais
  settingsManager.updateUI();

  // Event listeners
  document.getElementById('fontSize').addEventListener('change', function(e) {
    settingsManager.updateSetting('fontSize', e.target.value);
  });

  document.getElementById('highContrast').addEventListener('change', function(e) {
    settingsManager.updateSetting('highContrast', e.target.checked);
  });

  document.getElementById('reduceMotion').addEventListener('change', function(e) {
    settingsManager.updateSetting('reduceMotion', e.target.checked);
  });

  document.getElementById('hardwareAcceleration').addEventListener('change', function(e) {
    settingsManager.updateSetting('hardwareAcceleration', e.target.checked);
  });

  document.getElementById('animations').addEventListener('change', function(e) {
    settingsManager.updateSetting('animations', e.target.checked);
  });

  document.getElementById('blurEffects').addEventListener('change', function(e) {
    settingsManager.updateSetting('blurEffects', e.target.checked);
  });
}

function saveSettings() {
  settingsManager.saveSettings();
  
  // Feedback visual
  const btn = document.querySelector('.btn-save');
  const originalText = btn.textContent;
  btn.textContent = 'Salvo!';
  btn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = 'linear-gradient(135deg, #4285f4, #8ab4f8)';
  }, 2000);
}

function resetSettings() {
  if (confirm('Tem certeza que deseja restaurar todas as configurações para o padrão?')) {
    settingsManager.resetToDefaults();
    
    // Feedback visual
    const btn = document.querySelector('.btn-reset');
    const originalText = btn.textContent;
    btn.textContent = 'Restaurado!';
    
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }
}