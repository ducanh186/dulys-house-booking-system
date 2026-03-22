import StaticPageTemplate from './StaticPageTemplate';
import { staticPageContent } from './staticPageContent';

export default function CareersPage() {
  return <StaticPageTemplate {...staticPageContent.careers} />;
}
