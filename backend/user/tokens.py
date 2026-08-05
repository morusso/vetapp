from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken


def blacklist_tokens(tokens):
    created = 0
    for token in tokens:
        _obj, was_created = BlacklistedToken.objects.get_or_create(token=token)
        if was_created:
            created += 1
    return created
