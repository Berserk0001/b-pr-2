const pick = require("../util/pick.js");
const fetch = require("node-fetch");
const shouldCompress = require("../util/shouldCompress.js");
const compress = require("../util/compress.js");

const DEFAULT_QUALITY = 10;

exports.handler = async (event, context) => {
    let { url } = event.queryStringParameters;
    let { jpeg, bw, l } = event.queryStringParameters;  //use const by default

    if (!url) {
        return {
            statusCode: 200,
            body: "bandwidth-hero-proxy"
        };
    }

    try {
        url = JSON.parse(url);  // if simple string, then will remain so 
    } catch { }

    if (Array.isArray(url)) {
        url = url.join("&url=");
    }

    // by now, url is a string
    url = url.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, "http://");

    let avif = !jpeg;  //use const by default
    let grayscale = bw != 0;  //use const by default
    let quality = parseInt(l, 10) || DEFAULT_QUALITY;  //use const by default

    try {
        let response_headers = {};
        let { data, type: originType } = await fetch(url, {  //use const by default
            headers: {
                ...pick(event.headers, ['cookie', 'dnt', 'referer']),
                'user-agent': 'Bandwidth-Hero Compressor',
                'x-forwarded-for': event.headers['x-forwarded-for'] || event.ip,
                via: '1.1 bandwidth-hero'
            }
        }).then(async res => {
            if (!res.ok) {
                return {
                    statusCode: res.status || 302
                }
            }

            response_headers = res.headers;
            return {
                data: await res.buffer(),
                type: res.headers.get("content-type") || ""
            }
        })

        let originSize = data.length;  //use const by default

        if (shouldCompress(originType, originSize, avif)) {
            let { err, output, headers } = await compress(data, avif, grayscale, quality, originSize);   // compress, use const by default

            if (err) {
                console.log("Conversion failed: ", url);
                throw err;
            }

            // console.log(`From ${originSize}, Saved: ${(originSize - output.length)/originSize}%`);
	    console.log(`From: ${originSize}, To: ${output.length}, Saved: ${(originSize - output.length)}`); // easier to read
            const encoded_output = output.toString('base64');
            return {
                statusCode: 200,
                body: encoded_output,
                isBase64Encoded: true,  // note: The final size we receive is `originSize` only, maybe it is decoding it server side, because at client side i do get the decoded image directly
                // "content-length": encoded_output.length,     // this doesn't have any effect, this header contains the actual data size, (decrypted binary data size, not the base64 version)
                headers: {
                    "content-encoding": "identity",
                    ...response_headers,
                    ...headers
                }
            }
        } else {
            console.log("Bypassing... Size: " , data.length);
            return {    // bypass
                statusCode: 200,
                body: data.toString('base64'),
                isBase64Encoded: true,
                headers: {
                    "content-encoding": "identity",
                    // "x-proxy-bypass": '1',
                    ...response_headers,
                }
            }
        }
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: err.message || ""
        }
    }
}
