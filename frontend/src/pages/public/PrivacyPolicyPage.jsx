import StaticPageTemplate from './StaticPageTemplate';
import { staticPageContent } from './staticPageContent';

export default function PrivacyPolicyPage() {
  return <StaticPageTemplate {...staticPageContent.privacyPolicy} />;
}
