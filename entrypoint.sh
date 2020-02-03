#!/bin/bash

# Prepare log files and start outputting logs to stdout
#touch ./logs/sse.log
#touch ./logs/sse-access.log
#tail -n 0 -f ./logs/sse*.log &

#export DJANGO_SETTINGS_MODULE=sse.settings

echo "Apply database migrations"
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py collectstatic

exec gunicorn SSEclient.wsgi:application \
    --name sse \
    --bind 0.0.0.0:80 \
    --workers 3
    # \
    #--log-level=info \
    #--log-file=./logs/sse.log \
    #--access-logfile=./logs/sse-access.log \
#"$@"
