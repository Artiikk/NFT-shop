const toCurrency = (price) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'ETH'
  }).format(price)
}

const toDate = (date) => {
  return new Intl.DateTimeFormat('en-EN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date))
}

document.querySelectorAll('.price').forEach(node => {
  node.textContent = toCurrency(node.textContent)
})

document.querySelectorAll('.date').forEach(node => {
  node.textContent = toDate(node.textContent)
})

const $cart = document.querySelector('#cart')
if ($cart) {
  $cart.addEventListener('click', async ({ target }) => {
    if (target.classList.contains('js-remove')) {
      const id = target.dataset.id
      const csrf = target.dataset.csrf

      const removed = await fetch(`/cart/remove/${id}`, {
        method: 'DELETE',
        headers: {
          'X-XSRF-TOKEN': csrf
        }
        // body: JSON.stringify({ _csrf: csrf })
      })
      const cart = await removed.json()

      if (cart.tokens.length) {
        const html = cart.tokens.map(({ _id, title, count }) => {
          return `
            <tr>
              <td>${title}</td>
              <td>${count}</td>
              <td>
                <button class="btn btn-small js-remove" data-id="${_id}">Delete</button>
              </td>
            </tr>
          `.trim()

        }).join('')

        $cart.querySelector('tbody').innerHTML = html
        $cart.querySelector('.price').textContent = toCurrency(cart.price)
      } else {
        $cart.innerHTML = `<p>Cart is empty</p>`
      }
    }
  })
}

M.Tabs.init(document.querySelectorAll('.tabs'))