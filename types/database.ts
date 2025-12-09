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
    };
  };
}

