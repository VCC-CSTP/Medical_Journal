import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

/**
 * Custom hook to fetch journals from Supabase with various options
 * @param {Object} options - Configuration options
 * @param {boolean} options.featuredOnly - Fetch only featured journals
 * @param {string} options.category - Filter by subject area category
 * @param {string} options.status - Filter by journal status (default: 'active')
 * @param {number} options.limit - Limit number of results
 * @param {string} options.sortBy - Field to sort by (default: 'full_title')
 * @param {boolean} options.ascending - Sort direction (default: true)
 * @returns {Object} { journals, loading, error, refetch }
 */
export const useJournals = (options = {}) => {
  const {
    featuredOnly = false,
    category = null,
    status = "active",
    limit = null,
    sortBy = "full_title",
    ascending = true,
  } = options;

  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Start building the query
      let query = supabase.from("journals").select(`
          *,
          publisher:organizations!journals_publisher_org_id_fkey(
            id,
            org_name,
            org_acronym,
            org_type,
            website_url,
            logo_url
          ),
          society:organizations!journals_society_org_id_fkey(
            id,
            org_name,
            org_acronym,
            org_type,
            website_url,
            logo_url
          )
        `);

      // Apply filters
      if (status) {
        query = query.eq("status", status);
      }

      if (featuredOnly) {
        query = query.eq("is_featured", true);
      }

      if (category) {
        query = query.contains("subject_area", [category]);
      }

      // Filter out soft-deleted records
      query = query.is("deleted_at", null);

      // Apply sorting
      query = query.order(sortBy, { ascending });

      // Apply limit if specified
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform data to match the component structure
      const transformedJournals = data.map((journal) => ({
        id: journal.id,
        title: journal.full_title,
        shortTitle: journal.short_title,
        acronym: journal.acronym,
        href: `/journals/${journal.id}`,
        description:
          journal.description ||
          journal.aims_scope ||
          "No description available",
        imageUrl:
          journal.cover_image_url ||
          journal.banner_image_url ||
          "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop",
        category: {
          title: journal.subject_area?.[0] || "General",
          href: `/journals/category/${journal.subject_area?.[0] || "general"}`,
        },
        publisher: journal.publisher?.org_name || "Unknown Publisher",
        publisherLogo: journal.publisher?.logo_url,
        society: journal.society?.org_name,
        journalType: journal.journal_type,
        peerReviewType: journal.peer_review_type,
        issn: journal.issn_print || journal.issn_online,
        issnPrint: journal.issn_print,
        issnOnline: journal.issn_online,
        eissn: journal.e_issn,
        language: journal.language,
        frequency: journal.publication_frequency,
        firstYear: journal.first_publication_year,
        isFeatured: journal.is_featured,
        isIndexed: journal.is_indexed,
        viewsCount: journal.views_count || 0,
        downloadsCount: journal.downloads_count || 0,
        journalUrl: journal.website_url,
        email: journal.email,
        // Raw data for detail page
        rawData: journal,
      }));

      setJournals(transformedJournals);
    } catch (err) {
      console.error("Error fetching journals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [featuredOnly, category, status, limit, sortBy, ascending]);

  return { journals, loading, error, refetch: fetchJournals };
};

/**
 * Hook to fetch a single journal by ID
 * @param {string} journalId - Journal UUID
 * @returns {Object} { journal, loading, error }
 */
export const useJournal = (journalId) => {
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJournal = async () => {
      if (!journalId) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("journals")
          .select(
            `
            *,
            publisher:organizations!journals_publisher_org_id_fkey(
              id,
              org_name,
              org_acronym,
              org_type,
              website_url,
              email,
              phone,
              address,
              city,
              country,
              logo_url
            ),
            society:organizations!journals_society_org_id_fkey(
              id,
              org_name,
              org_acronym,
              org_type,
              website_url,
              email,
              logo_url
            ),
            indexing:journal_indexing(
              id,
              indexed_since,
              status,
              service:indexing_services(
                service_name,
                service_acronym,
                website_url,
                logo_url
              )
            ),
            editorial_team:journal_editorial_team(
              id,
              role,
              role_type,
              is_active,
              person:people(
                id,
                full_name,
                title,
                affiliation,
                photo_url,
                email
              )
            )
          `
          )
          .eq("id", journalId)
          .is("deleted_at", null)
          .single();

        if (fetchError) throw fetchError;

        setJournal(data);
      } catch (err) {
        console.error("Error fetching journal:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [journalId]);

  return { journal, loading, error };
};

/**
 * Hook to get unique categories from journals
 * @returns {Object} { categories, loading, error }
 */
export const useJournalCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("journals")
          .select("subject_area")
          .eq("status", "active")
          .is("deleted_at", null);

        if (fetchError) throw fetchError;

        // Extract and flatten all categories
        const allCategories = data.reduce((acc, journal) => {
          if (journal.subject_area) {
            acc.push(...journal.subject_area);
          }
          return acc;
        }, []);

        // Get unique categories and count
        const categoryCount = allCategories.reduce((acc, cat) => {
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});

        const uniqueCategories = Object.entries(categoryCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
