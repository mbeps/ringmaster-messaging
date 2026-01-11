/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['better-auth'],

	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
			},
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
		],
	},
	reactCompiler: true,
}

module.exports = nextConfig