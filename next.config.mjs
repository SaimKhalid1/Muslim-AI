/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Netlify manual deploy (static export)
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
