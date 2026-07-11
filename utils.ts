import React from 'react';

/**
 * centralizes format and validation of media URLs (images and videos).
 * Supports both absolute URLs (starts with http/https) and local paths.
 */
export function formatMediaUrl(url: string | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Rule: Automatically detect and convert any absolute URLs (e.g. raw.githubusercontent.com)
  // that point to our local asset folders (portfolio, perfil, logo) so they load instantly from the public folder.
  const assetFolderMatch = trimmed.match(/\/(?:public\/)?images\/(portfolio|perfil|logo)\/(.+)$/i);
  if (assetFolderMatch) {
    return `/images/${assetFolderMatch[1]}/${assetFolderMatch[2]}`;
  }

  // Rule 6: Correct any logic/cases where "/images/" or "images/" is automatically added in front of an absolute URL
  if (trimmed.startsWith('/images/http://') || trimmed.startsWith('/images/https://')) {
    return trimmed.substring(8); // remove "/images/"
  }
  if (trimmed.startsWith('images/http://') || trimmed.startsWith('images/https://')) {
    return trimmed.substring(7); // remove "images/"
  }
  
  // Rule 7 & 8: Detect if the URL starts with http:// or https://, and use it directly.
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Otherwise, treat it as a local resource of the public directory.
  // Ensure it starts with a leading slash so it is loaded relative to the root/public directory.
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  
  return `/${trimmed}`;
}

/**
 * Wraps English words in a <span className="notranslate" translate="no"> tag
 * to prevent translation when browsers auto-translate the page.
 */
export function preventTranslation(text: string | undefined): React.ReactNode {
  if (!text) return '';

  // List of common English terms/words to prevent from translation.
  const englishTerms = [
    'reels', 'reel', 'copywriting', 'storytelling', 'copy', 'branding', 'tiktok', 'linkedin',
    'whatsapp', 'instagram', 'insta', 'tally', 'bonus', 'logo', 'logos', 'youtube', 'facebook',
    'grid', 'feedback', 'post', 'posts', 'feed', 'creator', 'creators', 'online', 'app', 'apps',
    'portfolio', 'cta', 'landing', 'lead', 'leads', 'marketing', 'briefing', 'funnel', 'funnels',
    'hook', 'hooks', 'engagement', 'target', 'pitch', 'launch', 'brief', 'briefs', 'b-roll', 'shorts',
    'stories', 'highlights', 'bio', 'link', 'links', 'script', 'scripts', 'editor', 'editors',
    'canva', 'notion', 'capcut', 'premiere', 'after effects', 'ai', 'ui', 'ux', 'dev', 'free',
    'premium', 'chat', 'chats', 'email', 'emails'
  ];

  // Build a regex matching any of these words as independent words
  const pattern = new RegExp(`\\b(${englishTerms.join('|')})\\b`, 'gi');

  const parts = text.split(pattern);
  if (parts.length <= 1) {
    return text;
  }

  return parts.map((part, index) => {
    // If the index is odd, it matched one of our English terms
    if (index % 2 === 1) {
      return React.createElement(
        'span',
        { key: index, className: 'notranslate', translate: 'no' },
        part
      );
    }
    return part;
  });
}

