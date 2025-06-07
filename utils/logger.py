import logging
import os
from logging.handlers import RotatingFileHandler

# Create logs directory if it doesn't exist
os.makedirs('/app/logs', exist_ok=True)

# Configure logging
def setup_logger(name, log_file, level=logging.INFO):
    """Function to setup a logger with file handler"""
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Create file handler
    file_handler = RotatingFileHandler(
        log_file,
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
jwt_logger = setup_logger('jwt_validation', '/app/logs/jwt_validation.log')