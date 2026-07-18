/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Contact,
  Users,
  FileBadge,
  Wallet,
  GraduationCap,
  Activity,
  FileText,
  Home,
  AlertCircle,
  User,
  Search,
  Plus,
  X,
  Edit,
  Trash2,
  Camera,
  Upload,
  Check,
  Lock,
  Unlock,
  Settings,
  Eye,
  EyeOff,
  Shield,
  Database,
  Download,
  ChevronRight,
  ChevronLeft,
  Info,
  PlusCircle,
  Sparkles,
  Key,
  AlertTriangle,
  Calendar,
  MapPin,
  UserPlus,
  Filter,
  LogOut,
  RefreshCw,
  Clock,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Contact,
  Users,
  FileBadge,
  Wallet,
  GraduationCap,
  Activity,
  FileText,
  Home,
  AlertCircle,
  User,
  Search,
  Plus,
  X,
  Edit,
  Trash2,
  Camera,
  Upload,
  Check,
  Lock,
  Unlock,
  Settings,
  Eye,
  EyeOff,
  Shield,
  Database,
  Download,
  ChevronRight,
  ChevronLeft,
  Info,
  PlusCircle,
  Sparkles,
  Key,
  AlertTriangle,
  Calendar,
  MapPin,
  UserPlus,
  Filter,
  LogOut,
  RefreshCw,
  Clock,
};

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const LucideIcon: React.FC<LucideIconProps> = ({ name, className = '', size = 24 }) => {
  const IconComponent = iconMap[name] || FileText; // Default fallback is FileText
  return <IconComponent className={className} size={size} id={`icon-${name}`} />;
};
