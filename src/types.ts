import { Session } from '@supabase/supabase-js';

export interface Database {
  public: {
    Tables: {
      notifications: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          type: string;
          title: string;
          message: string;
          severity: 'low' | 'medium' | 'high';
          status: 'new' | 'acknowledged' | 'resolved';
          timestamp: string;
          site: string | null;
          topic_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          type?: string;
          title: string;
          message: string;
          severity?: 'low' | 'medium' | 'high';
          status?: 'new' | 'acknowledged' | 'resolved';
          timestamp?: string;
          site?: string | null;
          topic_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          type?: string;
          title?: string;
          message?: string;
          severity?: 'low' | 'medium' | 'high';
          status?: 'new' | 'acknowledged' | 'resolved';
          timestamp?: string;
          site?: string | null;
          topic_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          }
        ];
      };
      topics: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      topic_subscriptions: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          topic_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          topic_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          topic_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "topic_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "topic_subscriptions_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          }
        ];
      };
      monitored_sites: {
        Row: MonitoredSite;
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          url: string;
          description?: string | null;
          country: string;
          region?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          check_interval?: number;
          timeout_seconds?: number;
          expected_status_code?: number;
          status?: SiteStatus;
          last_checked_at?: string | null;
          last_response_time?: number | null;
          last_error?: string | null;
          tags?: string[];
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          url?: string;
          description?: string | null;
          country?: string;
          region?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          check_interval?: number;
          timeout_seconds?: number;
          expected_status_code?: number;
          status?: SiteStatus;
          last_checked_at?: string | null;
          last_response_time?: number | null;
          last_error?: string | null;
          tags?: string[];
          is_active?: boolean;
        };
      };
      site_monitoring_logs: {
        Row: SiteMonitoringLog;
        Insert: {
          id?: string;
          site_id: string;
          checked_at?: string;
          status: 'up' | 'down' | 'timeout' | 'error';
          response_time?: number | null;
          status_code?: number | null;
          error_message?: string | null;
          response_headers?: Record<string, any> | null;
          response_size?: number | null;
        };
        Update: {
          id?: string;
          site_id?: string;
          checked_at?: string;
          status?: 'up' | 'down' | 'timeout' | 'error';
          response_time?: number | null;
          status_code?: number | null;
          error_message?: string | null;
          response_headers?: Record<string, any> | null;
          response_size?: number | null;
        };
      };
      comments: {
        Row: {
          id: string;
          created_at: string;
          notification_id: string;
          user_id: string;
          text: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          notification_id: string;
          user_id: string;
          text: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          notification_id?: string;
          user_id?: string;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_notification_id_fkey";
            columns: ["notification_id"];
            isOneToOne: false;
            referencedRelation: "notifications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      onesignal_players: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          player_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          player_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          player_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "onesignal_players_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      site_monitoring_dashboard: {
        Row: SiteMonitoringDashboard;
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  CH: 'Switzerland',
  AT: 'Austria',
  BE: 'Belgium',
  IE: 'Ireland',
  PL: 'Poland',
  CZ: 'Czech Republic',
  HU: 'Hungary',
  RO: 'Romania',
  BG: 'Bulgaria',
  HR: 'Croatia',
  SI: 'Slovenia',
  SK: 'Slovakia',
  LT: 'Lithuania',
  LV: 'Latvia',
  EE: 'Estonia',
  RU: 'Russia',
  UA: 'Ukraine',
  JP: 'Japan',
  KR: 'South Korea',
  CN: 'China',
  IN: 'India',
  SG: 'Singapore',
  HK: 'Hong Kong',
  TW: 'Taiwan',
  TH: 'Thailand',
  MY: 'Malaysia',
  ID: 'Indonesia',
  PH: 'Philippines',
  VN: 'Vietnam',
  AU: 'Australia',
  NZ: 'New Zealand',
  BR: 'Brazil',
  MX: 'Mexico',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  VE: 'Venezuela',
  ZA: 'South Africa',
  EG: 'Egypt',
  NG: 'Nigeria',
  KE: 'Kenya',
  MA: 'Morocco',
  GH: 'Ghana',
  TN: 'Tunisia',
  DZ: 'Algeria',
  IL: 'Israel',
  TR: 'Turkey',
  SA: 'Saudi Arabia',
  AE: 'United Arab Emirates',
  QA: 'Qatar',
  KW: 'Kuwait',
  BH: 'Bahrain',
  OM: 'Oman',
  JO: 'Jordan',
  LB: 'Lebanon',
  IQ: 'Iraq',
  IR: 'Iran',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  LK: 'Sri Lanka',
  NP: 'Nepal',
  MM: 'Myanmar',
  KH: 'Cambodia',
  LA: 'Laos'
};

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export type Severity = 'low' | 'medium' | 'high';
export type NotificationStatus = 'new' | 'acknowledged' | 'resolved';

export interface Comment {
  id: string;
  text: string;
  created_at: string;
  notification_id: string;
  user_id: string;
  user_email: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: Severity;
  status: NotificationStatus;
  timestamp: string;
  site: string | null;
  comments: Comment[];
  topic_id: string | null;
  created_at: string;
  updated_at: string;
}

export type NotificationUpdatePayload = Database['public']['Tables']['notifications']['Update'];

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  subscribed?: boolean;
  subscription_id?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  notificationId: string;
}

export interface SystemStatusData {
  service: 'Ready' | 'Error';
  database: 'Connected' | 'Disconnected';
  push: 'Supported' | 'Unsupported' | 'OneSignal';
  subscription: 'Active' | 'Inactive';
}

export interface OneSignalPlayer {
  id: string;
  user_id: string;
  player_id: string;
  created_at: string;
  updated_at: string;
}

export interface MonitoredSite {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  url: string;
  description: string | null;
  country: string;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  check_interval: number;
  timeout_seconds: number;
  expected_status_code: number;
  status: SiteStatus;
  last_checked_at: string | null;
  last_response_time: number | null;
  last_error: string | null;
  tags: string[];
  is_active: boolean;
}

export type SiteStatus = 'up' | 'down' | 'unknown' | 'maintenance';

export interface SiteMonitoringLog {
  id: string;
  site_id: string;
  checked_at: string;
  status: 'up' | 'down' | 'timeout' | 'error';
  response_time: number | null;
  status_code: number | null;
  error_message: string | null;
  response_headers: Record<string, any> | null;
  response_size: number | null;
}

export interface SiteMonitoringDashboard extends MonitoredSite {
  uptime_24h: number;
  checks_24h: number;
}

export type { Session };
