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
    
    // ===== FUNCIONALIDAD PARA PDFs =====
    const portfolioPdfModal = document.getElementById('portfolioPdfModal');
    const closePortfolioPdfModal = document.getElementById('closePortfolioPdfModal');
    const backToBtn = document.getElementById('backToBtn');
    const portfolioPdfTitle = document.getElementById('portfolioPdfTitle');
    const portfolioPdfContent = document.getElementById('portfolioPdfContent');
    const pdfIframe = document.getElementById('pdfIframe');
    const pdfLoading = document.getElementById('pdfLoading');
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
    
    function showPortfolioPdf(pdfId) {
        if (pdfTitles[pdfId]) {
            portfolioPdfTitle.innerHTML = `<i class="fas fa-file-pdf"></i> ${pdfTitles[pdfId]}`;
            
            const returnPage = pdfReturnPages[pdfId];
            if (returnPage === 'curriculum') {
                backToBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Curriculum';
            } else {
                backToBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Porfolio';
            }
            
            pdfLoading.classList.add('active');
            pdfIframe.style.display = 'none';
            
            const pdfFile = pdfFiles[pdfId];
            
            // Limpiar y recargar el iframe para evitar problemas de caché
            const newIframe = document.createElement('iframe');
            newIframe.className = 'pdf-iframe';
            newIframe.id = 'pdfIframe';
            newIframe.frameBorder = '0';
            
            // Reemplazar el iframe existente
            const oldIframe = document.getElementById('pdfIframe');
            if (oldIframe) {
                portfolioPdfContent.removeChild(oldIframe);
            }
            portfolioPdfContent.appendChild(newIframe);
            
            const updatedPdfIframe = document.getElementById('pdfIframe');
            const updatedPdfLoading = document.getElementById('pdfLoading');
            
            updatedPdfIframe.onload = function() {
                updatedPdfLoading.classList.remove('active');
                updatedPdfIframe.style.display = 'block';
            };
            
            updatedPdfIframe.onerror = function() {
                updatedPdfLoading.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #d32f2f; margin-bottom: 1.5rem;"></i>
                        <h3 style="color: var(--header-color); margin-bottom: 1.5rem; font-size: 1.5rem;">Error al cargar el porfolio</h3>
                        <p style="margin-bottom: 1.5rem; font-size: 1.1rem;">No se pudo cargar el porfolio "${pdfTitles[pdfId]}".</p>
                        <p style="font-size: 1rem; color: #666; margin-bottom: 2rem;">
                            Asegúrate de que el archivo <strong>${pdfFile}</strong> está en la misma carpeta que este archivo HTML.
                        </p>
                        <button class="btn" onclick="closePdfModal()">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
                    </div>
                `;
            };
            
            // Cargar el PDF
            updatedPdfIframe.src = pdfFile;
            portfolioPdfModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Función para cerrar el modal
    window.closePdfModal = function() {
        portfolioPdfModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };
    
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
        closePortfolioPdfModal.addEventListener('click', function() {
            closePdfModal();
        });
    }
    
    if (backToBtn) {
        backToBtn.addEventListener('click', function() {
            const pdfId = getCurrentPdfId();
            if (pdfId && pdfReturnPages[pdfId]) {
                closePdfModal();
                showSection(pdfReturnPages[pdfId]);
            } else {
                closePdfModal();
                showSection('portfolio');
            }
        });
    }
    
    function getCurrentPdfId() {
        const currentTitle = portfolioPdfTitle.textContent || portfolioPdfTitle.innerText;
        for (const [id, title] of Object.entries(pdfTitles)) {
            if (currentTitle.includes(title)) {
                return id;
            }
        }
        return null;
    }
    
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
    
    // Verificar archivos PDF
    function checkFiles() {
        console.log('Verificando archivos PDF...');
        Object.entries(pdfFiles).forEach(([id, file]) => {
            fetch(file)
                .then(response => {
                    if (!response.ok) {
                        console.warn(`Archivo no encontrado: ${file}`);
                        // Mostrar advertencia en la consola
                        console.error(`Por favor, asegúrate de que el archivo "${file}" está en la misma carpeta que el archivo HTML.`);
                    } else {
                        console.log(`Archivo encontrado: ${file}`);
                    }
                })
                .catch(() => {
                    console.warn(`No se pudo acceder al archivo: ${file}`);
                    console.error(`Por favor, coloca el archivo "${file}" en la misma carpeta que el archivo HTML.`);
                });
        });
    }
    
    checkFiles();
});