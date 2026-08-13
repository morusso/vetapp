from rest_framework.permissions import BasePermission


class IsNoteAuthorOrAdmin(BasePermission):
    """Only a visit note's author or an admin may delete it."""

    def has_object_permission(self, request, view, obj):
        if request.method != "DELETE":
            return True
        user = request.user
        return bool(user.is_staff or (obj.author is not None and obj.author.id == user.id))
