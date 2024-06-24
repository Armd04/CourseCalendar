# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY calander-app/package*.json ./calander-app/
# Install npm dependencies
RUN npm install --prefix calander-app

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build --prefix calander-app

# Expose the port the app runs on
EXPOSE 3000

# Set environment variable to production
ENV NODE_ENV production

# Command to run the Next.js production server
CMD ["npm", "run", "start", "--prefix", "calander-app"]
