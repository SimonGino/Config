let url = "https://chat.openai.com/cdn-cgi/trace"
let support_countryCodes = ['T1', 'XX', 'AL', 'DZ', 'AD', 'AO', 'AG', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BS', 'BD', 'BB', 'BE', 'BZ', 'BJ', 'BT', 'BA', 'BW', 'BR', 'BG', 'BF', 'CV', 'CA', 'CL', 'CO', 'KM', 'CR', 'HR', 'CY', 'DK', 'DJ', 'DM', 'DO', 'EC', 'SV', 'EE', 'FJ', 'FI', 'FR', 'GA', 'GM', 'GE', 'DE', 'GH', 'GR', 'GD', 'GT', 'GN', 'GW', 'GY', 'HT', 'HN', 'HU', 'IS', 'IN', 'ID', 'IQ', 'IE', 'IL', 'IT', 'JM', 'JP', 'JO', 'KZ', 'KE', 'KI', 'KW', 'KG', 'LV', 'LB', 'LS', 'LR', 'LI', 'LT', 'LU', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MR', 'MU', 'MX', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'MK', 'NO', 'OM', 'PK', 'PW', 'PA', 'PG', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RW', 'KN', 'LC', 'VC', 'WS', 'SM', 'ST', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB', 'ZA', 'ES', 'LK', 'SR', 'SE', 'CH', 'TH', 'TG', 'TO', 'TT', 'TN', 'TR', 'TV', 'UG', 'AE', 'US', 'UY', 'VU', 'ZM', 'BO', 'BN', 'CG', 'CZ', 'VA', 'FM', 'MD', 'PS', 'KR', 'TW', 'TZ', 'TL', 'GB'];
let countryCode = '';

$httpClient.get(url, function(error, response, data){
 
    countryCode = data.match(/loc=([A-Z,0-9]+)/);

    console.log(countryCode)
    let text ='';
    if (countryCode) {
        countryCode = countryCode[1];
        if (support_countryCodes.includes(countryCode)) {
            text = `ChatGPT : Yes (Region: ${countryCode})`;
        } else {
            text=' ChatGPT              : No';
        }
    } else {
        text=' ChatGPT              : Failed';
    }
  body = {
    title: "UnlockChatGPTTest",
    content: `${text}`,
    icon: "key.icloud",
    'icon-color': "#5AC8FA"
  }
  $done(body);
});

function getFlagEmoji(countryCode) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char =>  127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}
