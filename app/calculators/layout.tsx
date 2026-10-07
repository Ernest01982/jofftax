import type { ReactNode } from 'react';
import { CalculatorSessionProvider } from './calculator-context';

export default function CalculatorLayout({ children }: { children: ReactNode }) {
  return <CalculatorSessionProvider>{children}</CalculatorSessionProvider>;
}
