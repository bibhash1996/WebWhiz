import logging
from pythonjsonlogger import jsonlogger

class RequestIDFilter(logging.Filter):
    def __init__(self, name=""):
        super().__init__(name)
        self.request_id = None

    def filter(self, record):
        record.request_id = self.request_id or "N/A"
        return True
    
request_id_filter = RequestIDFilter()

# Create a handler
log_handler = logging.StreamHandler()

# Create JSON formatter
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s')

# Set formatter and level
log_handler.setFormatter(formatter)
log_handler.addFilter(request_id_filter)

# Get the root logger and configure it
logger = logging.getLogger('webwhiz')
logger.setLevel(logging.INFO)
logger.addHandler(log_handler)



# Optional: Disable default handlers if needed
logger.handlers = [log_handler]