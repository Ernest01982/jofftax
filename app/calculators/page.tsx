import type { Metadata } from 'next';
import CalculatorExperience from './calculator-experience';

export const metadata: Metadata = {
  title: 'Free tax calculators | Joff Tax',
  description: 'Explore transparent South African tax estimates, planning scenarios and official next-step guides. Calculators and exports are free during private validation.',
};

export default function CalculatorsPage() {
  return <CalculatorExperience />;
}
