export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_credits: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: "earned" | "spent" | "purchased";
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: "earned" | "spent" | "purchased";
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: "earned" | "spent" | "purchased";
          description?: string;
          created_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          user_id: string;
          tool_type: "essay" | "paraphrase" | "grammar" | "citation" | "summarizer" | "powerpoint" | "plagiarism" | "research" | "rewrite";
          input_text: string;
          output_text: string;
          credits_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool_type: "essay" | "paraphrase" | "grammar" | "citation" | "summarizer" | "powerpoint" | "plagiarism" | "research" | "rewrite";
          input_text: string;
          output_text: string;
          credits_used: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tool_type?: "essay" | "paraphrase" | "grammar" | "citation" | "summarizer" | "powerpoint" | "plagiarism" | "research" | "rewrite";
          input_text?: string;
          output_text?: string;
          credits_used?: number;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          credits_purchased: number;
          payment_method: "zenopay";
          payment_status: "pending" | "completed" | "failed";
          transaction_id: string | null;
          phone_number: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          credits_purchased: number;
          payment_method: "zenopay";
          payment_status?: "pending" | "completed" | "failed";
          transaction_id?: string | null;
          phone_number: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          credits_purchased?: number;
          payment_method?: "mpesa" | "tigopesa" | "airtelmoney";
          payment_status?: "pending" | "completed" | "failed";
          transaction_id?: string | null;
          phone_number?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      assignment_groups: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      assignment_group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: "leader" | "member";
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: "leader" | "member";
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          role?: "leader" | "member";
          joined_at?: string;
        };
      };
      assignment_submissions: {
        Row: {
          id: string;
          user_id: string;
          submission_type: "individual" | "group";
          group_id: string | null;
          title: string;
          subject: string;
          academic_level: string;
          word_count: number;
          formatting_style: string;
          cover_page_data: Json;
          assignment_content: string;
          file_urls: string[];
          references: Json;
          status: "pending" | "under_review" | "approved" | "rejected" | "needs_revision";
          quality_score: number | null;
          reviewer_id: string | null;
          reviewer_feedback: string | null;
          reviewed_at: string | null;
          credits_awarded: number;
          credits_awarded_at: string | null;
          can_use_for_training: boolean;
          used_in_training: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          submission_type: "individual" | "group";
          group_id?: string | null;
          title: string;
          subject: string;
          academic_level: string;
          word_count: number;
          formatting_style: string;
          cover_page_data: Json;
          assignment_content: string;
          file_urls?: string[];
          references?: Json;
          status?: "pending" | "under_review" | "approved" | "rejected" | "needs_revision";
          quality_score?: number | null;
          reviewer_id?: string | null;
          reviewer_feedback?: string | null;
          reviewed_at?: string | null;
          credits_awarded?: number;
          credits_awarded_at?: string | null;
          can_use_for_training?: boolean;
          used_in_training?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          submission_type?: "individual" | "group";
          group_id?: string | null;
          title?: string;
          subject?: string;
          academic_level?: string;
          word_count?: number;
          formatting_style?: string;
          cover_page_data?: Json;
          assignment_content?: string;
          file_urls?: string[];
          references?: Json;
          status?: "pending" | "under_review" | "approved" | "rejected" | "needs_revision";
          quality_score?: number | null;
          reviewer_id?: string | null;
          reviewer_feedback?: string | null;
          reviewed_at?: string | null;
          credits_awarded?: number;
          credits_awarded_at?: string | null;
          can_use_for_training?: boolean;
          used_in_training?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      submission_reviews: {
        Row: {
          id: string;
          submission_id: string;
          reviewer_id: string;
          content_quality: number | null;
          formatting_compliance: number | null;
          originality: number | null;
          academic_rigor: number | null;
          overall_score: number | null;
          feedback: string | null;
          recommendation: "approve" | "reject" | "needs_revision" | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          reviewer_id: string;
          content_quality?: number | null;
          formatting_compliance?: number | null;
          originality?: number | null;
          academic_rigor?: number | null;
          overall_score?: number | null;
          feedback?: string | null;
          recommendation?: "approve" | "reject" | "needs_revision" | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          reviewer_id?: string;
          content_quality?: number | null;
          formatting_compliance?: number | null;
          originality?: number | null;
          academic_rigor?: number | null;
          overall_score?: number | null;
          feedback?: string | null;
          recommendation?: "approve" | "reject" | "needs_revision" | null;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_type: string;
          achievement_name: string;
          description: string | null;
          credits_bonus: number;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_type: string;
          achievement_name: string;
          description?: string | null;
          credits_bonus?: number;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_type?: string;
          achievement_name?: string;
          description?: string | null;
          credits_bonus?: number;
          earned_at?: string;
        };
      };
      user_leaderboard: {
        Row: {
          user_id: string;
          total_submissions: number;
          approved_submissions: number;
          total_credits_earned: number;
          quality_average: number;
          rank_position: number | null;
          last_updated: string;
        };
        Insert: {
          user_id: string;
          total_submissions?: number;
          approved_submissions?: number;
          total_credits_earned?: number;
          quality_average?: number;
          rank_position?: number | null;
          last_updated?: string;
        };
        Update: {
          user_id?: string;
          total_submissions?: number;
          approved_submissions?: number;
          total_credits_earned?: number;
          quality_average?: number;
          rank_position?: number | null;
          last_updated?: string;
        };
      };
    };
  };
}

