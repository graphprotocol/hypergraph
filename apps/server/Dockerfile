FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# TODO: Build the image with docker instead of copying external build artifacts in.
COPY . .

EXPOSE $PORT

# necessary for small machines on fly.io to avoid crashing during npm install
ENV NODE_OPTIONS=--max_old_space_size=4096
ENV NODE_ENV=production
RUN npx prisma generate

CMD ["node", "./dist/index.js"]
