from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from vetapp.mixins import GenericErrorHandlingMixin


class HealthView(GenericErrorHandlingMixin, APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            return Response({'status': 'ok'})
        except Exception as err:
            return self._handle_generic_error(err)
