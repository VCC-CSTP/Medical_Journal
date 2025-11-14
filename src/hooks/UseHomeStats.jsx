import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

/**
 * Custom hook to fetch statistics for the homepage  sync
 * Returns counts for journals, resources, peer reviewers, and editors
 * @returns {Object} { stats, loading, error }
 */
export const useHomeStats = () => {
  const [stats, setStats] = useState({
    journals: 0,
    resources: 0,
    peerReviewers: 0,
    editors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all statistics in parallel
        const [
          journalsResult,
          resourcesResult,
          peerReviewersResult,
          editorsResult,
        ] = await Promise.all([
          // Count active journals
          supabase
            .from("journals")
            .select("id", { count: "exact", head: true })
            .eq("status", "active")
            .is("deleted_at", null),

          // Count all journals as resources (or you can change this to count from a different table)
          // Alternative: Count total published articles/content if you have that table
          supabase
            .from("journals")
            .select("id", { count: "exact", head: true })
            .is("deleted_at", null),

          // Count users with 'reviewer' role from user_profiles
          supabase
            .from("user_profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "reviewer")
            .eq("approval_status", "approved"),

          // Count unique editors from journal editorial team
          supabase
            .from("journal_editorial_team")
            .select("person_id", { count: "exact", head: true })
            .in("role_type", ["editor_in_chief", "associate_editor"])
            .eq("is_active", true),
        ]);

        // Check for errors
        if (journalsResult.error) throw journalsResult.error;
        if (resourcesResult.error) throw resourcesResult.error;
        if (peerReviewersResult.error) throw peerReviewersResult.error;
        if (editorsResult.error) throw editorsResult.error;

        setStats({
          journals: journalsResult.count || 0,
          resources: resourcesResult.count || 0,
          peerReviewers: peerReviewersResult.count || 0,
          editors: editorsResult.count || 0,
        });
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError(err.message);
        // Set fallback values
        setStats({
          journals: 0,
          resources: 0,
          peerReviewers: 0,
          editors: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};
