import LegalScreen from "@/components/legal/LegalScreen";
import { LEGAL } from "@/lib/content-manager";

export default function KullanimKosullariScreen() {
  return <LegalScreen doc={LEGAL.kullanim} />;
}
