var sseConfig={
        'base_url_ta' : 'http://127.0.0.1:8000', //{url} URL of SSE TA. Example: http://127.0.0.1:8000
        'base_url_sse_server' : 'http://127.0.0.1:8080',//{url} URL of SSE Server
        'salt' : 'a1b2c3d4', //{string, 8 characters} Salt value which is used for key generation from a passphrase
        'iv' : 'abcdefghijklmn', //{string} Initial vector value which is used for encryption
        'iter' : 10000, //{number} Number of iteration for generating key from passphrase
        'ks' : 256, // {number} key size. Example: 128, 256
        'ts' : 64, // {number} tag size. Example: 64
        'mode' : 'ccm', // {string} Encryption mode. Example: ccm
        'adata':'', // {string, ''} This is not supported to be configurable yet
        'adata_len' : 0, //{number, 0} This is not supported to be configurable yet
        'hash_length' : 256, // {number} length of hash value
        'chunk_size' : 32768,// {number} Size of 1 slice/ chunk for encryption (in uint8 items). Example: 32768=1024^32
        'no_chunks_per_upload' : 30, // {number} Number of chunks to be packed in 1 upload
        'salt_sgx' : 'ZRVja4LFrFY=', // {base64, 8 bytes} salt value for encryption. This will be replaced with correct value at runtime at the web server
        'iv_sgx' : 'n2JUTJ0/yrI=', // {base64, 8 bytes} iv for encryption. This will be replaced with correct value at runtime at the web server
        'iter_sgx' : 10000, //{number} Number of iteration for generating key from passphrase. Example: 1000
        'ks_sgx' : 128, //{128} it is set 128 bits to be compatible with AES encryption in SGX
        'ts_sgx' : 64, // {number} tag size. Example: 64
        'mode_sgx' : 'ccm', // {string} Encryption mode. Example: ccm
        'adata_sgx':'', // {string, ''} This is not supported to be configurable yet
        'adata_len_sgx' : 0, //{number, 0} This is not supported to be configurable yet
        'sgx_enable' : true //{boolean} True if SGX is enabled at SSE TA, false otherwise
}

// Values "salt_sgx, iv_sgx, iter_sgx, ks_sgx, ts_sgx, mode_sgx, adata_sgx, adata_len_sgx" are not used when sgx_enable=false

