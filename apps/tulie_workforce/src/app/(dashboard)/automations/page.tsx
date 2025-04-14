import { getN8nWorkflows } from "./actions";
import { AutomationsClient, N8nWorkflow } from "./client";

export default async function AutomationsPage() {
    const rawWorkflows = await getN8nWorkflows();

    const workflows: N8nWorkflow[] = rawWorkflows.map((wf: any) => {
        // Evaluate the nodes to figure out the trigger
        let triggerName = "Manual Trigger";
        let triggerType = "zap";

        const nodesList = wf.nodes || [];
        
        // Find a node that represents a trigger
        const triggerNode = nodesList.find((n: any) => 
            n.type.toLowerCase().includes('trigger') || 
            n.name.toLowerCase().includes('webhook')
        ) || nodesList[0];

        if (triggerNode) {
            triggerName = triggerNode.name;
            const t = triggerNode.type.toLowerCase();
            if (t.includes("webhook")) triggerType = "webhook";
            else if (t.includes("schedule") || t.includes("cron")) triggerType = "schedule";
            else if (t.includes("telegram")) triggerType = "telegram";
        }

        return {
            id: wf.id,
            name: wf.name || "Untitled Workflow",
            description: `Automated n8n workflow with ${nodesList.length} nodes.`,
            status: wf.active ? "active" : "inactive",
            trigger: triggerName,
            triggerType: triggerType,
            nodes: nodesList.map((n: any) => n.name).slice(0, 4), // show up to 4 nodes
            lastRun: wf.updatedAt,
            totalRuns: 0, // Execution counts aren't available in standard /workflows endpoint
            successRate: 100, // Mocked for UI
            recentExecutions: [], // Mocked for UI
            tags: ["n8n", wf.active ? "live" : "draft"],
        };
    });

    return <AutomationsClient workflows={workflows} />;
}
