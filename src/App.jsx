import { useState, useEffect } from 'react'
import './App.css'
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);


function App() {
 const [organizations, setOrganizations] = useState([]);
 useEffect(() => {
   getInstruments();
 }, []);

  async function getInstruments() {
    const { data } = await supabase.from("organizations").select();
    setOrganizations(data);
  }

  return (
    <>
      <ul>
        {organizations.map((organization) => (
          <li key={organization.org_name}>{organization.org_name}</li>
        ))}
      </ul>

    </>
  );
}

export default App
