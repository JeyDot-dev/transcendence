export class ModalManager {
    constructor() {
        this.activeModal = null;
        this.isSubmitting = false;
    }

    openModal(modalId, onSubmitCallback, menuInstance) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
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
                event.preventDefault();
                if (this.isSubmitting) return;

                this.isSubmitting = true;
                submitButton.disabled = true;

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
            submitButton.disabled = false;
            this.activeModal = null;

            if (!menuInstance.formSubmittedSuccessfully) {
                menuInstance.enableEventListener();
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
