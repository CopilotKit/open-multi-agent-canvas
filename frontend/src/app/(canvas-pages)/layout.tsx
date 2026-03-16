import { EnhancedLayout } from "@/components/enhanced-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <EnhancedLayout>{children}</EnhancedLayout>;
}
