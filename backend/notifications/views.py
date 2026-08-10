from django.http import Http404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification
from notifications.serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user)
        if self.request.query_params.get("unread") == "true":
            queryset = queryset.filter(is_read=False)
        return queryset


class NotificationMarkReadView(APIView):
    def post(self, request, *args, **kwargs):
        pk = kwargs["pk"]
        updated = Notification.objects.filter(pk=pk, recipient=request.user, is_read=False).update(
            is_read=True, read_at=timezone.now()
        )
        if not updated and not Notification.objects.filter(pk=pk, recipient=request.user).exists():
            raise Http404
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationMarkAllReadView(APIView):
    def post(self, request, *args, **kwargs):
        Notification.objects.filter(recipient=request.user, is_read=False).update(
            is_read=True, read_at=timezone.now()
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
