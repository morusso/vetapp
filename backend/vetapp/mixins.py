import logging
from rest_framework import status
from rest_framework.response import Response

logger = logging.getLogger(__name__)


class GenericErrorHandlingMixin:
    def _handle_generic_error(self, error):
        """Handles generic exceptions."""
        self._log_error("Exception", error)
        content = {"error": f"Undefined error {self.__class__.__name__}: {error}"}
        return Response(content, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_input_summary(self):
        """Generates input data summary for logging purposes."""
        return self.request.data

    def _log_error(self, error_type, error):
        """Logs error with appropriate details."""
        logger.error(
            "%s %s route: %s, input: %s",
            self.__class__.__name__,
            error_type,
            error,
            self._get_input_summary(),
            exc_info=True,
        )
