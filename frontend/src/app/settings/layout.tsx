import { EnhancedLayout } from "@/components/enhanced-layout";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EnhancedLayout>{children}</EnhancedLayout>;
}
