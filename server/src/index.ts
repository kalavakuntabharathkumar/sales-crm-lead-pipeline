import express from "express";
import { Pool } from "pg";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { z } from "zod";

const app = express();
app.use(express.json());
const port = Number(process.env.PORT || 4000);
const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://crm:crm@localhost:5432/crm" });
const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null });
const workflowQueue = new Queue("crm-workflows", { connection: redis });

const entitySchema = z.object({ name: z.string().min(1), owner: z.string().min(1) });
const opportunitySchema = z.object({ title: z.string().min(1), value: z.number().nonnegative(), stage: z.string().default("new") });

app.get("/health", (_req,res)=>res.json({ok:true, service:"crm-api"}));

app.get("/api/leads", async (_req,res)=>{
  const result = await pool.query("SELECT * FROM leads ORDER BY created_at DESC");
  res.json(result.rows);
});
app.post("/api/leads", async (req,res)=>{
  const parsed = entitySchema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:"Invalid lead"});
  const r = await pool.query("INSERT INTO leads(name,owner) VALUES($1,$2) RETURNING *",[parsed.data.name,parsed.data.owner]);
  res.status(201).json(r.rows[0]);
});
app.get("/api/opportunities", async (_req,res)=>{
  const result = await pool.query("SELECT * FROM opportunities ORDER BY created_at DESC");
  res.json(result.rows);
});
app.post("/api/opportunities", async (req,res)=>{
  const parsed = opportunitySchema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:"Invalid opportunity"});
  const r = await pool.query("INSERT INTO opportunities(title,value,stage) VALUES($1,$2,$3) RETURNING *",[parsed.data.title,parsed.data.value,parsed.data.stage]);
  await workflowQueue.add("opportunity.created",{opportunityId:r.rows[0].id});
  res.status(201).json(r.rows[0]);
});
app.get("/api/workflows", async (_req,res)=>{
  const r = await pool.query("SELECT * FROM workflows ORDER BY created_at DESC");
  res.json(r.rows);
});
app.post("/api/workflows", async (req,res)=>{
  const schema=z.object({name:z.string().min(1), event:z.string().min(1), condition:z.string().min(1), action:z.string().min(1)});
  const parsed=schema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:"Invalid workflow"});
  const r=await pool.query("INSERT INTO workflows(name,event,condition,action) VALUES($1,$2,$3,$4) RETURNING *",
    [parsed.data.name,parsed.data.event,parsed.data.condition,parsed.data.action]);
  res.status(201).json(r.rows[0]);
});

new Worker("crm-workflows", async job=>{
  console.log("Processing workflow event:", job.name, job.data);
}, {connection:redis});

app.listen(port, ()=>console.log(`CRM API listening on ${port}`));
