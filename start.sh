#!/bin/bash
# Load nvm and use Node 22
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use 22

# Run vite preview
exec ./node_modules/.bin/vite preview --host 0.0.0.0 --port 9121
