export const githubUrl = import.meta.env.VITE_GITHUB_URL || 'https://github.com';
export const downloadUrl = import.meta.env.VITE_DOWNLOAD_URL || '#download';

const isExternalUrl = (url) => /^https?:\/\//.test(url);

export const getActionLinkProps = (url) => {
  if (!isExternalUrl(url)) {
    return { href: url };
  }

  return {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
  };
};
