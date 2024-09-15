export class ModalManager {
    constructor() {
        this.activeModal = null;
        this.isSubmitting = false;
    }

    openModal(modalId, onSubmitCallback, menuInstance) {
        const modalElement = document.getElementById(modalId);
        
        if (!modalElement) {
            console.error(`Modal with ID ${modalId} not found`);
            return;
        }

        const modal = new bootstrap.Modal(modalElement);

        if (this.activeModal) {
            this.activeModal.hide();
        }

        const submitButton = modalElement.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.removeEventListener('click', this.handleSubmit);
            submitButton.addEventListener('click', (event) => {
                event.preventDefault(); // Empêche seulement la soumission, pas l'interaction des champs
                if (this.isSubmitting) return;

                this.isSubmitting = true;
                submitButton.disabled = true; // Désactiver le bouton pour éviter soumission multiple

                onSubmitCallback(event).finally(() => {
                    this.isSubmitting = false;
                    submitButton.disabled = false;
                });
            });
        }

        modal.show();
        this.activeModal = modal;

        modalElement.addEventListener('hidden.bs.modal', () => {
            this.isSubmitting = false;
            submitButton.disabled = false; // Réinitialiser le bouton à la fermeture
            this.activeModal = null;

            // Vérifier si le formulaire a été soumis ou non
            if (!menuInstance.formSubmittedSuccessfully) {
                menuInstance.enableEventListener(); // Réactiver les événements si non soumis
            }
        });
    }

    closeModal() {
        if (this.activeModal) {
            this.activeModal.hide();
            this.activeModal = null;
        }
    }
}
