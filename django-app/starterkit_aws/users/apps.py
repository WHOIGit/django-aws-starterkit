from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class UsersConfig(AppConfig):
    name = "starterkit_aws.users"
    verbose_name = _("Users")

    def ready(self):
        try:
            import starterkit_aws.users.signals  # noqa F401
        except ImportError:
            pass
