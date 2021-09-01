require('dotenv').config()

const EMAIL_FROM = process.env.EMAIL_FROM
const BASE_URL = process.env.BASE_URL

module.exports = function(email, token) {
  return {
    to: email,
    from: EMAIL_FROM,
    subject: 'Access reset',
    html: `
      <h1>Have you forgot your password?</h1>
      <p>If not, just ignore this mail</p>
      <p>Otherwise, go for this link</p>
      <p><a href='${BASE_URL}/auth/password/${token}'>Renew access</a></p>
      <hr />
      <p>Visit our <a href='${BASE_URL}'>NFT SHOP</a></p>
    `,
  }
}