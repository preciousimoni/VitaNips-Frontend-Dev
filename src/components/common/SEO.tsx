import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const SEO = ({
  title = 'VitaNips',
  description = 'VitaNips - Your Vitality, Our Priority',
  keywords = 'health, wellness, vitamins, supplements',
  image = '/logo.png',
  url = 'https://vitanips.vercel.app/',
}: SEOProps) => {
  const siteTitle = title === 'VitaNips' ? title : `${title} | VitaNips`;
  
  // Ensure image is an absolute URL
  const absoluteImage = image.startsWith('http') 
    ? image 
    : `${url.replace(/\/$/, '')}${image.startsWith('/') ? '' : '/'}${image}`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />

      {/* Open Graph tags (Facebook, LinkedIn, etc.) */}
      <meta property='og:type' content='website' />
      <meta property='og:title' content={siteTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={absoluteImage} />
      <meta property='og:url' content={url} />
      <meta property='og:site_name' content='VitaNips' />

      {/* Twitter Card tags */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={siteTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={absoluteImage} />
      
      {/* Canonical URL */}
      <link rel='canonical' href={url} />
    </Helmet>
  );
};
