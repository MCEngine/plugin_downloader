const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Function to download multiple files from a GitHub release
async function downloadGitHubReleases(owner, repo, tag, assets, token = null) {
    const url = `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`;
    try {
        const headers = token ? { 'Authorization': `token ${token}` } : {};
        const response = await axios.get(url, {
            headers: {
                ...headers,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const release = response.data;

        for (const assetName of assets) {
            const asset = release.assets.find(a => a.name === assetName);

            if (asset) {
                await downloadFile(asset.browser_download_url, assetName, headers);
            } else {
                console.error(`GitHub: Asset ${assetName} not found in release ${tag}`);
            }
        }
    } catch (error) {
        console.error('Error fetching GitHub release:', error.message);
    }
}

// Function to download multiple files from a GitLab release
async function downloadGitLabReleases(projectId, tag, assets, token = null) {
    const url = `https://gitlab.com/api/v4/projects/${projectId}/releases/${tag}`;

    try {
        const headers = token ? { 'Private-Token': token } : {};
        const response = await axios.get(url, { headers });

        const release = response.data;

        for (const assetName of assets) {
            const asset = release.assets.links.find(a => a.name === assetName);

            if (asset) {
                await downloadFile(asset.url, assetName, headers);
            } else {
                console.error(`GitLab: Asset ${assetName} not found in release ${tag}`);
            }
        }
    } catch (error) {
        console.error('Error fetching GitLab release:', error.message);
    }
}

// Helper function to download and save a file
async function downloadFile(url, assetName, headers) {
    try {
        const fileResponse = await axios.get(url, {
            headers,
            responseType: 'stream'
        });

        const filePath = path.resolve(__dirname, assetName);
        const writer = fs.createWriteStream(filePath);

        fileResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log(`Downloaded ${assetName} to ${filePath}`);
    } catch (error) {
        console.error(`Error downloading file ${assetName}:`, error.message);
    }
}

// Usage example for GitHub
downloadGitHubReleases(
    '', // GitHub owner or organization
    '',  // GitHub repository name
    '', // Tag of the release
    [''], // Array of asset names to download
    '' // Optional: GitHub token (null for public repo)
);

// Usage example for GitLab
downloadGitLabReleases(
    '', // GitLab project ID (can be found in project settings)
    '', // Tag of the release
    [''], // Array of asset names to download
    '' // Optional: GitLab token (null for public repo)
);
