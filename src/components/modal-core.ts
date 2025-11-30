// Module-scoped modal state
let currentModal: HTMLDialogElement | null = null;

// Function to close the modal
export function handleModalClose() {
    if (currentModal) {
        console.log('Closing modal');
        currentModal.style.opacity = '0'; // Start fade out
        setTimeout(() => {
            if (currentModal && currentModal.parentNode) {
                currentModal.remove(); // Remove from DOM after fade
            }
            currentModal = null; // Clear tracker
            document.body.style.overflow = ''; // Restore body scroll
        }, 300); // Match CSS transition duration
    }
}

// Function to create modal container
export function createModalContainer() {
    const modal = document.createElement('dialog');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    
    currentModal = modal; // Track the new modal

    modal.style.cssText = `
        position:fixed; top:0; left:0; width:100%; height:100%;
        background:rgba(0,0,0,0.6); display:flex; justify-content:center;
        align-items:flex-start; z-index:1050;
        opacity:0; transition: opacity 0.3s ease; overflow-y:auto;
        padding: 40px 20px;
    `;

    return modal;
}

// Function to show modal with fade-in effect
export function showModal(modal: HTMLDialogElement): void {
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    modal.offsetHeight; // Trigger reflow
    modal.style.opacity = '1';
}

// Function to attach close handlers
export function attachCloseHandlers(modal: HTMLDialogElement): void {
    const closeButton: HTMLButtonElement | null = modal.querySelector('#modal-close-button');
    if (closeButton) {
        closeButton.addEventListener('click', handleModalClose);
    }
}