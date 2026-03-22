import StaticPageTemplate from './StaticPageTemplate';
import { staticPageContent } from './staticPageContent';

export default function TermsOfServicePage() {
  return <StaticPageTemplate {...staticPageContent.termsOfService} />;
}
