import {
  AlignLeft,
  Box,
  Building2,
  Calendar,
  CheckSquare,
  CircleDollarSign,
  Globe,
  Hash,
  Layers,
  Mail,
  MapPin,
  Percent,
  Phone,
  Shield,
  Tag,
  ToggleLeft,
  Type,
  User,
} from "lucide-react";
import type { FieldType } from "./types";

export function pickCellIcon(key: string) {
  const normalized = key.toLowerCase();
  const className = "h-3.5 w-3.5";

  if (/phone|mobile|tel|contact/.test(normalized)) return <Phone className={className} />;
  if (/email|mail/.test(normalized)) return <Mail className={className} />;
  if (/web|url|site|link/.test(normalized)) return <Globe className={className} />;
  if (/(address|location|city|area|country|origin)/.test(normalized)) return <MapPin className={className} />;
  if (/date|day|month|year|expiry|due/.test(normalized)) return <Calendar className={className} />;
  if (/(price|amount|balance|cost|salary|payable|receivable|total|value)/.test(normalized)) {
    return <CircleDollarSign className={className} />;
  }
  if (/qty|quantity|stock|units/.test(normalized)) return <Box className={className} />;
  if (/(code|sku|ref|^no$|^id$|cnic|ntn|strn|barcode)/.test(normalized)) return <Hash className={className} />;
  if (/branch|warehouse|store|outlet/.test(normalized)) return <Building2 className={className} />;
  if (/owner|user|head|manager|guarantor|employee|agent/.test(normalized)) return <User className={className} />;
  if (/discount|percent|rate|tax/.test(normalized)) return <Percent className={className} />;

  return null;
}

export function pickFieldIcon(name: string, type: FieldType) {
  const normalized = name.toLowerCase();
  const className = "h-3.5 w-3.5";

  if (/(^name$|title|brand|product|supplier|customer|company)/.test(normalized)) return <Tag className={className} />;
  if (/(code|sku|ref|number|^no$|cnic|ntn|strn)/.test(normalized)) return <Hash className={className} />;
  if (/(country|address|location|city|area|origin)/.test(normalized)) return <MapPin className={className} />;
  if (/phone|mobile|tel|contact/.test(normalized)) return <Phone className={className} />;
  if (/email|mail/.test(normalized)) return <Mail className={className} />;
  if (/web|url|site|link/.test(normalized)) return <Globe className={className} />;
  if (/warranty|guarantee|policy/.test(normalized)) return <Shield className={className} />;
  if (/branch|warehouse|store|outlet/.test(normalized)) return <Building2 className={className} />;
  if (/status|active|enable/.test(normalized)) return <ToggleLeft className={className} />;
  if (/date|day|month|year/.test(normalized)) return <Calendar className={className} />;
  if (/(price|amount|balance|cost|salary|fee)/.test(normalized)) return <CircleDollarSign className={className} />;
  if (/qty|quantity|stock|units/.test(normalized)) return <Box className={className} />;
  if (/discount|percent|rate|tax/.test(normalized)) return <Percent className={className} />;
  if (/note|description|remark|detail/.test(normalized)) return <AlignLeft className={className} />;
  if (/owner|user|person|head|manager|guarantor/.test(normalized)) return <User className={className} />;
  if (type === "checkbox") return <CheckSquare className={className} />;
  if (type === "select") return <Layers className={className} />;
  if (type === "textarea") return <AlignLeft className={className} />;
  if (type === "number") return <Hash className={className} />;

  return <Type className={className} />;
}
