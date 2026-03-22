import StaticPageTemplate from './StaticPageTemplate';
import { staticPageContent } from './staticPageContent';

export default function SupportContactPage() {
  return <StaticPageTemplate {...staticPageContent.supportContact} />;
}
