import logging

# Configuration de base du logger
logging.basicConfig(
    level=logging.INFO,  # Change en DEBUG pour voir plus de détails
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Pour afficher les logs dans la console
    ]
)

# Crée un logger pour l'application
logger = logging.getLogger(__name__)