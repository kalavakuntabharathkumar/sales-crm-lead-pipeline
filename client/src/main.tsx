import React from "react"; import {createRoot} from "react-dom/client"; import "./style.css";
function App(){const [leads,setLeads]=React.useState<any[]>([]); const [title,setTitle]=React.useState("");
async function load(){const r=await fetch("http://localhost:4000/api/leads");setLeads(await r.json())}
React.useEffect(()=>{load()},[]);
async function add(){if(!title)return;await fetch("http://localhost:4000/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:title,owner:"demo-user"})});setTitle("");load()}
return <main><h1>Sales CRM</h1><p>Leads, opportunities and workflow automation</p><section><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Lead name"/><button onClick={add}>Add lead</button></section><h2>Leads</h2><ul>{leads.map(l=><li key={l.id}>{l.name} — {l.owner}</li>)}</ul></main>}
createRoot(document.getElementById("root")!).render(<App/>);
