// JavaScript para config.html
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar seção de Imagens por padrão
    setTimeout(() => {
        showSection('images');
    }, 100);
    
    loadCurrentVersion();
    // Dashboard removido: relatórios de vendas não são mais carregados
    loadPrinterConfiguration();
    loadCurrentSettings();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Event listeners para o menu lateral
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            console.log('Clicou na seção:', section);
            showSection(section);
            
            // Atualizar item ativo no menu
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Botão de salvar configurações de imagem - VERIFICAR SE EXISTE
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        saveButton.addEventListener('click', saveImageConfig);
    } else {
        console.warn('⚠️ Botão save-button não encontrado');
    }
    
    // Botão de logout - VERIFICAR SE EXISTE
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            if (confirm('Tem certeza que deseja sair da área administrativa?')) {
                window.location.href = '/';
            }
        });
    } else {
        console.warn('⚠️ Botão logout-button não encontrado');
    }
    
    // Event listeners adicionais
    // Botão de atualizar dashboard removido
    
    const checkUpdatesButton = document.getElementById('check-updates-button');
    if (checkUpdatesButton && window.electronAPI && window.electronAPI.selectUpdateZip) {
        checkUpdatesButton.addEventListener('click', async () => {
            checkUpdatesButton.disabled = true;
            const original = checkUpdatesButton.textContent;
            checkUpdatesButton.textContent = '🔎 Selecionando...';
            try {
                const sel = await window.electronAPI.selectUpdateZip();
                if (sel && !sel.canceled && sel.path) {
                    checkUpdatesButton.textContent = '🔄 Atualizando...';
                    const r = await window.electronAPI.applyUpdateZip(sel.path);
                    if (!r || !r.success) {
                        showError(r && r.error ? r.error : 'Falha ao aplicar atualização');
                        checkUpdatesButton.textContent = '❌ Falha';
                    }
                } else {
                    checkUpdatesButton.textContent = original;
                }
            } catch (e) {
                showError(e.message || 'Erro na atualização');
                checkUpdatesButton.textContent = '❌ Erro';
            } finally {
                setTimeout(() => {
                    checkUpdatesButton.disabled = false;
                    checkUpdatesButton.textContent = original;
                }, 4000);
            }
        });
    }

    const portableUpdateButton = document.getElementById('portable-update-button');
    if (portableUpdateButton && window.electronAPI && window.electronAPI.selectUpdateZip) {
        portableUpdateButton.addEventListener('click', async () => {
            portableUpdateButton.disabled = true;
            const original = portableUpdateButton.textContent;
            portableUpdateButton.textContent = '🔎 Selecionando...';
            try {
                const sel = await window.electronAPI.selectUpdateZip();
                if (sel && !sel.canceled && sel.path) {
                    portableUpdateButton.textContent = '🔄 Atualizando...';
                    const r = await window.electronAPI.applyUpdateZip(sel.path);
                    if (!r || !r.success) {
                        showError(r && r.error ? r.error : 'Falha ao aplicar atualização');
                        portableUpdateButton.textContent = '❌ Falha';
                    }
                } else {
                    portableUpdateButton.textContent = original;
                }
            } catch (e) {
                showError(e.message || 'Erro na atualização');
                portableUpdateButton.textContent = '❌ Erro';
            } finally {
                setTimeout(() => {
                    portableUpdateButton.disabled = false;
                    portableUpdateButton.textContent = original;
                }, 4000);
            }
        });
    }
    
    // Event listeners para configuração de impressoras
    const savePrinterButton = document.getElementById('save-printer-config-button');
    console.log('🔍 Botão de salvar encontrado:', savePrinterButton);
    
    if (savePrinterButton) {
        console.log('✅ Adicionando event listener ao botão de salvar');
        savePrinterButton.addEventListener('click', function(event) {
            console.log('🖱️ Botão de salvar clicado!');
            event.preventDefault();
            savePrinterConfiguration();
        });
    } else {
        console.error('❌ Botão save-printer-config-button não encontrado!');
    }
    
    const testPrintButton = document.getElementById('test-print-button');
    if (testPrintButton) {
        testPrintButton.addEventListener('click', testPrint);
    }
    
    const refreshPrintersButton = document.getElementById('refresh-printers-button');
    if (refreshPrintersButton) {
        refreshPrintersButton.addEventListener('click', async function() {
            this.disabled = true;
            this.textContent = '🔄 Atualizando...';
            await loadPrinterConfiguration();
            this.disabled = false;
            this.textContent = '🔄 Atualizar Lista';
        });
    }

    
    const saveAdminPassBtn = document.getElementById('save-admin-password-button');
    if (saveAdminPassBtn) {
        saveAdminPassBtn.addEventListener('click', () => {
            const input = document.getElementById('admin-password-config-input');
            const v = (input && input.value) ? input.value.trim() : '';
            if (!v || v.length < 4) {
                showError('Defina uma senha com pelo menos 4 dígitos');
                return;
            }
            try {
                localStorage.setItem('admin_password', v);
                if (input) input.value = '';
                showSuccess('Senha administrativa atualizada');
            } catch (_) {
                showError('Falha ao salvar senha');
            }
        });
    }
}

// Função para mostrar seção específica (CORRIGIDA)
function showSection(sectionName) {
    console.log('Mostrando seção:', sectionName); // Debug
    
    // Ocultar todas as seções
    document.querySelectorAll('.config-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Mostrar seção selecionada
    const targetSection = document.getElementById(sectionName + '-section');
    console.log('Seção encontrada:', targetSection); // Debug
    
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        console.log('Seção ativada:', sectionName); // Debug
        
        if (sectionName === 'images') {
            loadImageConfig();
        } else if (sectionName === 'thumbnails') {
            loadThumbnailConfig();
        } else if (sectionName === 'dashboard') {
            loadPrintStatsDashboard();
        }
    } else {
        console.error('Seção não encontrada:', sectionName + '-section');
    }
    
    // Marcar item do menu como ativo
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const menuItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (menuItem) {
        menuItem.classList.add('active');
    }
}

async function loadPrintStatsDashboard() {
    try {
        const datesResp = await fetch('/api/print-stats/dates');
        const datesData = datesResp.ok ? await datesResp.json() : { dates: [] };
        const sel = document.getElementById('print-stats-date');
        if (sel) {
            sel.innerHTML = '';
            const dates = Array.isArray(datesData.dates) ? datesData.dates : [];
            dates.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                sel.appendChild(opt);
            });
            sel.onchange = async () => {
                const d = sel.value;
                const r = await fetch(`/api/print-stats?date=${encodeURIComponent(d)}`);
                const j = r.ok ? await r.json() : { totals: {} };
                renderPrintStatsResult(d, j.totals || {});
            };
            if (dates.length) {
                sel.value = dates[0];
                const r = await fetch(`/api/print-stats?date=${encodeURIComponent(dates[0])}`);
                const j = r.ok ? await r.json() : { totals: {} };
                renderPrintStatsResult(dates[0], j.totals || {});
            } else {
                renderPrintStatsResult('', {});
            }
        }
    } catch (_) {
        renderPrintStatsResult('', {});
    }
}

