from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from rest_framework_simplejwt.token_blacklist.admin import OutstandingTokenAdmin
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

from user.forms import UserChangeForm, UserCreationForm
from user.models import User
from user.tokens import blacklist_tokens as _blacklist


@admin.action(description="Log out everywhere (revoke all tokens)")
def revoke_all_tokens(modeladmin, request, queryset):
    count = _blacklist(OutstandingToken.objects.filter(user__in=queryset))
    modeladmin.message_user(request, f"Revoked {count} token(s).")


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
    )

    list_display = ("email", "first_name", "last_name", "is_staff")
    list_filter = ("is_staff", "is_superuser", "is_active", "groups")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    filter_horizontal = ("groups", "user_permissions")

    actions = [*DjangoUserAdmin.actions, revoke_all_tokens]


@admin.action(description="Blacklist selected tokens")
def blacklist_selected_tokens(modeladmin, request, queryset):
    count = _blacklist(queryset)
    modeladmin.message_user(request, f"Blacklisted {count} token(s).")


admin.site.unregister(OutstandingToken)


@admin.register(OutstandingToken)
class RevocableOutstandingTokenAdmin(OutstandingTokenAdmin):
    actions = [blacklist_selected_tokens]
