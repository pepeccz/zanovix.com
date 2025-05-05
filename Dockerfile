# Use an official Node.js runtime as the base image
FROM node:18-slim AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Use a smaller image for the final runtime
FROM node:18-slim

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

# Set the environment variable for production
ENV NODE_ENV production

# Expose the port that Next.js runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]