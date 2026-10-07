import { notFound } from 'next/navigation';
import { CALCULATORS } from '../../../lib/calculators';
import CalculatorExperience from '../calculator-experience';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calculator = CALCULATORS.find((item) => item.id === slug);
  return { title: calculator ? `${calculator.title} | Joff Tax` : 'Calculator not found | Joff Tax' };
}

export default async function CalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!CALCULATORS.some((item) => item.id === slug)) notFound();
  return <CalculatorExperience calculatorId={slug} />;
}
