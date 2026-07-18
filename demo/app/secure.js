// Demo secure page — gated on the token the login page stored, to demonstrate a
// session. Without it, bounce back to the login page.
const TOKEN_KEY = 'demo:token'
if (!localStorage.getItem(TOKEN_KEY)) {
    location.replace('/login')
}
