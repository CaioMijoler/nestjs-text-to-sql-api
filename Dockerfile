FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Build the NestJS app
RUN npm run build

# Expose the defined port
EXPOSE 3000

# Run the app
CMD [ "npm", "run", "start:prod" ]
