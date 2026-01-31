// Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    // ===== CONFIGURACIÓN PDF.js =====
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    
    // Variables globales
    let currentPdfId = null;
    let currentPdf = null;
    
    // ===== DETECTAR SI ESTAMOS EN LOCAL O NETLIFY =====
    const isLocal = window.location.protocol === 'file:';
    const isNetlify = window.location.hostname.includes('netlify') || 
                      window.location.hostname.includes('localhost');
    
    // ===== MENÚ MÓVIL =====
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
            
            const icon = this.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        document.addEventListener('click', function(event) {
            if (!event.target.closest('nav') && !event.target.closest('.menu-toggle')) {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
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
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    showSection('inicio');
    
    // ===== FUNCIONALIDAD PARA PDFs =====
    const portfolioPdfModal = document.getElementById('portfolioPdfModal');
    const closePortfolioPdfModal = document.getElementById('closePortfolioPdfModal');
    const backToBtn = document.getElementById('backToBtn');
    const portfolioPdfTitle = document.getElementById('portfolioPdfTitle');
    const pdfLoading = document.getElementById('pdfLoading');
    const pdfViewer = document.getElementById('pdfViewer');
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
    
    // Función para mostrar error amigable
    function showPdfError(pdfId, pdfFile, error) {
        let errorMessage = '';
        
        if (isLocal) {
            errorMessage = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-laptop-code" style="font-size: 3rem; color: #007acc; margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--header-color); margin-bottom: 1rem; font-size: 1.5rem;">
                        Vista previa local limitada
                    </h3>
                    <p style="margin-bottom: 1.5rem;">
                        Los PDFs solo se pueden ver correctamente cuando el sitio está <strong>publicado en Netlify</strong>.
                    </p>
                    <div style="background: #f0f8ff; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
                        <h4 style="color: #007acc; margin-bottom: 0.8rem;">📤 Para Netlify:</h4>
                        <ol style="text-align: left; margin-left: 1.5rem;">
                            <li>Sube todos los archivos a Netlify</li>
                            <li>Los PDFs funcionarán automáticamente</li>
                            <li>No necesitas configuración especial</li>
                        </ol>
                    </div>
                    <p style="color: #666; font-size: 0.9rem;">
                        <strong>Archivo:</strong> ${pdfFile}<br>
                        Este archivo se cargará correctamente en Netlify.
                    </p>
                </div>
            `;
        } else {
            errorMessage = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #d32f2f; margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--header-color); margin-bottom: 1rem; font-size: 1.5rem;">
                        Error al cargar el PDF
                    </h3>
                    <p style="margin-bottom: 1rem;">
                        No se pudo cargar: <strong>${pdfTitles[pdfId]}</strong>
                    </p>
                    <div style="background: #fff5f5; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
                        <p><strong>Verifica en Netlify:</strong></p>
                        <ol style="text-align: left; margin-left: 1.5rem;">
                            <li>Que el archivo <strong>${pdfFile}</strong> esté en tu repositorio</li>
                            <li>Que el nombre del archivo sea exacto (mayúsculas/minúsculas)</li>
                            <li>Revisa el panel de despliegue de Netlify</li>
                        </ol>
                    </div>
                </div>
            `;
        }
        
        pdfLoading.innerHTML = errorMessage + `
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                <button class="btn" onclick="closePdfModal()" style="background: #6c757d;">
                    <i class="fas fa-times"></i> Cerrar
                </button>
                ${isLocal ? '' : `
                <button class="btn" onclick="window.location.reload()" style="background: var(--accent-color);">
                    <i class="fas fa-redo"></i> Recargar
                </button>
                `}
            </div>
        `;
    }
    
    // Función para cargar PDF
    async function loadPDF(pdfUrl) {
        return new Promise(async (resolve, reject) => {
            try {
                pdfLoading.classList.add('active');
                pdfViewer.classList.remove('active');
                pdfViewer.innerHTML = '';
                
                // Mostrar mensaje si es local
                if (isLocal) {
                    setTimeout(() => {
                        pdfLoading.querySelector('p').textContent = 'En Netlify este PDF se cargará correctamente...';
                    }, 1000);
                    
                    // Simular carga para vista local
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    pdfLoading.innerHTML = `
                        <div style="text-align: center; padding: 2rem;">
                            <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: #00a8ff; margin-bottom: 1rem;"></i>
                            <h3 style="color: var(--header-color); margin-bottom: 1rem; font-size: 1.5rem;">
                                PDF disponible en Netlify
                            </h3>
                            <p style="margin-bottom: 1rem;">
                                Este PDF se visualizará perfectamente una vez subido a Netlify.
                            </p>
                            <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin: 1rem 0; display: inline-block;">
                                <strong>Archivo:</strong> ${pdfUrl}
                            </div>
                            <p style="margin-top: 1.5rem; color: #666;">
                                <i class="fas fa-info-circle"></i> Sube todos los archivos a Netlify para ver los PDFs.
                            </p>
                        </div>
                    `;
                    
                    // Añadir botón de cierre
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'btn';
                    closeBtn.style.marginTop = '1.5rem';
                    closeBtn.style.background = 'var(--accent-color)';
                    closeBtn.innerHTML = '<i class="fas fa-check"></i> Entendido';
                    closeBtn.onclick = closePdfModal;
                    
                    pdfLoading.querySelector('div').appendChild(closeBtn);
                    
                    return;
                }
                
                // Cargar PDF real (solo en Netlify o servidor)
                const loadingTask = pdfjsLib.getDocument({
                    url: pdfUrl,
                    withCredentials: false
                });
                
                currentPdf = await loadingTask.promise;
                
                // Calcular escala responsive
                const containerWidth = pdfViewer.clientWidth - 40;
                const defaultPageWidth = 595;
                const scale = Math.min((containerWidth / defaultPageWidth), 2.5);
                
                // Renderizar todas las páginas
                for (let pageNum = 1; pageNum <= currentPdf.numPages; pageNum++) {
                    const page = await currentPdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: scale });
                    
                    // Contenedor de página
                    const pageContainer = document.createElement('div');
                    pageContainer.className = 'pdf-page';
                    pageContainer.style.width = `${viewport.width}px`;
                    pageContainer.style.height = `${viewport.height}px`;
                    
                    // Canvas
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    
                    // Renderizar
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                    
                    pageContainer.appendChild(canvas);
                    pdfViewer.appendChild(pageContainer);
                    
                    // Actualizar loading para PDFs largos
                    if (currentPdf.numPages > 5) {
                        const progress = Math.round((pageNum / currentPdf.numPages) * 100);
                        pdfLoading.querySelector('p').textContent = 
                            `Cargando página ${pageNum} de ${currentPdf.numPages} (${progress}%)`;
                    }
                }
                
                // Mostrar PDF
                pdfLoading.classList.remove('active');
                pdfViewer.classList.add('active');
                
                resolve();
                
            } catch (error) {
                console.error('Error cargando PDF:', error);
                showPdfError(currentPdfId, pdfUrl, error);
                reject(error);
            }
        });
    }
    
    // Función para mostrar PDF
    function showPortfolioPdf(pdfId) {
        if (pdfTitles[pdfId]) {
            currentPdfId = pdfId;
            
            portfolioPdfTitle.innerHTML = `<i class="fas fa-file-pdf"></i> ${pdfTitles[pdfId]}`;
            
            const returnPage = pdfReturnPages[pdfId];
            if (returnPage === 'curriculum') {
                backToBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Curriculum';
            } else {
                backToBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Porfolio';
            }
            
            const pdfFile = pdfFiles[pdfId];
            
            // Abrir modal
            portfolioPdfModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Cargar PDF
            loadPDF(pdfFile);
            
            // Añadir botón de descarga si es el CV
            if (pdfId === 'cv') {
                addDownloadButtonToModal();
            }
        }
    }
    
    // Botón de descarga en modal
    function addDownloadButtonToModal() {
        const modalHeader = document.querySelector('.portfolio-pdf-modal-header');
        const existingBtn = document.getElementById('modalDownloadBtn');
        if (existingBtn) existingBtn.remove();
        
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'modalDownloadBtn';
        downloadBtn.className = 'btn btn-success';
        downloadBtn.style.cssText = 'margin-left: auto; margin-right: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem;';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Descargar';
        downloadBtn.addEventListener('click', downloadCV);
        
        const closeBtn = document.getElementById('closePortfolioPdfModal');
        if (closeBtn && closeBtn.parentNode) {
            closeBtn.parentNode.insertBefore(downloadBtn, closeBtn);
        }
    }
    
    // Cerrar modal
    window.closePdfModal = function() {
        portfolioPdfModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        pdfViewer.classList.remove('active');
        pdfViewer.innerHTML = '';
        currentPdfId = null;
        currentPdf = null;
        
        const modalDownloadBtn = document.getElementById('modalDownloadBtn');
        if (modalDownloadBtn) modalDownloadBtn.remove();
    };
    
    // Event listeners para botones PDF
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
    
    if (closePortfolioPdfModal) {
        closePortfolioPdfModal.addEventListener('click', closePdfModal);
    }
    
    if (backToBtn) {
        backToBtn.addEventListener('click', function() {
            if (currentPdfId && pdfReturnPages[currentPdfId]) {
                closePdfModal();
                showSection(pdfReturnPages[currentPdfId]);
            } else {
                closePdfModal();
                showSection('portfolio');
            }
        });
    }
    
    portfolioPdfModal.addEventListener('click', function(e) {
        if (e.target === portfolioPdfModal) closePdfModal();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && portfolioPdfModal.classList.contains('active')) {
            closePdfModal();
        }
    });
    
    // Redimensionar
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (portfolioPdfModal.classList.contains('active') && currentPdfId) {
                const pdfFile = pdfFiles[currentPdfId];
                loadPDF(pdfFile);
            }
        }, 250);
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
                    
                    showDownloadNotification('✅ CV descargado correctamente', 'success');
                } else {
                    throw new Error('Archivo no encontrado');
                }
            })
            .catch(error => {
                console.error('Error al descargar el CV:', error);
                showDownloadNotification('❌ Error al descargar el CV', 'error');
            });
    }
    
    // Notificaciones
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
    
    // Botón de descarga en sección CV
    const downloadCvBtn = document.getElementById('downloadCvBtn');
    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', downloadCV);
    }
    
    // Botón de descarga en inicio
    const viewCvBtnInicio = document.querySelector('#inicio .view-pdf-btn[data-pdf="cv"]');
    if (viewCvBtnInicio) {
        const buttonContainer = viewCvBtnInicio.parentNode;
        if (buttonContainer && !buttonContainer.querySelector('#downloadCvBtnInicio')) {
            const downloadBtnInicio = document.createElement('button');
            downloadBtnInicio.id = 'downloadCvBtnInicio';
            downloadBtnInicio.className = 'btn btn-download';
            downloadBtnInicio.innerHTML = '<i class="fas fa-download"></i> Descargar CV';
            downloadBtnInicio.style.marginTop = '1rem';
            downloadBtnInicio.addEventListener('click', downloadCV);
            buttonContainer.appendChild(downloadBtnInicio);
        }
    }
    
    // Mostrar mensaje informativo si es local
    if (isLocal) {
        console.log(`
        🌐 NETLIFY READY - Tu portfolio está listo para Netlify
        
        📁 Archivos necesarios:
        - index.html
        - style.css
        - script.js
        - CV.pdf
        - Bravon.pdf
        - Gumo.pdf
        - Proyecto.pdf
        - (imágenes .jpg/.png)
        
        🚀 Para publicar en Netlify:
        1. Ve a https://app.netlify.com
        2. Arrastra tu carpeta o conecta GitHub
        3. ¡Listo! Los PDFs funcionarán automáticamente
        
        📍 En Netlify los PDFs se cargan desde: https://tudominio.netlify.app/archivo.pdf
        `);
        
        // Mensaje amigable para usuario
        setTimeout(() => {
            showDownloadNotification('📤 Listo para Netlify - Los PDFs funcionarán al publicar', 'success');
        }, 3000);
    }
});