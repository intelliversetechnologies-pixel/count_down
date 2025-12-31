document.addEventListener('DOMContentLoaded', () => {
    // Modal 1: Anointing Service
    const modalAnointing = document.getElementById('flyer-modal');
    const btnAnointing = document.getElementById('btn-anointing');
    const closeAnointing = document.getElementById('close-modal-btn');

    // Modal 2: Holy Communion
    const modalCommunion = document.getElementById('communion-modal');
    const btnCommunion = document.getElementById('btn-communion');
    const closeCommunion = document.getElementById('close-communion-btn');

    // Generic Open Modal Function
    const openModal = (modal) => {
        if (!modal) return;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    // Generic Close Modal Function
    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restore scrolling
    };

    // Event Listeners for Anointing
    if (btnAnointing) {
        btnAnointing.addEventListener('click', () => openModal(modalAnointing));
    }
    if (closeAnointing) {
        closeAnointing.addEventListener('click', () => closeModal(modalAnointing));
    }

    // Event Listeners for Communion
    if (btnCommunion) {
        btnCommunion.addEventListener('click', () => openModal(modalCommunion));
    }
    if (closeCommunion) {
        closeCommunion.addEventListener('click', () => closeModal(modalCommunion));
    }

    // Close on click outside (Any Modal)
    [modalAnointing, modalCommunion].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modalAnointing && modalAnointing.classList.contains('open')) closeModal(modalAnointing);
            if (modalCommunion && modalCommunion.classList.contains('open')) closeModal(modalCommunion);
        }
    });
});
