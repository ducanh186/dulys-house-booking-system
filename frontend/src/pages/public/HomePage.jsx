import { Hero } from '../../components/Hero';
import { Featured } from '../../components/Featured';
import { Destinations } from '../../components/Destinations';
import { WhyChooseUs } from '../../components/WhyChooseUs';
import { Testimonials } from '../../components/Testimonials';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Featured />
      <Destinations />
      <WhyChooseUs />
      <Testimonials />
    </div>
  );
}
