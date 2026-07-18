/** Standard HTML tags/selectors used by the core handlers. */
export enum HTML_TAGS {
    body = 'body',
    span = 'span',
    input = 'input',
    tr = 'tr',
    td = 'td',
    th = 'th',
    tbodyTr = 'tbody > tr',
    tbody = 'tbody',
    table = 'table',
    thead = 'thead',
    div = 'div',
    button = 'button',
    a = 'a',
    textarea = 'textarea',
    li = 'li',
    form = 'form',
    ul = 'ul'
}

/** Timeout values (milliseconds) used across the suite. */
export enum TIMEOUT {
    tenSec = 10000,
    twentySec = 20000,
    thirtySec = 30000,
    oneMin = 60000,
    twoMins = 120000
}

/** HTTP status codes asserted in API tests. */
export enum HTTP_STATUS_CODE {
    success = 200,
    created = 201,
    noContent = 204,
    badRequest = 400,
    unauthorized = 401,
    forbidden = 403,
    notFound = 404,
    serverError = 500
}

/** HTTP methods for requests and interceptions. */
export enum HTTP_METHOD {
    get = 'GET',
    post = 'POST',
    put = 'PUT',
    patch = 'PATCH',
    delete = 'DELETE'
}
