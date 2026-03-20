import LegalScreen from "@/components/legal/LegalScreen";
import { LEGAL } from "@/lib/content-manager";

export default function GizlilikScreen() {
  return <LegalScreen doc={LEGAL.gizlilik} />;
}
