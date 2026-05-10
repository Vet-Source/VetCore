/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001',
  },
  images: {
    domains: ['vetsource-documents.s3.amazonaws.com'],
  },
};

module.exports = nextConfig;
