import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  structuredData?: object | object[];
  noindex?: boolean;
  nofollow?: boolean;
}

export const SEO = ({
  title = "VitaNips - Nigeria's #1 Healthcare Platform | Online Doctor Consultations, Pharmacy & Health Management",
  description = "VitaNips (vitanips.com) - Nigeria's leading digital healthcare platform. Book online doctor consultations, order prescriptions, connect with pharmacies, manage health records, and access emergency services. Skip the traffic, queues, and stress. Your health, sorted.",
  keywords = 'vitanips, vitanips.com, www.vitanips.com, online doctor consultation Nigeria, telemedicine Nigeria, online pharmacy Nigeria, health management platform, book doctor appointment online, virtual doctor consultation, health records Nigeria, prescription delivery Nigeria, emergency health services, healthcare app Nigeria, digital health Nigeria, medical consultation online',
  image = '/logo.png',
  url,
  type = 'website',
  structuredData,
  noindex = false,
  nofollow = false,
}: SEOProps) => {
  // Use current URL if not provided (handle SSR)
  // Use window.location instead of useLocation to avoid Router context requirement
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://vitanips.com';
  };
  
  const getPathname = () => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  };
  
  const baseUrl = getBaseUrl();
  const pathname = getPathname();
  const currentUrl = url || `${baseUrl}${pathname}`;
  
  // Ensure image is an absolute URL
  const absoluteImage = image.startsWith('http') 
    ? image 
    : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;

  // Default structured data if not provided
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: currentUrl,
    publisher: {
      '@type': 'Organization',
      name: 'VitaNips',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'VitaNips',
      url: baseUrl,
    },
  };

  const finalStructuredData = structuredData || defaultStructuredData;
  const structuredDataArray = Array.isArray(finalStructuredData) 
    ? finalStructuredData 
    : [finalStructuredData];

  // Robots meta
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-image-preview:large',
    'max-snippet:-1',
    'max-video-preview:-1',
  ].join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name='title' content={title} />
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <meta name='robots' content={robotsContent} />
      <meta name='googlebot' content={robotsContent} />
      <meta name='author' content='VitaNips' />
      <meta name='language' content='English' />
      <meta name='revisit-after' content='7 days' />
      <meta name='distribution' content='global' />
      <meta name='geo.region' content='NG' />
      <meta name='geo.placename' content='Nigeria' />

      {/* Open Graph / Facebook */}
      <meta property='og:type' content={type} />
      <meta property='og:url' content={currentUrl} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={absoluteImage} />
      <meta property='og:image:secure_url' content={absoluteImage} />
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:image:type' content='image/png' />
      <meta property='og:image:alt' content={title} />
      <meta property='og:site_name' content='VitaNips' />
      <meta property='og:locale' content='en_US' />
      <meta property='og:locale:alternate' content='en_NG' />

      {/* Twitter Card */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:site' content='@VitaNipsHealth' />
      <meta name='twitter:creator' content='@VitaNipsHealth' />
      <meta name='twitter:url' content={currentUrl} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={absoluteImage} />
      <meta name='twitter:image:alt' content={title} />
      
      {/* Canonical URL */}
      <link rel='canonical' href={currentUrl} />
      
      {/* Alternate URLs for brand searches */}
      <link rel='alternate' href={`https://vitanips.com${pathname}`} hrefLang='en' />
      <link rel='alternate' href={`https://www.vitanips.com${pathname}`} hrefLang='en' />
      
      {/* Structured Data (JSON-LD) */}
      {structuredDataArray.map((data, index) => (
        <script
          key={index}
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Helmet>
  );
};
