/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'export',
  reactCompiler: true,
  allowedDevOrigins: ['*','192.168.0.100','192.168.0.102'],
};

export default nextConfig;
