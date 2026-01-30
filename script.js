// Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    // ===== MENÚ MÓVIL =====
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
            
            // Cambiar icono
            const icon = this.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Cerrar menú al hacer clic en un enlace
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(event) {
            if (!event.target.closest('nav') && !event.target.closest('.menu-toggle')) {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Cerrar menú con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // ===== NAVEGACIÓN ENTRE SECCIONES =====
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active');
        }
        
        navButtons.forEach(button => {
            if (button.getAttribute('data-section') === sectionId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Scroll suave al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    // Mostrar sección de inicio por defecto
    showSection('inicio');
    
    // ===== FUNCIONALIDAD PARA PDFs - COMPLETAMENTE REESCRITA =====
    const portfolioPdfModal = document.getElementById('portfolioPdfModal');
    const closePortfolioPdfModal = document.getElementById('closePortfolioPdfModal');
    const backToBtn = document.getElementById('backToBtn');
    const openInNewTabBtn = document.getElementById('openInNewTabBtn');
    const portfolioPdfTitle = document.getElementById('portfolioPdfTitle');
    const portfolioPdfContent = document.getElementById('portfolioPdfContent');
    const pdfLoading = document.getElementById('pdfLoading');
    const pdfViewerContainer = document.getElementById('pdfViewerContainer');
    const pdfIframe = document.getElementById('pdfIframe');
    const mobilePdfViewer = document.getElementById('mobilePdfViewer');
    const pdfObject = document.getElementById('pdfObject');
    const pdfDirectLink = document.getElementById('pdfDirectLink');
    const viewPdfButtons = document.querySelectorAll('.view-pdf-btn');
    const pdfPreviews = document.querySelectorAll('.pdf-preview');
    
    const pdfTitles = {
        'cv': 'Curriculum Vitae - David Montero López',
        'bravon': 'Bravon - Plan de Negocio',
        'gumo': 'Gumo - Plan de Atención al Cliente',
        'fitness': 'Proyecto de Investigación: Impacto de las Redes Sociales en la Cultura Fitness'
    };
    
    const pdfReturnPages = {
        'cv': 'curriculum',
        'bravon': 'portfolio',
        'gumo': 'portfolio',
        'fitness': 'portfolio'
    };
    
    const pdfFiles = {
        'cv': 'CV.pdf',
        'bravon': 'Bravon.pdf',
        'gumo': 'Gumo.pdf',
        'fitness': 'Proyecto.pdf'
    };
    
    // Variable para rastrear el PDF actual
    let currentPdfId = null;
    let currentPdfFile = null;
    
    // SOLUCIÓN DEFINITIVA PARA MÓVIL
    function showPortfolioPdf(pdfId) {
        if (pdfTitles[pdfId]) {
            currentPdfId = pdfId;
            currentPdfFile = pdfFiles[pdfId];
            
            portfolioPdfTitle.innerHTML = `<i class="fas fa-file-pdf"></i> ${pdfTitles[pdfId]}`;
            
            const returnPage = pdfReturnPages[pdfId];
            if (returnPage === 'curriculum') {
                backToBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Curriculum';
            } else {
                backToBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Porfolio';
            }
            
            // Mostrar loading
            pdfLoading.classList.add('active');
            pdfViewerContainer.style.display = 'none';
            mobilePdfViewer.style.display = 'none';
            pdfIframe.style.display = 'none';
            
            // Configurar enlace para abrir en nueva pestaña
            if (openInNewTabBtn) {
                openInNewTabBtn.onclick = function() {
                    window.open(currentPdfFile, '_blank');
                };
            }
            
            // Configurar enlace directo para descarga alternativa
            if (pdfDirectLink) {
                pdfDirectLink.href = currentPdfFile;
                pdfDirectLink.textContent = `Descargar ${pdfTitles[pdfId]}`;
            }
            
            // Determinar si es móvil
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // EN MÓVIL: Usar object tag como alternativa mejor
                showPdfForMobile(pdfId);
            } else {
                // EN DESKTOP: Usar iframe normal
                showPdfForDesktop(pdfId);
            }
            
            // Mostrar modal
            portfolioPdfModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Función para mostrar PDF en desktop
    function showPdfForDesktop(pdfId) {
        const pdfFile = pdfFiles[pdfId];
        
        // Limpiar iframe existente
        pdfIframe.src = '';
        
        // Crear URL con parámetros para mejor visualización
        let pdfUrl = pdfFile;
        
        // Añadir parámetros para visualización óptima
        pdfUrl += '#toolbar=0&navpanes=0&scrollbar=1&view=FitH';
        
        // Configurar iframe
        pdfIframe.onload = function() {
            pdfLoading.classList.remove('active');
            pdfViewerContainer.style.display = 'block';
            pdfIframe.style.display = 'block';
            
            // Ajustar altura del iframe después de cargar
            setTimeout(() => {
                try {
                    const iframeDoc = pdfIframe.contentDocument || pdfIframe.contentWindow.document;
                    if (iframeDoc) {
                        const height = iframeDoc.body.scrollHeight;
                        if (height > 0) {
                            pdfIframe.style.height = height + 'px';
                        }
                    }
                } catch (e) {
                    // Ignorar errores de cross-origin
                }
            }, 1000);
        };
        
        pdfIframe.onerror = function() {
            showPdfError(pdfId);
        };
        
        // Cargar el PDF
        pdfIframe.src = pdfUrl;
    }
    
    // Función para mostrar PDF en móvil (SOLUCIÓN MEJORADA)
    function showPdfForMobile(pdfId) {
        const pdfFile = pdfFiles[pdfId];
        
        // Ocultar iframe y mostrar object tag
        pdfIframe.style.display = 'none';
        pdfViewerContainer.style.display = 'none';
        
        // Configurar object tag
        pdfObject.data = pdfFile;
        
        // Mostrar el object tag
        mobilePdfViewer.style.display = 'block';
        pdfLoading.classList.remove('active');
        
        // Si object tag falla, mostrar opción de descarga
        setTimeout(() => {
            try {
                const obj = document.getElementById('pdfObject');
                if (obj && obj.offsetHeight === 0) {
                    // Object tag no cargó, mostrar error
                    showPdfError(pdfId);
                }
            } catch (e) {
                // Ignorar errores
            }
        }, 2000);
    }
    
    // Función para mostrar error de PDF
    function showPdfError(pdfId) {
        pdfLoading.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #d32f2f; margin-bottom: 1.5rem;"></i>
                <h3 style="color: var(--header-color); margin-bottom: 1rem;">Problema al cargar el PDF</h3>
                <p style="margin-bottom: 1rem;">El PDF "${pdfTitles[pdfId]}" no se puede visualizar directamente.</p>
                <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
                    <button class="btn" onclick="window.open('${pdfFiles[pdfId]}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Abrir en nueva pestaña
                    </button>
                    <button class="btn btn-download" onclick="downloadPdf('${pdfId}')">
                        <i class="fas fa-download"></i> Descargar PDF
                    </button>
                    <button class="btn btn-outline" onclick="closePdfModal()">
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                </div>
                <p style="font-size: 0.9rem; color: #666; margin-top: 2rem;">
                    <strong>Solución:</strong> En algunos dispositivos móviles, los PDFs se ven mejor abriéndolos directamente.
                </p>
            </div>
        `;
    }
    
    // Función para descargar PDF específico
    window.downloadPdf = function(pdfId) {
        const pdfFile = pdfFiles[pdfId];
        const link = document.createElement('a');
        link.href = pdfFile;
        link.download = pdfFile;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Función para cerrar el modal
    window.closePdfModal = function() {
        portfolioPdfModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Limpiar iframe y object
        pdfIframe.src = '';
        if (pdfObject) pdfObject.data = '';
        
        // Ocultar viewers
        pdfViewerContainer.style.display = 'none';
        mobilePdfViewer.style.display = 'none';
        pdfLoading.classList.remove('active');
    };
    
    // Event listeners para botones de PDF
    viewPdfButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pdfId = this.getAttribute('data-pdf');
            showPortfolioPdf(pdfId);
        });
    });
    
    pdfPreviews.forEach(preview => {
        preview.addEventListener('click', function() {
            const pdfId = this.getAttribute('data-pdf');
            showPortfolioPdf(pdfId);
        });
    });
    
    // Botón cerrar modal
    if (closePortfolioPdfModal) {
        closePortfolioPdfModal.addEventListener('click', closePdfModal);
    }
    
    // Botón volver
    if (backToBtn) {
        backToBtn.addEventListener('click', function() {
            closePdfModal();
            if (currentPdfId && pdfReturnPages[currentPdfId]) {
                showSection(pdfReturnPages[currentPdfId]);
            }
        });
    }
    
    // Cerrar modal al hacer clic fuera
    portfolioPdfModal.addEventListener('click', function(e) {
        if (e.target === portfolioPdfModal) {
            closePdfModal();
        }
    });
    
    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && portfolioPdfModal.classList.contains('active')) {
            closePdfModal();
        }
    });
    
    // ===== FUNCIONALIDAD PARA DESCARGAR CV =====
    function downloadCV() {
        const pdfFile = 'CV.pdf';
        
        fetch(pdfFile)
            .then(response => {
                if (response.ok) {
                    const link = document.createElement('a');
                    link.href = pdfFile;
                    link.download = 'CV_David_Montero_Lopez.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    showDownloadNotification('CV descargado correctamente', 'success');
                } else {
                    throw new Error('Archivo no encontrado');
                }
            })
            .catch(error => {
                console.error('Error al descargar el CV:', error);
                showDownloadNotification('Error al descargar el CV. Asegúrate de que el archivo CV.pdf está en la carpeta.', 'error');
            });
    }
    
    // Función para mostrar notificación
    function showDownloadNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `download-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 0.8rem;
            z-index: 3000;
            animation: slideIn 0.3s ease-out;
            max-width: 350px;
            border-left: 4px solid ${type === 'success' ? '#28a745' : '#dc3545'};
        `;
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            font-size: 1rem;
            padding: 0.2rem;
            margin-left: auto;
        `;
        
        document.body.appendChild(notification);
        
        // Añadir animaciones CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Botón descargar CV
    const downloadCvBtn = document.getElementById('downloadCvBtn');
    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', downloadCV);
    }
    
    // Añadir botón de descarga en el modal del CV
    const originalShowPortfolioPdf = window.showPortfolioPdf;
    window.showPortfolioPdf = function(pdfId) {
        originalShowPortfolioPdf(pdfId);
        
        if (pdfId === 'cv') {
            setTimeout(() => {
                const modalHeader = document.querySelector('.portfolio-pdf-modal-header');
                if (modalHeader && !document.getElementById('modalDownloadBtn')) {
                    const downloadBtn = document.createElement('button');
                    downloadBtn.id = 'modalDownloadBtn';
                    downloadBtn.className = 'btn btn-success';
                    downloadBtn.style.cssText = 'margin-left: auto; margin-right: 0.5rem; padding: 0.5rem 1rem; font-size: 0.9rem;';
                    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Descargar';
                    downloadBtn.addEventListener('click', downloadCV);
                    
                    const closeBtn = document.getElementById('closePortfolioPdfModal');
                    if (closeBtn && closeBtn.parentNode) {
                        closeBtn.parentNode.insertBefore(downloadBtn, closeBtn);
                    }
                }
            }, 100);
        }
    };
    
    // Verificar archivos PDF
    function checkFiles() {
        console.log('Verificando archivos PDF...');
        Object.entries(pdfFiles).forEach(([id, file]) => {
            fetch(file)
                .then(response => {
                    if (!response.ok) {
                        console.warn(`Archivo no encontrado: ${file}`);
                        console.error(`Asegúrate de que "${file}" está en la misma carpeta.`);
                    } else {
                        console.log(`✓ ${file} encontrado`);
                    }
                })
                .catch(() => {
                    console.warn(`✗ No se puede acceder a: ${file}`);
                });
        });
    }
    
    checkFiles();
    
    // Manejar redimensionamiento de ventana
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Si el modal está abierto y cambiamos de móvil a desktop o viceversa
            if (portfolioPdfModal.classList.contains('active') && currentPdfId) {
                // Recargar el PDF con la configuración adecuada
                showPortfolioPdf(currentPdfId);
            }
        }, 250);
    });
});