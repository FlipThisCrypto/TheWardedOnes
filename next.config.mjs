/** @type {import('next').NextConfig} */

// GitHub project pages: https://<user>.github.io/TheWardedOnes/
const repoName = 'TheWardedOnes';
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  // Only apply basePath for Pages builds so local `next dev` stays at /
  ...(isGithubPages
    ? {
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
      }
    : {}),
};

export default nextConfig;
