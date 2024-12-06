const axios = require('axios');

const config = require('./config');

const Authorization = `Bearer ${config.apiKey}`;

(async () => {
    const dnsRecordsUrl = new URL(`https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records`);
    dnsRecordsUrl.searchParams.append("name", config.domain);
    dnsRecordsUrl.searchParams.append("type", "A");

    const dnsRecords = await axios.get(dnsRecordsUrl.toString(), {
        headers: {
            Authorization,
            "Content-Type": "application/json"
        }
    });

    const dnsRecord = dnsRecords.data.result[0];

    const currentIp = (await axios.get('https://api.ipify.org')).data;

    if (!dnsRecord) {
        const res = await axios.post(`https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records`, {
            name: config.domain,
            proxied: false,
            settings: {},
            tags: [],
            ttl: 1,
            type: "A",
            content: currentIp
        }, {
            headers: {
                Authorization,
                "Content-Type": "application/json"
            }
        });

        if (res.data.success) {
            console.log(`DNS record created with IP: ${currentIp}`);
        } else {
            console.error('Failed to create DNS record');
        }
    } else {
        if (dnsRecord.content === currentIp) {
            console.log('DNS record is up to date');
        } else {
            const res = await axios.put(`https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records/${dnsRecord.id}`, {
                name: config.domain,
                proxied: false,
                settings: {},
                tags: [],
                ttl: 1,
                type: "A",
                content: currentIp
            }, {
                headers: {
                    Authorization,
                    "Content-Type": "application/json"
                }
            });

            if (res.data.success) {
                console.log(`DNS record updated with IP: ${currentIp}`);
            } else {
                console.error('Failed to update DNS record');
            }
        }
    }
})();