function renderPrintStatsResult(date, totals) {
    const cont = document.getElementById('print-stats-result');
    if (!cont) return;
    const keys = Object.keys(totals || {});
    if (!date || !keys.length) {
        cont.textContent = 'Sem dados disponíveis';
        return;
    }
    cont.innerHTML = '';
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    keys.sort().forEach(k => {
        const li = document.createElement('li');
        li.textContent = `${totals[k]} vezes ${k}`;
        ul.appendChild(li);
    });
    cont.appendChild(ul);
}

// Funções do Electron
async function restartApp() {
    if (window.electronAPI && window.electronAPI.restartApp) {
        if (confirm('Deseja realmente reiniciar a aplicação?')) {
            try {
                await window.electronAPI.restartApp();
            } catch (error) {
                console.error('Erro ao reiniciar:', error);
                showError('Erro ao reiniciar a aplicação.');
            }
        }
    } else {
        showError('Funcionalidade disponível apenas no Electron');
    }
}

async function showUserDataPath() {
    if (window.electronAPI && window.electronAPI.showUserDataPath) {
        try {
            const path = await window.electronAPI.showUserDataPath();
            alert(`Pasta de dados: ${path}`);
        } catch (error) {
            console.error('Erro ao mostrar pasta:', error);
            showError('Erro ao abrir pasta de dados.');
        }
    } else {
        showError('Funcionalidade disponível apenas no Electron');
    }
}

async function toggleDevTools() {
    if (window.electronAPI && window.electronAPI.toggleDevTools) {
        try {
            await window.electronAPI.toggleDevTools();
        } catch (error) {
            console.error('Erro ao abrir Dev Tools:', error);
        }
    } else {
        showError('Dev Tools - Funcionalidade disponível apenas em desenvolvimento');
    }
}

async function closeApp() {
    if (window.electronAPI && window.electronAPI.quitApp) {
        if (confirm('Deseja realmente fechar a aplicação?')) {
            try {
                await window.electronAPI.quitApp();
            } catch (error) {
                console.error('Erro ao fechar:', error);
                showError('Erro ao fechar a aplicação.');
            }
        }
    } else {
        showError('Funcionalidade disponível apenas no Electron');
    }
}

async function selectImagePath() {
    if (window.electronAPI && window.electronAPI.selectDirectory) {
        try {
            const selectedPath = await window.electronAPI.selectDirectory();
            if (selectedPath) {
                document.getElementById('image-path').value = selectedPath;
                showSuccess('Pasta selecionada: ' + selectedPath);
            }
        } catch (error) {
            console.error('Erro ao selecionar pasta:', error);
            showError('Erro ao selecionar pasta.');
        }
    } else {
        showError('Seleção de pasta disponível apenas no Electron');
    }
}

// Carregar versão atual
async function loadCurrentVersion() {
    if (window.electronAPI && window.electronAPI.getAppVersion) {
        try {
            const version = await window.electronAPI.getAppVersion();
            const versionElement = document.getElementById('current-version');
            if (versionElement) {
                versionElement.textContent = version;
            }
        } catch (error) {
            const versionElement = document.getElementById('current-version');
            if (versionElement) {
                versionElement.textContent = 'Erro ao carregar';
            }
        }
    } else {
        const versionElement = document.getElementById('current-version');
        if (versionElement) {
            versionElement.textContent = '1.0.0 (Web)';
        }
    }
}

// Verificar atualizações
async function checkForUpdates() {
    if (window.electronAPI && window.electronAPI.checkForUpdates) {
        const button = document.getElementById('check-updates-button');
        if (button) {
            button.disabled = true;
            button.textContent = '🔄 Verificando...';
            
            try {
                await window.electronAPI.checkForUpdates();
                showSuccess('Verificação de atualizações iniciada!');
            } catch (error) {
                console.error('Erro ao verificar atualizações:', error);
                showError('Erro ao verificar atualizações.');
            } finally {
                button.disabled = false;
                button.textContent = '🔍 Verificar Atualizações';
            }
        }
    } else {
        showError('Verificação de atualizações disponível apenas no Electron');
    }
}

// Carregar configurações atuais
async function loadCurrentSettings() {
    try {
        const response = await fetch('/api/config/current');
        if (response.ok) {
            const config = await response.json();
            if (config.image_path) {
                const imagePathInput = document.getElementById('image-path');
                if (imagePathInput) {
                    imagePathInput.value = config.image_path;
                }
            }
            
            // Carregar configuração de formato de data
            if (config.date_format && config.date_format.folder_format) {
                const formatRadio = document.getElementById(`format-${config.date_format.folder_format.toLowerCase()}`);
                if (formatRadio) {
                    formatRadio.checked = true;
                }
            }
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

async function loadThumbnailConfig() {
    try {
        let r = await fetch('/api/ui/thumbnail-size');
        if (!r.ok) r = await fetch('/api/ui/thumbnail-size/');
        if (!r.ok) {
            const origin = window.location.origin || 'http://localhost:5000';
            r = await fetch(origin + '/api/ui/thumbnail-size');
        }
        if (r.ok) {
            const d = await r.json();
            const s = parseInt(d.size || 100, 10);
            const input = document.getElementById('thumb-size-input');
            const label = document.getElementById('thumb-size-label');
            if (input) input.value = s;
            if (label) label.textContent = `${s} px`;
            document.documentElement.style.setProperty('--thumb-size', `${s}px`);
            try { localStorage.setItem('thumb_size', String(s)); } catch (_) {}
        } else {
            let s = 100;
            try { s = parseInt(localStorage.getItem('thumb_size') || '100', 10); } catch (_) {}
            const input = document.getElementById('thumb-size-input');
            const label = document.getElementById('thumb-size-label');
            if (input) input.value = s;
            if (label) label.textContent = `${s} px`;
            document.documentElement.style.setProperty('--thumb-size', `${s}px`);
        }
    } catch (e) {}
}

// Salvar configurações de imagem (CORRIGIDO)
async function saveImageConfig() {
    const imagePath = document.getElementById('image-path').value.trim();
    
    if (!imagePath) {
        showError('Por favor, informe o caminho da pasta de imagens.');
        return;
    }
    
    const button = document.getElementById('save-button');
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = '💾 Salvando...';
    
    try {
        // Tentar múltiplas rotas para compatibilidade
        let response;
        
        // Primeira tentativa: rota original
        try {
            response = await fetch('/api/image-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image_path: imagePath
                })
            });
        } catch (error) {
            console.log('Tentativa 1 falhou, tentando rota alternativa...');
            
            // Segunda tentativa: rota alternativa
            response = await fetch('/api/config/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image_path: imagePath
                })
            });
        }
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Configurações salvas com sucesso!');
        } else {
            showError(result.message || 'Erro ao salvar configurações.');
        }
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showError('Erro ao comunicar com o servidor. Verifique se o servidor está rodando.');
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

