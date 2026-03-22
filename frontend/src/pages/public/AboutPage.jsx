import StaticPageTemplate from './StaticPageTemplate';
import { staticPageContent } from './staticPageContent';

export default function AboutPage() {
  return <StaticPageTemplate {...staticPageContent.about} />;
}
