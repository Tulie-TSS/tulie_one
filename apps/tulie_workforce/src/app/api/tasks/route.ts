import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mockAgents } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, agentId, priority } = body;

        if (!title || !description || !agentId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Get Agent details
        const agent = mockAgents.find(a => a.id === agentId);
        if (!agent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // 2. Create Task in Database
        const { data: task, error: taskError } = await supabase
            .from("tasks")
            .insert({
                user_id: user.id,
                agent_id: agentId,
                title,
                description,
                priority,
                status: "pending",
                metadata: {
                    agent_name: agent.name,
                    model: agent.model
                }
            })
            .select()
            .single();

        if (taskError) {
            return NextResponse.json({ error: taskError.message }, { status: 500 });
        }

        // 3. Trigger n8n Webhook (if URL exists)
        if (agent.webhookUrl) {
            try {
                // We don't await this if we want it to be async, 
                // but for now let's try calling it.
                fetch(agent.webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        taskId: task.id,
                        title: task.title,
                        description: task.description,
                        agentName: agent.name,
                        systemPrompt: agent.systemPrompt,
                        userId: user.id,
                    })
                }).catch(err => console.error("n8n trigger failed:", err));
            } catch (err) {
                console.error("Fetch error:", err);
            }
        }

        return NextResponse.json({ task }, { status: 201 });
    } catch (error) {
        console.error("[Tasks API] POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
