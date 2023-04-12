# Use the official Node.js Alpine image as the base image
FROM node:14-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm ci --only=production

# Copy the rest of the source code to the working directory
COPY . .

# Expose the port the API will run on
EXPOSE 3000

# Start the API
CMD ["npm", "start"]