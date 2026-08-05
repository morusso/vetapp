from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from rest_framework_simplejwt.token_blacklist.admin import OutstandingTokenAdmin
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from user.forms import UserChangeForm, UserCreationForm
from user.models import User


def _blacklist(tokens):
    created = 0
    for token in tokens:
        _obj, was_created = BlacklistedToken.objects.get_or_create(token=token)
        if was_created:
            created += 1
    return created


@admin.action(description='Wyloguj wszędzie (unieważnij wszystkie tokeny)')
def revoke_all_tokens(modeladmin, request, queryset):
    count = _blacklist(OutstandingToken.objects.filter(user__in=queryset))
    modeladmin.message_user(request, f'Unieważniono {count} token(ów).')


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Dane osobowe', {'fields': ('first_name', 'last_name')}),
        (
            'Uprawnienia',
            {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')},
        ),
        ('Ważne daty', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email', 'password1', 'password2')}),
    )

    list_display = ('email', 'first_name', 'last_name', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions')

    actions = [*DjangoUserAdmin.actions, revoke_all_tokens]


@admin.action(description='Zablacklistuj wybrane tokeny')
def blacklist_selected_tokens(modeladmin, request, queryset):
    count = _blacklist(queryset)
    modeladmin.message_user(request, f'Zablacklistowano {count} token(ów).')


admin.site.unregister(OutstandingToken)


@admin.register(OutstandingToken)
class RevocableOutstandingTokenAdmin(OutstandingTokenAdmin):
    actions = [blacklist_selected_tokens]
