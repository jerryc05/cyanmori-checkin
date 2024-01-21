const { Octokit } = require('@octokit/rest')
const sodium = require('libsodium')

const octokit = new Octokit({ auth: process.env.GH_TOKEN })

async function updateSecret(
  owner: string,
  repo: string,
  secretName: string,
  secretValue: string
) {
  const {
    data: { key_id, key },
  } = await octokit.rest.actions.getRepoPublicKey({
    owner,
    repo,
  })

  const messageBytes = Buffer.from(secretValue)
  const keyBytes = Buffer.from(key, 'base64')
  const encryptedBytes = sodium.seal(messageBytes, keyBytes)
  const encryptedValue = Buffer.from(encryptedBytes).toString('base64')

  await octokit.rest.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: secretName,
    encrypted_value: encryptedValue,
    key_id,
  })
}

function mergeCookies(existingCookies: string, setCookieHeaders: string[]) {
  // Parse existing cookies into a map
  const cookieMap = existingCookies.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=')
    acc[name.trim()] = value
    return acc
  }, {})

  // Process each Set-Cookie header
  setCookieHeaders.forEach(header => {
    const [fullCookie] = header.split(';') // Only take the first part (name=value), ignore attributes
    const [name, value] = fullCookie.split('=')
    cookieMap[name.trim()] = value
  })

  // Combine all cookies into a single string
  return Object.entries(cookieMap)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
}

const promises = []

promises.push(
  fetch('https://cccc.gg/user/checkin', {
    headers: {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
      'sec-ch-ua':
        '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-requested-with': 'XMLHttpRequest',
      cookie: process.env.COOKIE,
      Referer: 'https://cccc.gg/user',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: null,
    method: 'POST',
  })
    .then(x => {
      if (x.headers.get('Set-Cookie'))
        promises.push(
          updateSecret(
            'jerryc05',
            'cyanmori-checkin',
            'COOKIE',
            mergeCookies(process.env.COOKIE, x.headers.getSetCookie())
          ).catch(console.error)
        )
      return x.json()
    })
    .then(console.log)
    .finally(console.error)
)

await Promise.allSettled(promises)