// Dashboard e relatórios de vendas removidos

// Carregar configuração de impressoras
async function loadPrinterConfiguration() {
    try {
        // Carrega impressoras disponíveis
        const printersResponse = await fetch('/api/printers');
        if (printersResponse.ok) {
            const printers = await printersResponse.json();
            console.log('Impressoras carregadas:', printers);
            
            // Aguarda um pouco para garantir que os elementos estejam no DOM
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Popula todos os seletores de impressora
            const printerSelects = document.querySelectorAll('.printer-select');
            
            printerSelects.forEach(select => {
                select.innerHTML = '<option value="">Selecione uma impressora</option>';
                
                if (printers && printers.length > 0) {
                    printers.forEach(printer => {
                        const option = document.createElement('option');
                        option.value = printer.name;
                        option.textContent = `${printer.name} (${printer.status || 'Desconhecido'})`;
                        select.appendChild(option);
                    });
                } else {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'Nenhuma impressora encontrada';
                    select.appendChild(option);
                }
                
                // Adiciona listener para atualizar status
                select.addEventListener('change', function() {
                    const format = this.id.replace('printer-', '');
                    if (this.value) {
                        updateFormatStatus(format, this.value);
                    } else {
                        updateFormatStatus(format, '');
                    }
                    updateConfigSummary();
                });
            });
            

        } else {
            console.error('Erro ao carregar impressoras:', printersResponse.status);
        }
        
        // Carrega configuração atual
        const configResponse = await fetch('/api/printer-config');
        if (configResponse.ok) {
            const config = await configResponse.json();
            
            // Configura impressoras por formato
            const formats = ['10x15', '15x20', 'bolas'];
            formats.forEach(format => {
                const printerSelect = document.getElementById(`printer-${format}`);
                if (config.format_mappings && config.format_mappings[format]) {
                    const mapping = config.format_mappings[format];
                    
                    if (mapping.printer && printerSelect) {
                        printerSelect.value = mapping.printer;
                        updateFormatStatus(format, mapping.printer);
                    }
                }
            });
            
            // Atualizar resumo da configuração após carregar
            setTimeout(() => {
                updateConfigSummary();
            }, 1000);
        }
    } catch (error) {
        console.error('Erro ao carregar configuração de impressoras:', error);
        showError('Erro ao carregar configuração de impressoras.');
    }
}







// Função para atualizar o status visual de um formato
function updateFormatStatus(format, printerName) {
    const statusElement = document.getElementById(`status-${format}`);
    if (!statusElement) return;
    
    const indicator = statusElement.querySelector('div');
    const text = statusElement.querySelector('span');
    
    if (!indicator || !text) return;
    
    if (printerName) {
        // Impressora configurada
        indicator.style.backgroundColor = '#28a745'; // Verde
        text.textContent = 'Configurado';
        text.style.color = '#28a745';
    } else {
        // Não configurado
        indicator.style.backgroundColor = '#6c757d'; // Cinza
        text.textContent = 'Não configurado';
        text.style.color = '#6c757d';
    }
}

function updateConfigSummary() {
    const summaryDiv = document.getElementById('config-summary-content');
    const formats = ['10x15', '15x20', 'bolas'];
    const formatNames = {
        '10x15': '10x15 cm',
        '15x20': '15x20 cm',
        'bolas': 'Bolas'
    };
    
    let summaryHTML = '';
    let configuredCount = 0;
    
    // Seção de configurações atuais na interface
    summaryHTML += `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 15px; border-left: 4px solid #007bff;">
            <h5 style="margin: 0 0 10px 0; color: #007bff;">🖥️ Configurações Atuais na Interface</h5>
    `;
    
    formats.forEach(format => {
        const printerSelect = document.getElementById(`printer-${format}`);
        
        if (printerSelect && printerSelect.value) {
            configuredCount++;
            summaryHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #dee2e6;">
                    <div><strong>${formatNames[format]}</strong></div>
                    <div style="text-align: right; font-size: 0.9em;">
                        <div>${printerSelect.value}</div>
                    </div>
                </div>
            `;
        } else {
            summaryHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #dee2e6;">
                    <div><strong>${formatNames[format]}</strong></div>
                    <div style="text-align: right; font-size: 0.9em; color: #dc3545;">❌ Não configurado</div>
                </div>
            `;
        }
    });
    
    summaryHTML += `</div>`;
    
    // Seção de configurações salvas no sistema
    summaryHTML += `
        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin-bottom: 15px; border-left: 4px solid #28a745;">
            <h5 style="margin: 0 0 10px 0; color: #28a745;">💾 Configurações Salvas no Sistema</h5>
            <div id="saved-config-status">🔄 Carregando...</div>
        </div>
    `;
    
    // Seção de status da persistência
    summaryHTML += `
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 15px; border-left: 4px solid #ffc107;">
            <h5 style="margin: 0 0 10px 0; color: #856404;">🔄 Status da Persistência</h5>
            <div id="persistence-status">
                <div>📡 Endpoint: /api/printer-config</div>
                <div>🕐 Última tentativa de salvamento: <span id="last-save-attempt">Nunca</span></div>
                <div>✅ Último salvamento bem-sucedido: <span id="last-save-success">Nunca</span></div>
                <div>❌ Último erro: <span id="last-save-error">Nenhum</span></div>
            </div>
        </div>
    `;
    
    if (configuredCount === 0) {
        summaryHTML = `
            <div style="text-align: center; padding: 20px; color: #6c757d;">
                <p>Configure as impressoras para cada formato para ver o resumo aqui.</p>
            </div>
        ` + summaryHTML;
    }
    
    summaryDiv.innerHTML = summaryHTML;
    
    // Carregar e exibir configurações salvas
    loadSavedConfigStatus();
}

