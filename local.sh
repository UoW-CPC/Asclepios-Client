#!/bin/bash
export DJANGO_LOGLEVEL=DEBUG \
	DJANGO_DEBUG=True \
	ALLOWED_HOSTS='*' \
	ta_url=http://127.0.0.1:8000 \
	sse_url=http://127.0.0.1:8080 \
	salt_value=abc123!? \
	iv_value=abcdefg 
sed -i -e "s|ta_url|$ta_url|" sse/static/js/sse.js
sed -i -e "s|sse_url|$sse_url|" sse/static/js/sse.js
sed -i -e "s|salt_value|$salt_value|" sse/static/js/sse.js
sed -i -e "s|iv_value|$iv_value|" sse/static/js/sse.js
sed -i -e "s|fe_ta_url|$fe_ta_url|" sse/static/js/fe.js
sed -i -e "s|fe_ev_url|$fe_ev_url|" sse/static/js/fe.js