"""
Structured logger for the MCP Agent.
Provides consistent logging with structured data.
"""

import logging
import json
import os
import sys
from typing import Dict, Any, Optional, Union
from datetime import datetime

class StructuredLogger:
    """
    Structured logger for the MCP Agent.
    Provides consistent logging with structured data.
    """
    
    def __init__(self, name: str, level: int = logging.INFO):
        """
        Initialize the structured logger.
        
        Args:
            name: The name of the logger
            level: The logging level (default: INFO)
        """
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)
        
        # Add console handler if not already present
        if not self.logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def log(self, level: int, message: str, context: Optional[Dict[str, Any]] = None):
        """
        Log a message with structured context.
        
        Args:
            level: The logging level
            message: The message to log
            context: Additional context data (default: None)
        """
        if context:
            self.logger.log(level, f"{message} - {json.dumps(context)}")
        else:
            self.logger.log(level, message)
    
    def debug(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log a debug message."""
        self.log(logging.DEBUG, message, context)
    
    def info(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log an info message."""
        self.log(logging.INFO, message, context)
    
    def warning(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log a warning message."""
        self.log(logging.WARNING, message, context)
    
    def error(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log an error message."""
        self.log(logging.ERROR, message, context)
    
    def critical(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log a critical message."""
        self.log(logging.CRITICAL, message, context)

class FileLogger(StructuredLogger):
    """
    Extended structured logger that also logs to a file.
    """
    
    def __init__(self, name: str, log_dir: str = "logs", level: int = logging.INFO):
        """
        Initialize the file logger.
        
        Args:
            name: The name of the logger
            log_dir: The directory to store log files (default: "logs")
            level: The logging level (default: INFO)
        """
        super().__init__(name, level)
        
        # Create log directory if it doesn't exist
        os.makedirs(log_dir, exist_ok=True)
        
        # Create a file handler
        log_file = os.path.join(log_dir, f"{name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
        file_handler = logging.FileHandler(log_file)
        file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(file_formatter)
        file_handler.setLevel(level)
        
        # Add file handler to logger
        self.logger.addHandler(file_handler)
        
        self.info(f"Logging to file: {log_file}")

def get_logger(name: str, log_to_file: bool = False, log_dir: str = "logs", level: int = logging.INFO) -> StructuredLogger:
    """
    Get a structured logger.
    
    Args:
        name: The name of the logger
        log_to_file: Whether to log to a file (default: False)
        log_dir: The directory to store log files (default: "logs")
        level: The logging level (default: INFO)
        
    Returns:
        A structured logger
    """
    if log_to_file:
        return FileLogger(name, log_dir, level)
    else:
        return StructuredLogger(name, level)
