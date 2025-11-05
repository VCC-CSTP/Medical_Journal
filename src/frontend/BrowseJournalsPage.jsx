import React from "react";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export const BrowseJournalsPage = () => {
  const [organizations, setOrganizations] = useState([]);
  useEffect(() => {
    getOrganizations();
  }, []);

  async function getOrganizations() {
    const { data } = await supabase.from("organizations").select();
    setOrganizations(data);
  }

  return (
    <>
      <div>ConnectDatabase</div>
      <ul className="list-inside list-disc">
        {organizations.map((organization) => (
          <li key={organization.org_name}>{organization.org_name}</li>
        ))}
      </ul>
    </>
  );
};
