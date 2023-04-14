let blocked_url = "https://chat.openai.com/";
let support_countryCodes = ['T1', 'XX', 'AL', 'DZ', 'AD', 'AO', 'AG', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BS', 'BD', 'BB', 'BE', 'BZ', 'BJ', 'BT', 'BA', 'BW', 'BR', 'BG', 'BF', 'CV', 'CA', 'CL', 'CO', 'KM', 'CR', 'HR', 'CY', 'DK', 'DJ', 'DM', 'DO', 'EC', 'SV', 'EE', 'FJ', 'FI', 'FR', 'GA', 'GM', 'GE', 'DE', 'GH', 'GR', 'GD', 'GT', 'GN', 'GW', 'GY', 'HT', 'HN', 'HU', 'IS', 'IN', 'ID', 'IQ', 'IE', 'IL', 'IT', 'JM', 'JP', 'JO', 'KZ', 'KE', 'KI', 'KW', 'KG', 'LV', 'LB', 'LS', 'LR', 'LI', 'LT', 'LU', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MR', 'MU', 'MX', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'MK', 'NO', 'OM', 'PK', 'PW', 'PA', 'PG', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RW', 'KN', 'LC', 'VC', 'WS', 'SM', 'ST', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB', 'ZA', 'ES', 'LK', 'SR', 'SE', 'CH', 'TH', 'TG', 'TO', 'TT', 'TN', 'TR', 'TV', 'UG', 'AE', 'US', 'UY', 'VU', 'ZM', 'BO', 'BN', 'CG', 'CZ', 'VA', 'FM', 'MD', 'PS', 'KR', 'TW', 'TZ', 'TL', 'GB'];
let result = {
    title: "ChatGPT节点检测结果",
    content: '检测失败，请刷新',
    icon: "key.icloud",
    'icon-color': "#5AC8FA"
};

function setDone(body) {
    result.content = body;
    $done(result);
}

$httpClient.head(blocked_url, function (error, response, data) {
    let countryCode;
    if (!error) {
        let jsonData = JSON.parse(JSON.stringify(response))
        let keys = Object.keys(jsonData.headers);
        let hasPermissionsPolicy = keys.includes('permissions-policy');
        let hasCrossOriginEmbedderPolicy = keys.includes('cross-origin-embedder-policy');

        if (!hasPermissionsPolicy && !hasCrossOriginEmbedderPolicy) {
            setDone('IP is BLOCKED');
            return;
        }
    } else {
        setDone('Network connection failed');
        return;
    }

    url = "https://chat.openai.com/cdn-cgi/trace";
    $httpClient.get(url, function (error, response, data) {
        if (!error) {
            countryCode = data.match(/loc=([A-Z,0-9]+)/);
            const matchResult = data.match(/warp=(on|off)$/);
            let value = 'off';
            if (matchResult && matchResult.length > 1) {
                value = matchResult[1];
            }
            if (countryCode) {
                countryCode = countryCode[1];
                if (support_countryCodes.includes(countryCode)) {
                    content = `Yes (Region: ${countryCode}) | WARP is ${value.toUpperCase()}`,
                    setDone(content)
                } else {
                    setDone('not available in your country')
                }
            } else {
                setDone('Failed')
            }
        } else {
            setDone('Failed')
        }
    });
});
