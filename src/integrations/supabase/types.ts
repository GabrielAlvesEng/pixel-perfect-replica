export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cut_items: {
        Row: {
          id: string
          kgm: number
          length_mm: number
          material: string
          pos: string
          position: number
          profile: string
          project_id: string
          qty: number
          status: string
          weld_code: string
          weld_title: string
        }
        Insert: {
          id?: string
          kgm?: number
          length_mm?: number
          material?: string
          pos?: string
          position?: number
          profile?: string
          project_id: string
          qty?: number
          status?: string
          weld_code?: string
          weld_title?: string
        }
        Update: {
          id?: string
          kgm?: number
          length_mm?: number
          material?: string
          pos?: string
          position?: number
          profile?: string
          project_id?: string
          qty?: number
          status?: string
          weld_code?: string
          weld_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "cut_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      material_items: {
        Row: {
          assembly: string
          description: string
          id: string
          item: string
          position: number
          project_id: string
          qty: number
          spec: string
          title: string
          unit: string
        }
        Insert: {
          assembly?: string
          description?: string
          id?: string
          item?: string
          position?: number
          project_id: string
          qty?: number
          spec?: string
          title?: string
          unit?: string
        }
        Update: {
          assembly?: string
          description?: string
          id?: string
          item?: string
          position?: number
          project_id?: string
          qty?: number
          spec?: string
          title?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          username?: string
        }
        Relationships: []
      }
      project_checks: {
        Row: {
          code: string
          id: string
          message: string
          project_id: string
          severity: string
        }
        Insert: {
          code?: string
          id?: string
          message?: string
          project_id: string
          severity?: string
        }
        Update: {
          code?: string
          id?: string
          message?: string
          project_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_checks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_items: {
        Row: {
          file: string
          folder: string
          id: string
          item_type: string
          kind: string
          name: string
          position: number
          project_id: string
          qty: number
        }
        Insert: {
          file?: string
          folder?: string
          id?: string
          item_type?: string
          kind?: string
          name?: string
          position?: number
          project_id: string
          qty?: number
        }
        Update: {
          file?: string
          folder?: string
          id?: string
          item_type?: string
          kind?: string
          name?: string
          position?: number
          project_id?: string
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_nodes: {
        Row: {
          code: string
          id: string
          node_type: string
          parent_id: string | null
          position: number
          project_id: string
          qty_parent: number
          qty_total: number
          status: string
          title3: string
        }
        Insert: {
          code?: string
          id?: string
          node_type?: string
          parent_id?: string | null
          position?: number
          project_id: string
          qty_parent?: number
          qty_total?: number
          status?: string
          title3?: string
        }
        Update: {
          code?: string
          id?: string
          node_type?: string
          parent_id?: string | null
          position?: number
          project_id?: string
          qty_parent?: number
          qty_total?: number
          status?: string
          title3?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_nodes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          order_no: string
          read_at: string | null
          status: string
          title1: string
          title2: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          order_no?: string
          read_at?: string | null
          status?: string
          title1?: string
          title2?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          order_no?: string
          read_at?: string | null
          status?: string
          title1?: string
          title2?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sheets: {
        Row: {
          code: string
          h_mm: number
          holes: number
          id: string
          material: string
          name: string
          position: number
          project_id: string
          qty: number
          shape: string
          thickness: string
          w_mm: number
        }
        Insert: {
          code?: string
          h_mm?: number
          holes?: number
          id?: string
          material?: string
          name?: string
          position?: number
          project_id: string
          qty?: number
          shape?: string
          thickness?: string
          w_mm?: number
        }
        Update: {
          code?: string
          h_mm?: number
          holes?: number
          id?: string
          material?: string
          name?: string
          position?: number
          project_id?: string
          qty?: number
          shape?: string
          thickness?: string
          w_mm?: number
        }
        Relationships: [
          {
            foreignKeyName: "sheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
