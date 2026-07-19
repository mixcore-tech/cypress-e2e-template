// Demo network page — the button fires a GET the intercept example asserts on.
const button = document.getElementById('get-comment')
const result = document.getElementById('result')

button.addEventListener('click', async () => {
    const response = await fetch('/api/comments/1')
    const body = await response.json()
    result.textContent = JSON.stringify(body, null, 2)
})
