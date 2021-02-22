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
sed -i -e "s|cipher_type|$CIPHER|" sse/static/js/sse.js
sed -i -e "s|hash_length_value|$HASH_LEN|" sse/static/js/sse.js
sed -i -e "s|chunk_size_value|$CHUNK_SIZE|" sse/static/js/sse.js
sed -i -e "s|no_chunks_per_upload_value|$NO_CHUNKS_PER_UPLOAD|" sse/static/js/sse.js
sed -i -e "s|salt_sgx_value|$SALT_SGX|" sse/static/js/sse.js
sed -i -e "s|iv_sgx_value|$IV_SGX|" sse/static/js/sse.js
sed -i -e "s|iter_sgx_value|$ITER_SGX|" sse/static/js/sse.js
sed -i -e "s|ks_sgx_value|$KS_SGX|" sse/static/js/sse.js
sed -i -e "s|ts_sgx_value|$TS_SGX|" sse/static/js/sse.js
sed -i -e "s|mode_sgx_value|$MODE_SGX|" sse/static/js/sse.js
sed -i -e "s|adata_sgx_value|$ADATA_SGX|" sse/static/js/sse.js
sed -i -e "s|adata_len_sgx_value|$ADATA_LEN_SGX|" sse/static/js/sse.js
sed -i -e "s|cipher_sgx_type|$CIPHER_SGX|" sse/static/js/sse.js

exec gunicorn SSEclient.wsgi:application \
    --name sse \
    --bind 0.0.0.0:80 \
    --workers 3
    # \
    #--log-level=info \
    #--log-file=./logs/sse.log \
    #--access-logfile=./logs/sse-access.log \
#"$@"
