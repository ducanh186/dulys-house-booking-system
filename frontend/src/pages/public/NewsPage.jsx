import StaticPageTemplate from './StaticPageTemplate';
import { staticPageContent } from './staticPageContent';

export default function NewsPage() {
  return <StaticPageTemplate {...staticPageContent.news} />;
}
