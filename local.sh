#!/bin/bash
export DJANGO_LOGLEVEL=DEBUG \
	DJANGO_DEBUG=True \
	ALLOWED_HOSTS='*' \
	TA_URL=http://127.0.0.1:8000 \
	SSE_URL=http://127.0.0.1:8080 \
	SALT="ZRVja4LFrFY=" \
	IV="n2JUTJ0/yrI=" \
	ITER=10000 \
	KS=256 \
	TS=64 \
	MODE=ccm \
	ADATA="" \
	ADATA_LEN=0 \
	CIPHER=aes \
	HASH_LEN=256 \
	CHUNK_SIZE=32768 \
	NO_CHUNKS_PER_UPLOAD=30 \
	SALT_SGX="ZRVja4LFrFY=" \
	IV_SGX="n2JUTJ0/yrI=" \
	ITER_SGX=10000 \
	KS_SGX=128 \
	TS_SGX=64 \
	MODE_SGX=ccm \
	ADATA_SGX="" \
	ADATA_LEN_SGX=0 \
	CIPHER_SGX=aes

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
