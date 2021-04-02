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

# configure sseConfig
sed -i -e "s|ta_url|$TA_URL|" sse/static/js/sse.js
sed -i -e "s|sse_url|$SSE_URL|" sse/static/js/sse.js
sed -i -e "s|salt_value|$SALT|" sse/static/js/sse.js
sed -i -e "s|iv_value|$IV|" sse/static/js/sse.js
sed -i -e "s|iter_value|$ITER|" sse/static/js/sse.js
sed -i -e "s|ks_value|$KS|" sse/static/js/sse.js
sed -i -e "s|ts_value|$TS|" sse/static/js/sse.js
sed -i -e "s|mode_value|$MODE|" sse/static/js/sse.js
sed -i -e "s|adata_value|$ADATA|" sse/static/js/sse.js
sed -i -e "s|adata_len_value|$ADATA_LEN|" sse/static/js/sse.js
sed -i -e "s|hash_length_value|$HASH_LEN|" sse/static/js/sse.js
sed -i -e "s|chunk_size_value|$CHUNK_SIZE|" sse/static/js/sse.js
sed -i -e "s|no_chunks_per_upload_value|$NO_CHUNKS_PER_UPLOAD|" sse/static/js/sse.js
sed -i -e "s|salt_ta_value|$SALT_TA|" sse/static/js/sse.js
sed -i -e "s|iv_ta_value|$IV_TA|" sse/static/js/sse.js
sed -i -e "s|iter_ta_value|$ITER_TA|" sse/static/js/sse.js
sed -i -e "s|ks_ta_value|$KS_TA|" sse/static/js/sse.js
sed -i -e "s|ts_ta_value|$TS_TA|" sse/static/js/sse.js
sed -i -e "s|mode_ta_value|$MODE_TA|" sse/static/js/sse.js
sed -i -e "s|adata_ta_value|$ADATA_TA|" sse/static/js/sse.js
sed -i -e "s|adata_len_ta_value|$ADATA_LEN_TA|" sse/static/js/sse.js
sed -i -e "s|sgx_enable_value|$SGX_ENABLE|" sse/static/js/sse.js
sed -i -e "s|cp_abe_url|$CP_ABE_URL|" sse/static/js/sse.js
sed -i -e "s|debug_value|$DEBUG|" sse/static/js/sse.js
sed -i -e "s|auth_value|$AUTH|" sse/static/js/sse.js
sed -i -e "s|small_file_size|$SMALL_FILE|" sse/static/js/sse.js

exec gunicorn SSEclient.wsgi:application \
    --name sse \
    --bind 0.0.0.0:80 \
    --workers 3
    # \
    #--log-level=info \
    #--log-file=./logs/sse.log \
    #--access-logfile=./logs/sse-access.log \
#"$@"
