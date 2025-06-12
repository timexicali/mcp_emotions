import logging
import os
from logging.handlers import RotatingFileHandler

# Create logs directory in the current directory if it doesn't exist
log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
os.makedirs(log_dir, exist_ok=True)

# Configure JWT logger
jwt_logger = logging.getLogger("jwt")
jwt_logger.setLevel(logging.INFO)

# Create file handler
file_handler = RotatingFileHandler(
    os.path.join(log_dir, 'jwt_validation.log'),
    maxBytes=1024 * 1024,  # 1MB
    backupCount=5
)

# Create formatter
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
file_handler.setFormatter(formatter)

# Add handler to logger
jwt_logger.addHandler(file_handler)

# Configure logging
def setup_logger(name, log_file, level=logging.INFO):
    """Function to setup a logger with file handler"""
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Create file handler
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, log_file),
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.addHandler(file_handler)
    
    return logger

# Create JWT validation logger
jwt_logger = setup_logger('jwt_validation', 'jwt_validation.log')