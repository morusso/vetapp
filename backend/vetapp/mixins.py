import logging

from django.http import Http404
from rest_framework import status
from rest_framework.response import Response

logger = logging.getLogger(__name__)


class RepositoryAPIViewMixin:
    repository_class = None

    @property
    def repository(self):
        return self.repository_class()

    def get_queryset(self):
        return self.repository.list()

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        obj = self.repository.get(self.kwargs[lookup_url_kwarg])
        if obj is None:
            raise Http404
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_destroy(self, instance):
        self.repository.delete(instance.id)


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
