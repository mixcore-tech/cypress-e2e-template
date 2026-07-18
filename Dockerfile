# Pinned to the project's Cypress version (package.json → cypress@15.18.1).
# The cypress/included image ships the matching Cypress binary plus Chrome,
# Electron and every OS library Cypress needs — keep this tag in sync with
# the cypress devDependency when you upgrade.
FROM cypress/included:15.18.1

WORKDIR /app

# Install dependencies first for better layer caching. The image already has the
# matching Cypress binary cached, so `npm ci` reuses it instead of downloading.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the project (node_modules etc. excluded via .dockerignore).
COPY . .

# The base image's ENTRYPOINT is `cypress run`; clear it so we go through the
# npm scripts (which apply env/version handling and the alias preprocessor).
ENTRYPOINT []
# Default: the zero-setup demo suite. Override per run, e.g.:
#   docker compose run --rm cypress npm run run:local
CMD ["npm", "test"]