// Nova função para carregar status das configurações salvas
async function loadSavedConfigStatus() {
    const savedConfigDiv = document.getElementById('saved-config-status');
    
    if (!savedConfigDiv) {
        console.log('⚠️ Elemento saved-config-status não encontrado');
        return;
    }
    
    try {
        console.log('🔄 Carregando configurações salvas do servidor...');
        
        const response = await fetch('/api/printer-config');
        console.log('📡 Resposta do servidor para GET:', response.status, response.statusText);
        
        if (response.ok) {
            const savedConfig = await response.json();
            console.log('📋 Configurações carregadas:', savedConfig);
            
            let savedHTML = '';
            
            if (savedConfig.format_mappings && Object.keys(savedConfig.format_mappings).length > 0) {
                const formatNames = {
                    '10x15': '10x15 cm',
                    '15x20': '15x20 cm',
                    'bolas': 'Bolas'
                };
                
                Object.keys(savedConfig.format_mappings).forEach(format => {
                    const config = savedConfig.format_mappings[format];
                    savedHTML += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #c3e6cb;">
                            <div><strong>${formatNames[format] || format}</strong></div>
                            <div style="text-align: right; font-size: 0.9em;">
                                <div>${config.printer}</div>
                            </div>
                        </div>
                    `;
                });
                
                if (savedConfig.user_preferences && savedConfig.user_preferences.last_session_date) {
                    const lastSave = new Date(savedConfig.user_preferences.last_session_date);
                    savedHTML += `
                        <div style="margin-top: 10px; font-size: 0.8em; color: #6c757d; text-align: center;">
                            📅 Última atualização: ${lastSave.toLocaleString('pt-BR')}
                        </div>
                    `;
                }
            } else {
                savedHTML = '<div style="color: #dc3545; text-align: center;">❌ Nenhuma configuração salva encontrada</div>';
            }
            
            savedConfigDiv.innerHTML = savedHTML;
            
        } else {
            savedConfigDiv.innerHTML = '<div style="color: #dc3545; text-align: center;">❌ Erro ao carregar configurações salvas</div>';
        }
    } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
        savedConfigDiv.innerHTML = `<div style="color: #dc3545; text-align: center;">❌ Erro de conexão: ${error.message}</div>`;
    }
}

async function savePrinterConfiguration() {
    console.log('🚀 FUNÇÃO savePrinterConfiguration CHAMADA!'); // Debug principal
    
    const button = document.getElementById('save-printer-config-button');
    if (!button) {
        console.error('❌ Botão não encontrado na função savePrinterConfiguration!');
        return;
    }
    
    const originalText = button.textContent;
    
    console.log('🔄 Iniciando salvamento das configurações...');
    
    // Feedback visual imediato
    button.disabled = true;
    button.textContent = '💾 Salvando...';
    button.style.background = '#ffc107';
    
    // Limpar mensagens anteriores
    const successElement = document.getElementById('success-message');
    const errorElement = document.getElementById('error-message');
    if (successElement) successElement.style.display = 'none';
    if (errorElement) errorElement.style.display = 'none';
    
    try {
        const formats = ['10x15', '15x20', 'bolas'];
        const formatMappings = {};
        const availablePrinters = {};
        let hasValidConfig = false;
        let defaultPrinter = 'FUJIFILM ASK-300';
        
        console.log('📋 Coletando configurações das impressoras...');
        
        // Validar e coletar configurações de cada formato
        for (const format of formats) {
            const printerSelect = document.getElementById(`printer-${format}`);
            
            console.log(`🔍 Verificando formato ${format}:`, {
                printer: printerSelect?.value
            });
            
            if (printerSelect && printerSelect.value) {
                const javaClassMap = {
                    '10x15': 'ImprimirFoto10x15ASK300',
                    '15x20': 'ImprimirFoto15x20ASK300',
                    'bolas': 'ImprimirFotoBolasASK300'
                };
                
                formatMappings[format] = {
                    printer: printerSelect.value,
                    java_class: javaClassMap[format] || `ImprimirFoto${format}ASK300`
                };
                
                // Definir impressora padrão
                if (!hasValidConfig) {
                    defaultPrinter = printerSelect.value;
                }
                
                // Adicionar impressora à lista de impressoras disponíveis
                if (!availablePrinters[printerSelect.value]) {
                    availablePrinters[printerSelect.value] = {
                        name: printerSelect.value,
                        devmode_path: `spool_devmodes/${printerSelect.value.replace(/[^a-zA-Z0-9]/g, '_')}_devmode.bin`,
                        status: 'online'
                    };
                }
                
                hasValidConfig = true;
                console.log(`✅ Formato ${format} configurado:`, formatMappings[format]);
            } else {
                console.log(`⚠️ Formato ${format} não configurado`);
            }
        }
        
        if (!hasValidConfig) {
            throw new Error('Por favor, configure pelo menos um formato com impressora.');
        }
        
        // Configuração completa seguindo a estrutura correta
        const config = {
            last_used_printer: defaultPrinter,
            user_preferences: {
                default_printer: defaultPrinter,
                default_format: '10x15',
                auto_print_copies: 1,
                last_session_date: new Date().toISOString()
            },
            format_mappings: formatMappings,
            available_printers: availablePrinters,
            default_settings: {
                orientation: 'landscape',
                margins: 0,
                scale: 'fit',
                quality: 'high'
            }
        };
        // Compatibilidade: fornecer também "formats" apenas com impressora
        config.formats = {};
        Object.keys(formatMappings).forEach(k => {
            const m = formatMappings[k];
            config.formats[k] = { printer: m.printer };
        });
        
        console.log('📤 Enviando configuração para o servidor:', config);
        
        // Fazer a requisição para salvar
        const response = await fetch('/api/printer-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        
        console.log('📡 Resposta do servidor:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Configuração salva com sucesso:', result);
            
            // Feedback de sucesso
            button.style.background = '#28a745';
            button.textContent = '✅ Salvo!';
            
            // Mostrar mensagem de sucesso
            showSuccess(`🎉 Configurações salvas com sucesso! ${Object.keys(formatMappings).length} formato(s) configurado(s).`);
            
            // Atualizar o resumo para mostrar as novas configurações
            setTimeout(() => {
                updateConfigSummary();
                loadSavedConfigStatus();
            }, 500);
            
            // Configurações atualizadas com sucesso
            
            // Atualizar ConfigManager se disponível
            if (window.configManager) {
                window.configManager.config = config;
                console.log('🔄 ConfigManager atualizado com nova configuração');
            }
            
            // Disparar evento para atualizar resumo da impressora
            window.dispatchEvent(new CustomEvent('printerConfigChanged', {
                detail: { config: config }
            }));
            
            console.log('📡 Evento printerConfigChanged disparado');
            
        } else {
            let errorMessage;
            try {
                const result = await response.json();
                errorMessage = result.error || result.message || 'Erro desconhecido';
            } catch (e) {
                errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar configuração:', error);
        
        // Feedback de erro
        button.style.background = '#dc3545';
        button.textContent = '❌ Erro!';
        
        // Mostrar mensagem de erro
        showError(`💥 Erro ao salvar: ${error.message}`);
        
    } finally {
        // Restaurar botão após 3 segundos
        setTimeout(() => {
            button.disabled = false;
            button.textContent = originalText;
            button.style.background = '';
        }, 3000);
    }
}

async function testPrint() {
    const button = document.getElementById('test-print-button');
    button.disabled = true;
    button.textContent = '🖨️ Testando...';
    
    try {
        const response = await fetch('/api/test-print', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                test_type: 'configuration_test'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Teste de impressão enviado com sucesso!');
        } else {
            showError(result.error || 'Erro no teste de impressão.');
        }
    } catch (error) {
        console.error('Erro no teste de impressão:', error);
        showError('Erro ao comunicar com o servidor.');
    } finally {
        button.disabled = false;
        button.textContent = '🖨️ Teste de Impressão';
    }
}

// Funções de mensagens (corrigidas)
function showSuccess(message) {
    console.log('✅ Mostrando mensagem de sucesso:', message);
    
    // Tentar usar o elemento existente
    let successElement = document.getElementById('success-message');
    
    if (!successElement) {
        console.log('⚠️ Elemento success-message não encontrado, criando um novo');
        // Criar elemento se não existir
        successElement = document.createElement('div');
        successElement.id = 'success-message';
        successElement.className = 'success-message';
        
        // Inserir no topo da página de configuração
        const configContainer = document.querySelector('.config-container') || document.body;
        configContainer.insertBefore(successElement, configContainer.firstChild);
    }
    
    // Aplicar estilos e conteúdo
    successElement.innerHTML = `<strong>✅ ${message}</strong>`;
    successElement.style.display = 'block';
    successElement.style.opacity = '1';
    successElement.style.background = '#d4edda';
    successElement.style.color = '#155724';
    successElement.style.border = '1px solid #c3e6cb';
    successElement.style.padding = '15px';
    successElement.style.borderRadius = '5px';
    successElement.style.margin = '10px 0';
    successElement.style.fontSize = '14px';
    successElement.style.fontWeight = 'bold';
    successElement.style.textAlign = 'center';
    successElement.style.transition = 'opacity 0.3s ease';
    
    // Scroll para a mensagem
    successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide após 5 segundos
    setTimeout(() => {
        if (successElement && successElement.style.display !== 'none') {
            successElement.style.opacity = '0';
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 300);
        }
    }, 5000);
}

function showError(message) {
    console.log('❌ Mostrando mensagem de erro:', message);
    
    // Tentar usar o elemento existente
    let errorElement = document.getElementById('error-message');
    
    if (!errorElement) {
        console.log('⚠️ Elemento error-message não encontrado, criando um novo');
        // Criar elemento se não existir
        errorElement = document.createElement('div');
        errorElement.id = 'error-message';
        errorElement.className = 'error-message';
        
        // Inserir no topo da página de configuração
        const configContainer = document.querySelector('.config-container') || document.body;
        configContainer.insertBefore(errorElement, configContainer.firstChild);
    }
    
    // Aplicar estilos e conteúdo
    errorElement.innerHTML = `<strong>❌ ${message}</strong>`;
    errorElement.style.display = 'block';
    errorElement.style.opacity = '1';
    errorElement.style.background = '#f8d7da';
    errorElement.style.color = '#721c24';
    errorElement.style.border = '1px solid #f5c6cb';
    errorElement.style.padding = '15px';
    errorElement.style.borderRadius = '5px';
    errorElement.style.margin = '10px 0';
    errorElement.style.fontSize = '14px';
    errorElement.style.fontWeight = 'bold';
    errorElement.style.textAlign = 'center';
    errorElement.style.transition = 'opacity 0.3s ease';
    
    // Scroll para a mensagem
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide após 7 segundos
    setTimeout(() => {
        if (errorElement && errorElement.style.display !== 'none') {
            errorElement.style.opacity = '0';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 300);
        }
    }, 7000);
}

// Adicionar função para seleção de pasta (adicionar no final do arquivo)

// Função para selecionar pasta de imagens (Electron)
async function selectImageFolder() {
    try {
        console.log('Verificando electronAPI:', window.electronAPI);
        console.log('Tipo de window.electronAPI:', typeof window.electronAPI);
        console.log('window.electronAPI?.selectDirectory existe?', window.electronAPI?.selectDirectory !== undefined);
        
        // Verificação mais flexível para detectar o electronAPI
        if (window.electronAPI && typeof window.electronAPI.selectDirectory === 'function') {
            const result = await window.electronAPI.selectDirectory();
            if (result && !result.canceled && result.filePaths.length > 0) {
                const selectedPath = result.filePaths[0];
                // Atualizar a interface para mostrar a nova pasta selecionada
                document.getElementById('current-image-path').textContent = selectedPath;
                document.getElementById('folder-status').textContent = 'Nova pasta selecionada - clique em "Salvar Configuração" para aplicar';
                document.getElementById('folder-status').className = 'folder-status warning';
                
                // Mostrar o botão de salvar
                const saveButton = document.getElementById('save-image-config-button');
                if (saveButton) {
                    saveButton.style.display = 'inline-block';
                    saveButton.setAttribute('data-folder-path', selectedPath);
                }
            }
        } else {
            showError('Seleção de pasta disponível apenas no modo desktop');
        }
    } catch (error) {
        console.error('Erro ao selecionar pasta:', error);
        showError('Erro ao selecionar pasta de imagens');
    }
}

// Nova função para salvar configuração de imagem com feedback visual
async function saveImageConfiguration() {
    const saveButton = document.getElementById('save-image-config-button');
    const folderPath = saveButton.getAttribute('data-folder-path');
    
    if (!folderPath) {
        showError('Nenhuma pasta foi selecionada');
        return;
    }
    
    try {
        // Mostrar feedback visual de salvamento
        saveButton.disabled = true;
        saveButton.classList.add('saving');
        saveButton.innerHTML = '💾 Salvando...';
        
        const response = await fetch('/api/select-image-folder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folder_path: folderPath })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Feedback de sucesso
            saveButton.innerHTML = '✅ Salvo!';
            saveButton.classList.remove('saving');
            
            // Atualizar status
            document.getElementById('folder-status').textContent = 'Configuração salva com sucesso!';
            document.getElementById('folder-status').className = 'folder-status success';
            
            showSuccess(`Pasta de imagens configurada: ${result.folder_path}`);
            
            // Recarregar configuração de imagens
            await loadImageConfig();
            
            // Ocultar botão após 2 segundos
            setTimeout(() => {
                saveButton.style.display = 'none';
                saveButton.innerHTML = '💾 Salvar Configuração';
                saveButton.disabled = false;
            }, 2000);
            
        } else {
            // Feedback de erro
            saveButton.innerHTML = '❌ Erro';
            saveButton.classList.remove('saving');
            saveButton.disabled = false;
            
            document.getElementById('folder-status').textContent = result.error || 'Erro ao salvar configuração';
            document.getElementById('folder-status').className = 'folder-status error';
            
            showError(result.error || 'Erro ao salvar configuração de pasta');
            
            // Restaurar botão após 2 segundos
            setTimeout(() => {
                saveButton.innerHTML = '💾 Salvar Configuração';
            }, 2000);
        }
    } catch (error) {
        console.error('Erro ao salvar configuração:', error);
        
        // Feedback de erro de conexão
        saveButton.innerHTML = '❌ Erro de Conexão';
        saveButton.classList.remove('saving');
        saveButton.disabled = false;
        
        document.getElementById('folder-status').textContent = 'Erro de comunicação com o servidor';
        document.getElementById('folder-status').className = 'folder-status error';
        
        showError('Erro ao comunicar com o servidor');
        
        // Restaurar botão após 2 segundos
        setTimeout(() => {
            saveButton.innerHTML = '💾 Salvar Configuração';
        }, 2000);
    }
}

// Função para atualizar pasta de imagens (mantida para compatibilidade)
async function updateImageFolder(folderPath) {
    try {
        const response = await fetch('/api/select-image-folder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folder_path: folderPath })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(`Pasta de imagens atualizada: ${result.folder_path}`);
            // Recarregar configuração de imagens
            await loadImageConfig();
        } else {
            showError(result.error || 'Erro ao atualizar pasta de imagens');
        }
    } catch (error) {
        console.error('Erro ao atualizar pasta:', error);
        showError('Erro ao comunicar com o servidor');
    }
}

// Função para carregar configuração atual de imagens
async function loadImageConfig() {
    try {
        const response = await fetch('/api/current-image-folder');
        const data = await response.json();
        
        const pathElement = document.getElementById('current-image-path');
        const statusElement = document.getElementById('folder-status');
        const foldersElement = document.getElementById('available-folders');
        const saveButton = document.getElementById('save-image-config-button');
        
        if (pathElement) {
            pathElement.textContent = data.current_path || 'Nenhuma pasta configurada';
        }
        
        if (statusElement) {
            if (data.current_path && data.exists) {
                statusElement.textContent = '✅ Pasta configurada e acessível';
                statusElement.className = 'folder-status success';
            } else if (data.current_path && !data.exists) {
                statusElement.textContent = '❌ Pasta configurada mas não encontrada';
                statusElement.className = 'folder-status error';
            } else {
                statusElement.textContent = '⚠️ Nenhuma pasta foi configurada';
                statusElement.className = 'folder-status warning';
            }
        }
        
        if (foldersElement) {
            if (data.available_date_folders && data.available_date_folders.length > 0) {
                const format = data.current_format || 'DDMMYYYY';
                const folderList = data.available_date_folders.map(folder => {
                    let day, month, year;
                    if (format === 'YYYYMMDD') {
                        year = folder.substring(0, 4);
                        month = folder.substring(4, 6);
                        day = folder.substring(6, 8);
                    } else if (format === 'YYMMDD') {
                        year = `20${folder.substring(0, 2)}`;
                        month = folder.substring(2, 4);
                        day = folder.substring(4, 6);
                    } else if (format === 'DDMMYY') {
                        day = folder.substring(0, 2);
                        month = folder.substring(2, 4);
                        year = `20${folder.substring(4, 6)}`;
                    } else {
                        day = folder.substring(0, 2);
                        month = folder.substring(2, 4);
                        year = folder.substring(4, 8);
                    }
                    return `<span class="date-folder">${folder} (${day}/${month}/${year})</span>`;
                }).join(', ');
                foldersElement.innerHTML = `<strong>📅 Pastas de data encontradas:</strong><br>${folderList}`;
            } else if (data.current_path && data.exists) {
                foldersElement.innerHTML = `<em>⚠️ Nenhuma pasta de data encontrada. Crie pastas no formato ${data.current_format || 'DDMMYYYY'}</em>`;
            } else {
                foldersElement.innerHTML = '<em>Selecione uma pasta de imagens para ver as pastas de data disponíveis</em>';
            }
        }
        
        // Ocultar botão de salvar se não há pasta pendente
        if (saveButton && !saveButton.getAttribute('data-folder-path')) {
            saveButton.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Erro ao carregar configuração de imagens:', error);
        const statusElement = document.getElementById('folder-status');
        if (statusElement) {
            statusElement.textContent = 'Erro ao carregar configuração';
            statusElement.className = 'folder-status error';
        }
    }
}



// Inicializar quando a página carregar
// Função para salvar formato de data
async function saveDateFormat() {
    try {
        const selectedFormat = document.querySelector('input[name="date-format"]:checked')?.value;
        
        if (!selectedFormat) {
            showError('Por favor, selecione um formato de data.');
            return;
        }
        
        const response = await fetch('/api/config/date-format', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                folder_format: selectedFormat
            })
        });
        
        if (response.ok) {
            showSuccess(`Formato de data alterado para ${selectedFormat} com sucesso!`);
            // Recarregar as pastas disponíveis com o novo formato
            loadImageConfig();
        } else {
            const error = await response.text();
            showError(`Erro ao salvar formato de data: ${error}`);
        }
    } catch (error) {
        console.error('Erro ao salvar formato de data:', error);
        showError('Erro ao salvar formato de data. Tente novamente.');
    }
}

// Personalização
let personalization = null;


document.addEventListener('DOMContentLoaded', () => {
    loadImageConfig();
    loadPersonalization();
    setupPersonalizationEvents();
    const moveBtn = document.getElementById('move-today-button');
    if (moveBtn) {
        moveBtn.addEventListener('click', async () => {
            const btn = moveBtn;
            const original = btn.textContent;
            btn.disabled = true;
            btn.textContent = '⏳ Movendo...';
            const bar = document.getElementById('move-progress-bar');
            const text = document.getElementById('move-progress-text');
            if (bar) bar.style.width = '0%';
            if (text) text.textContent = '';
            try {
                const resp = await fetch('/api/move-today', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.success) {
                        showSuccess(`Movidos ${data.moved}/${data.total}`);
                    } else {
                        showError('Falha ao mover');
                    }
                } else {
                    showError('Erro ao mover');
                }
            } catch (_) {
                showError('Erro ao mover');
            } finally {
                btn.disabled = false;
                btn.textContent = original;
            }
        });
    }

    initMoverConfigUI();
    loadMoverConfig();
    try {
        const es = window.eventSource || (window.__configEventSource || (window.__configEventSource = new EventSource('/api/events')));
        es.addEventListener('move-progress', function(event) {
            try {
                const data = JSON.parse(event.data);
                const bar = document.getElementById('move-progress-bar');
                const text = document.getElementById('move-progress-text');
                if (bar) bar.style.width = `${data.pct || 0}%`;
                if (text) text.textContent = `Movidos ${data.moved}/${data.total} (${data.pct || 0}%)`;
            } catch (e) {}
        });
    } catch (e) {}
    const whasEnabledEl = document.getElementById('whas-enabled');
    const whasPathEl = document.getElementById('whas-csv-path');
    const whasPickBtn = document.getElementById('pick-whas-csv');
    const whasSaveBtn = document.getElementById('save-whas-config');
    if (whasEnabledEl) {
        try { whasEnabledEl.checked = (localStorage.getItem('whas_enabled') === 'true'); } catch(_) {}
        whasEnabledEl.addEventListener('change', () => {
            try { localStorage.setItem('whas_enabled', whasEnabledEl.checked ? 'true' : 'false'); showSuccess(whasEnabledEl.checked ? 'WhatsApp habilitado' : 'WhatsApp desabilitado'); } catch(_) {}
        });
    }
    if (whasPathEl) {
        try { whasPathEl.value = localStorage.getItem('whas_csv_dir') || ''; } catch(_) {}
    }
    if (whasPickBtn) {
        whasPickBtn.addEventListener('click', async () => {
            try {
                if (window.electronAPI && window.electronAPI.selectDirectory) {
                    const r = await window.electronAPI.selectDirectory();
                    if (r && !r.canceled && r.filePaths && r.filePaths[0]) {
                        whasPathEl.value = r.filePaths[0];
                    }
                } else {
                    showError('Seleção de pasta disponível apenas no Electron');
                }
            } catch (_) { showError('Falha ao selecionar pasta'); }
        });
    }
    if (whasSaveBtn) {
        whasSaveBtn.addEventListener('click', () => {
            const p = (whasPathEl && whasPathEl.value) ? whasPathEl.value.trim() : '';
            if (!p) { showError('Informe a pasta do CSV'); return; }
            try { localStorage.setItem('whas_csv_dir', p); showSuccess('Configuração de WhatsApp salva'); } catch(_) { showError('Falha ao salvar configuração'); }
        });
    }

    const updatesBaseUrlEl = document.getElementById('updates-base-url');
    const saveUpdatesBtn = document.getElementById('save-updates-config');
    const updateProgramBtn = document.getElementById('update-program-button');
    if (updatesBaseUrlEl) {
        fetch('/api/updates/config').then(r => r.json()).then(cfg => {
            updatesBaseUrlEl.value = (cfg && cfg.base_url) ? cfg.base_url : '';
        }).catch(() => {});
    }
    if (saveUpdatesBtn) {
        saveUpdatesBtn.addEventListener('click', async () => {
            const url = (updatesBaseUrlEl && updatesBaseUrlEl.value) ? updatesBaseUrlEl.value.trim() : '';
            if (!url) { showError('Informe a URL de updates'); return; }
            try {
                const resp = await fetch('/api/updates/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base_url: url }) });
                if (resp.ok) {
                    const j = await resp.json();
                    if (j && j.success) showSuccess('Origem de updates salva'); else showError('Falha ao salvar updates');
                } else {
                    showError('Erro ao salvar updates');
                }
            } catch (_) { showError('Erro ao salvar updates'); }
        });
    }
    if (updateProgramBtn) {
        updateProgramBtn.addEventListener('click', async () => {
            try {
                updateProgramBtn.disabled = true;
                const original = updateProgramBtn.textContent;
                updateProgramBtn.textContent = '⬇️ Atualizando...';
                const resp = await fetch('/api/updates/apply', { method: 'POST' });
                if (resp.ok) {
                    const j = await resp.json();
                    if (j && j.success) {
                        const okCount = (j.applied || []).length;
                        const failCount = (j.failed || []).length;
                        showSuccess(`Atualização aplicada: ${okCount} arquivos${failCount ? `, ${failCount} falhas` : ''}`);
                    } else {
                        showError('Falha ao aplicar atualização');
                    }
                } else {
                    showError('Erro ao aplicar atualização');
                }
                setTimeout(() => { updateProgramBtn.disabled = false; updateProgramBtn.textContent = original; }, 2000);
            } catch (_) { showError('Erro ao aplicar atualização'); updateProgramBtn.disabled = false; }
        });
    }
});

function initMoverConfigUI() {
    const pickSrc = document.getElementById('pick-move-src');
    const pickDst = document.getElementById('pick-move-dst');
    const saveBtn = document.getElementById('save-mover-config');
    if (pickSrc) {
        pickSrc.addEventListener('click', async () => {
            try {
                if (window.electronAPI?.selectDirectory) {
                    const res = await window.electronAPI.selectDirectory();
                    if (res && !res.canceled && res.filePaths?.length) {
                        document.getElementById('move-src').value = res.filePaths[0];
                    }
                } else {
                    showError('Seleção de pasta disponível apenas no modo desktop');
                }
            } catch (e) { showError('Erro ao selecionar origem'); }
        });
    }
    if (pickDst) {
        pickDst.addEventListener('click', async () => {
            try {
                if (window.electronAPI?.selectDirectory) {
                    const res = await window.electronAPI.selectDirectory();
                    if (res && !res.canceled && res.filePaths?.length) {
                        document.getElementById('move-dst').value = res.filePaths[0];
                    }
                } else {
                    showError('Seleção de pasta disponível apenas no modo desktop');
                }
            } catch (e) { showError('Erro ao selecionar destino'); }
        });
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const src = document.getElementById('move-src')?.value || '';
            const dst = document.getElementById('move-dst')?.value || '';
            try {
                const resp = await fetch('/api/mover-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ src, dst }) });
                if (resp.ok) {
                    showSuccess('Configuração de movimento salva');
                } else {
                    showError('Falha ao salvar configuração');
                }
            } catch (_) { showError('Erro ao salvar configuração'); }
        });
    }
}

async function loadMoverConfig() {
    try {
        const resp = await fetch('/api/mover-config');
        if (!resp.ok) return;
        const cfg = await resp.json();
        const srcEl = document.getElementById('move-src');
        const dstEl = document.getElementById('move-dst');
        if (srcEl && cfg.src) srcEl.value = cfg.src;
        if (dstEl && cfg.dst) dstEl.value = cfg.dst;
    } catch (_) {}
}

async function loadPersonalization() {
    try {
        const r = await fetch('/api/personalization');
        if (!r.ok) return;
        personalization = await r.json();
        const txt = document.getElementById('personal-text');
        const bg = document.getElementById('personal-bg-color');
        const tc = document.getElementById('personal-text-color');
        const ac = document.getElementById('personal-accent-color');
                const fs = document.getElementById('personal-font-size');
                const hh = document.getElementById('personal-header-height');
                const sw = document.getElementById('personal-sidebar-width');
                const tr = document.getElementById('personal-thumb-radius');
                const tg = document.getElementById('personal-thumb-gap');
                const snow = document.getElementById('personal-snow');
                const ltxt = document.getElementById('personal-logo-text');
                const lurl = document.getElementById('personal-logo-url');
                const dv = document.getElementById('personal-default-variant');
                const mw = document.getElementById('personal-main-width');
                const mh = document.getElementById('personal-main-height');
                const sbg = document.getElementById('personal-sidebar-bg');
                const bbg = document.getElementById('personal-body-bg');
                const vig = document.getElementById('personal-vignette');
                const vin = document.getElementById('personal-vignette-intensity');
                const dsh = document.getElementById('personal-disable-shadow');
                const glow = document.getElementById('personal-glow');
                const sth = document.getElementById('personal-sidebar-thumb-height');
                const clearBg = document.getElementById('personal-clear-bg');
        if (txt) txt.value = personalization.header_text || '';
        if (bg) bg.value = personalization.header_bg_color || '#2c3e50';
        if (tc) tc.value = personalization.header_text_color || '#ffffff';
        if (ac) ac.value = personalization.accent_color || '#3498db';
        if (fs) fs.value = parseInt(personalization.header_font_size || 20, 10);
        if (hh) hh.value = parseInt(personalization.header_height || 80, 10);
        if (sw) sw.value = parseInt(personalization.sidebar_width || 260, 10);
        if (tr) tr.value = parseInt(personalization.thumb_border_radius || 5, 10);
        if (tg) tg.value = parseInt(personalization.thumb_gap || 8, 10);
        if (snow) snow.checked = !!personalization.enable_snow_effect;
                if (ltxt) ltxt.value = personalization.logo_text || '';
                if (lurl) lurl.value = personalization.logo_image_url || '';
                if (dv) dv.value = personalization.default_variant || '10x15';
                if (mw) mw.value = parseInt(personalization.main_photo_max_width || 900, 10);
                if (mh) mh.value = parseInt(personalization.main_photo_max_height || 700, 10);
                if (sbg) sbg.value = personalization.sidebar_bg_color || '#1f2a35';
                if (bbg) bbg.value = personalization.body_bg_color || '#10161b';
                if (vig) vig.checked = !!personalization.enable_vignette;
                if (vin) vin.value = parseFloat(personalization.vignette_intensity ?? 0.12);
                if (dsh) dsh.checked = !!personalization.disable_photo_shadow;
                if (glow) glow.checked = !!personalization.enable_glow;
                if (clearBg) clearBg.checked = !!personalization.clear_background_mode;
                if (sth) sth.value = parseInt(personalization.sidebar_thumb_height || 120, 10);
        const preview = document.getElementById('theme-preview');
        if (preview) {
            preview.textContent = personalization.header_text || preview.textContent;
            preview.style.background = personalization.header_bg_color || preview.style.background;
            preview.style.color = personalization.header_text_color || preview.style.color;
            preview.style.borderColor = personalization.accent_color || preview.style.borderColor;
            preview.style.fontSize = `${parseInt(personalization.header_font_size || 20, 10)}px`;
            preview.style.height = `${parseInt(personalization.header_height || 80, 10)}px`;
        }
    } catch {}
}

function setupPersonalizationEvents() {
    const btn = document.getElementById('save-personalization');
    if (btn) {
        btn.addEventListener('click', async () => {
            const payload = {
                header_text: document.getElementById('personal-text')?.value || '',
                header_bg_color: document.getElementById('personal-bg-color')?.value || '#2c3e50',
                header_text_color: document.getElementById('personal-text-color')?.value || '#ffffff',
                accent_color: document.getElementById('personal-accent-color')?.value || '#3498db',
                header_font_size: parseInt(document.getElementById('personal-font-size')?.value || '20', 10),
                header_height: parseInt(document.getElementById('personal-header-height')?.value || '80', 10),
                sidebar_width: parseInt(document.getElementById('personal-sidebar-width')?.value || '260', 10),
                thumb_border_radius: parseInt(document.getElementById('personal-thumb-radius')?.value || '5', 10),
                thumb_gap: parseInt(document.getElementById('personal-thumb-gap')?.value || '8', 10),
                enable_snow_effect: !!document.getElementById('personal-snow')?.checked,
                logo_text: document.getElementById('personal-logo-text')?.value || '',
                logo_image_url: document.getElementById('personal-logo-url')?.value || '',
                default_variant: document.getElementById('personal-default-variant')?.value || '10x15',
                main_photo_max_width: parseInt(document.getElementById('personal-main-width')?.value || '900', 10),
                main_photo_max_height: parseInt(document.getElementById('personal-main-height')?.value || '700', 10),
                sidebar_bg_color: document.getElementById('personal-sidebar-bg')?.value || '#1f2a35',
                body_bg_color: document.getElementById('personal-body-bg')?.value || '#10161b',
                enable_vignette: !!document.getElementById('personal-vignette')?.checked,
                vignette_intensity: parseFloat(document.getElementById('personal-vignette-intensity')?.value || '0.12'),
                disable_photo_shadow: !!document.getElementById('personal-disable-shadow')?.checked,
                enable_glow: !!document.getElementById('personal-glow')?.checked,
                sidebar_thumb_height: parseInt(document.getElementById('personal-sidebar-thumb-height')?.value || '120', 10),
                clear_background_mode: !!document.getElementById('personal-clear-bg')?.checked
            };
            try {
                const resp = await fetch('/api/save-personalization', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (resp.ok) {
                    showSuccess('Personalização salva');
                    personalization = payload;
                    const preview = document.getElementById('theme-preview');
                    if (preview) {
                        preview.textContent = payload.header_text;
                        preview.style.background = payload.header_bg_color;
                        preview.style.color = payload.header_text_color;
                        preview.style.borderColor = payload.accent_color;
                        preview.style.fontSize = `${payload.header_font_size}px`;
                        preview.style.height = `${payload.header_height}px`;
                    }
                } else {
                    showError('Falha ao salvar personalização');
                }
            } catch {
                showError('Erro ao salvar personalização');
            }
        });
    }
}
    const thumbInput = document.getElementById('thumb-size-input');
    const thumbLabel = document.getElementById('thumb-size-label');
    const saveThumb = document.getElementById('save-thumb-size');
    if (thumbInput && thumbLabel) {
        thumbInput.addEventListener('input', () => {
            const v = parseInt(thumbInput.value, 10);
            thumbLabel.textContent = `${v} px`;
            document.documentElement.style.setProperty('--thumb-size', `${v}px`);
        });
    }
    if (saveThumb && thumbInput) {
        saveThumb.addEventListener('click', async () => {
            const v = parseInt(thumbInput.value, 10);
            const reqOpts = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ size: v })
            };
            let ok = false;
            try {
                let resp = await fetch('/api/ui/thumbnail-size', reqOpts);
                if (!resp.ok) {
                    resp = await fetch('/api/ui/thumbnail-size/', reqOpts);
                }
                if (!resp.ok) {
                    const origin = window.location.origin || 'http://localhost:5000';
                    resp = await fetch(origin + '/api/ui/thumbnail-size', reqOpts);
                }
                if (resp.ok) {
                    ok = true;
                    showSuccess(`Tamanho das miniaturas salvo: ${v}px`);
                }
            } catch (e) {}
            if (!ok) {
                try {
                    localStorage.setItem('thumb_size', String(v));
                    document.documentElement.style.setProperty('--thumb-size', `${v}px`);
                    showSuccess(`Tamanho das miniaturas salvo localmente: ${v}px`);
                } catch (_) {
                    showError('Erro ao salvar tamanho (HTTP 404)');
                }
            }
        });
    }
    const resetBtn = document.getElementById('reset-personalization');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            const ok = confirm('Restaurar todas as configurações visuais para o padrão?');
            if (!ok) return;
            try {
                const r = await fetch('/api/reset-personalization', { method: 'POST' });
                if (r.ok) {
                    showSuccess('Configurações restauradas');
                    try {
                        await fetch('/api/ui/thumbnail-size', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ size: 100 }) });
                    } catch (_) {}
                    await loadPersonalization();
                } else {
                    showError('Falha ao restaurar');
                }
            } catch (e) {
                showError('Erro ao restaurar');
            }
        });
    }