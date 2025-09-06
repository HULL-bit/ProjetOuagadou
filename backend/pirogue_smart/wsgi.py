"""
WSGI config for PIROGUE-SMART project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pirogue_smart.settings')

application = get_wsgi_application()