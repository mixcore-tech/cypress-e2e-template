// Demo login page — posts credentials to the local mock API, stores the token,
// and redirects to the secure area. On failure it renders the flash message the
// login example asserts on.
const TOKEN_KEY = 'demo:token'
const form = document.getElementById('login-form')
const flash = document.getElementById('flash')

form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })

    if (response.ok) {
        const { token } = await response.json()
        localStorage.setItem(TOKEN_KEY, token)
        location.assign('/secure')
    } else {
        flash.textContent = 'Your password is invalid!'
    }
})
