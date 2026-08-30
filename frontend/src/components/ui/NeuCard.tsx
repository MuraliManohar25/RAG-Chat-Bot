import { Card } from "./Card";
import type { CardProps } from "./Card";

export function NeuCard({ children, className, ...props }: CardProps) {
  return <Card className={className} {...props}>{children}</Card>;
}
