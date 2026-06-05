import { createClient } from '@/lib/supabase-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Helper to get admin client with service role to query all tables securely
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET /api/crm-sync
// Fetches unsynced B2B contract milestones and B2C retail orders
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminDb = getAdminClient()

    // 1. Fetch all tasks to map synced items
    const { data: tasks, error: tasksError } = await adminDb
      .from('tasks')
      .select('id, title, status, metadata')
    
    if (tasksError) throw tasksError

    const milestoneTasksMap = new Map()
    const orderTasksMap = new Map()

    tasks?.forEach((t: any) => {
      if (t.metadata && typeof t.metadata === 'object') {
        const milestoneId = t.metadata.crm_milestone_id
        if (milestoneId) {
          milestoneTasksMap.set(milestoneId, {
            id: t.id,
            title: t.title,
            status: t.status,
          })
        }

        const orderCode = t.metadata.crm_order_code
        if (orderCode) {
          if (!orderTasksMap.has(orderCode)) {
            orderTasksMap.set(orderCode, [])
          }
          orderTasksMap.get(orderCode).push({
            id: t.id,
            title: t.title,
            status: t.status,
          })
        }
      }
    })

    // 2. Fetch B2B Milestones
    const { data: milestones, error: msError } = await adminDb
      .from('contract_milestones')
      .select('id, name, description, due_date, status, contract_id, type, amount, contract:contracts(id, title, project_id)')
      .order('due_date', { ascending: true })

    if (msError) throw msError

    // 3. Fetch B2C Retail Orders
    const { data: orders, error: orderError } = await adminDb
      .from('retail_orders')
      .select('id, order_number, customer_name, customer_phone, order_date, delivery_type, order_status, total_amount')
      .in('order_status', ['pending', 'shooting', 'editing'])
      .order('order_date', { ascending: true })

    if (orderError) throw orderError

    // 4. Map outputs
    const mappedMilestones = (milestones || []).map((m: any) => ({
      ...m,
      syncedTask: milestoneTasksMap.get(m.id) || null,
    }))

    const mappedOrders = (orders || []).map((o: any) => ({
      ...o,
      syncedTasks: orderTasksMap.get(o.order_number) || [],
    }))

    return NextResponse.json({
      milestones: mappedMilestones,
      orders: mappedOrders,
    })
  } catch (err: any) {
    console.error('Error fetching CRM sync data:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/crm-sync
// Imports selected milestones and orders as workspace tasks
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { milestoneIds = [], orderIds = [] } = await request.json()
    const adminDb = getAdminClient()

    let syncedMilestonesCount = 0
    let syncedOrdersCount = 0

    // 1. Process B2B Milestones
    if (milestoneIds.length > 0) {
      const { data: milestones } = await adminDb
        .from('contract_milestones')
        .select('*, contract:contracts(id, title, project_id)')
        .in('id', milestoneIds)

      for (const m of (milestones || [])) {
        // Fetch project or fallback
        let projectId = m.project_id || m.contract?.project_id
        
        if (projectId) {
          // Verify project exists in public.projects
          const { data: projExists } = await adminDb
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .maybeSingle()

          if (!projExists) {
            // Find CRM project title if possible
            const { data: crmProj } = await adminDb.from('projects').select('name').eq('id', projectId).maybeSingle()
            const pName = crmProj?.name || m.contract?.title || 'Dự án Hợp đồng CRM'
            
            // Get active cycle
            const { data: activeCycle } = await adminDb.from('cycles').select('id').eq('status', 'active').limit(1).maybeSingle()
            const { data: firstCycle } = await adminDb.from('cycles').select('id').limit(1).maybeSingle()
            const cycleId = activeCycle?.id || firstCycle?.id

            // Get default organization
            const { data: defaultOrg } = await adminDb.from('organizations').select('id').limit(1).maybeSingle()
            const orgId = defaultOrg?.id

            if (cycleId && orgId) {
              await adminDb.from('projects').insert({
                id: projectId,
                name: pName,
                cycle_id: cycleId,
                organization_id: orgId,
                status: 'active',
                priority: 'medium',
                owner_id: user.id,
              })
            } else {
              // Fallback to first project
              const { data: firstProj } = await adminDb.from('projects').select('id').limit(1).maybeSingle()
              projectId = firstProj?.id || null
            }
          }
        } else {
          // Fallback to first project
          const { data: firstProj } = await adminDb.from('projects').select('id').limit(1).maybeSingle()
          projectId = firstProj?.id || null
        }

        if (!projectId) {
          throw new Error(`Không thể tìm thấy hoặc khởi tạo Dự án (Project) để gán cho mốc: ${m.name}`)
        }

        // Determine prefixes
        let prefix = '📋 [Giai đoạn] '
        if (m.type === 'payment') {
          prefix = '💰 [Thanh toán] '
        } else if (m.type === 'delivery') {
          prefix = '📦 [Nghiệm thu] '
        }
        const taskTitle = prefix + m.name

        // Mapped status
        let taskStatus = 'ready'
        if (m.status === 'completed') {
          taskStatus = 'done'
        } else if (m.status === 'in_progress') {
          taskStatus = 'doing'
        }

        // Check if task exists
        const { data: existingTask } = await adminDb
          .from('tasks')
          .select('id')
          .eq('metadata->>crm_milestone_id', m.id)
          .maybeSingle()

        const nowStr = new Date().toISOString()

        if (existingTask) {
          await adminDb
            .from('tasks')
            .update({
              title: taskTitle,
              description: m.description || undefined,
              requested_deadline: m.due_date ? new Date(m.due_date).toISOString() : undefined,
              status: m.status === 'completed' ? 'done' : undefined,
              actual_end: m.status === 'completed' ? nowStr : undefined,
              updated_at: nowStr,
            })
            .eq('id', existingTask.id)
        } else {
          const taskId = `tk_${Date.now()}_${Math.floor(Math.random() * 1000)}`
          await adminDb
            .from('tasks')
            .insert({
              id: taskId,
              title: taskTitle,
              description: m.description || null,
              project_id: projectId,
              created_by: user.id,
              assigned_to: user.id,
              status: taskStatus,
              estimated_effort_hours: 2.0,
              priority: 0,
              requested_deadline: m.due_date ? new Date(m.due_date).toISOString() : null,
              metadata: { crm_milestone_id: m.id, type: 'milestone' },
              created_at: nowStr,
              updated_at: nowStr,
            })
        }
        syncedMilestonesCount++
      }
    }

    // 2. Process B2C Retail Orders
    if (orderIds.length > 0) {
      const { data: orders } = await adminDb
        .from('retail_orders')
        .select('*')
        .in('id', orderIds)

      // Find B2C project
      const { data: matchingProjects } = await adminDb
        .from('projects')
        .select('id')
        .ilike('name', '%B2C%')
        .limit(1)
      
      let b2cProjectId = matchingProjects && matchingProjects.length > 0 ? matchingProjects[0].id : null
      if (!b2cProjectId) {
        const { data: firstProj } = await adminDb.from('projects').select('id').limit(1).maybeSingle()
        b2cProjectId = firstProj?.id || null
      }

      if (!b2cProjectId) {
        throw new Error('Hệ thống chưa có Dự án (Project) nào. Vui lòng tạo dự án trước.')
      }

      for (const o of (orders || [])) {
        // Check if tasks exist
        const { data: existingTasks } = await adminDb
          .from('tasks')
          .select('id, title, status')
          .eq('metadata->>crm_order_code', o.order_number)

        const orderPrefix = `${o.customer_name} (${o.order_number})`
        const descSuffix = `\n\nĐơn hàng: ${o.order_number}\nKhách hàng: ${o.customer_name}\nSĐT: ${o.customer_phone || 'N/A'}`

        if (existingTasks && existingTasks.length > 0) {
          // Update status if completed or cancelled
          if (o.order_status === 'completed' || o.order_status === 'cancelled') {
            const targetStatus = o.order_status === 'completed' ? 'done' : 'rejected'
            for (const t of existingTasks) {
              if (t.status !== 'done' && t.status !== 'rejected') {
                await adminDb
                  .from('tasks')
                  .update({ status: targetStatus, updated_at: new Date().toISOString() })
                  .eq('id', t.id)
              }
            }
          } else if (o.order_status === 'editing') {
            for (const t of existingTasks) {
              if (t.title.includes('Chụp ảnh') && t.status !== 'done') {
                await adminDb
                  .from('tasks')
                  .update({ status: 'done', updated_at: new Date().toISOString() })
                  .eq('id', t.id)
              }
              if (t.title.includes('Hậu kỳ') && t.status === 'backlog') {
                await adminDb
                  .from('tasks')
                  .update({ status: 'ready', updated_at: new Date().toISOString() })
                  .eq('id', t.id)
              }
            }
          }
        } else {
          // Insert standard tasks
          const tasksToInsert = []
          const baseDate = new Date(o.order_date).getTime()
          const offsetDays = (days: number) => new Date(baseDate + days * 24 * 60 * 60 * 1000).toISOString()

          // 1. Shooting
          tasksToInsert.push({
            id: `tk_${Date.now()}_1`,
            title: `📸 Chụp ảnh: ${orderPrefix}`,
            description: `Tiến hành chụp hình cho khách hàng theo lịch hẹn.${descSuffix}`,
            status: o.order_status === 'shooting' ? 'doing' : (o.order_status === 'editing' ? 'done' : 'ready'),
            project_id: b2cProjectId,
            created_by: user.id,
            assigned_to: user.id,
            estimated_effort_hours: 2.0,
            priority: 0,
            requested_deadline: o.order_date,
            metadata: { crm_order_code: o.order_number, crm_order_id: o.id, type: 'order' }
          })

          // 2. Editing
          tasksToInsert.push({
            id: `tk_${Date.now()}_2`,
            title: `🎨 Hậu kỳ: ${orderPrefix}`,
            description: `Lọc ảnh, chỉnh sửa màu sắc, làm mịn da theo yêu cầu.${descSuffix}`,
            status: o.order_status === 'editing' ? 'ready' : 'backlog',
            project_id: b2cProjectId,
            created_by: user.id,
            assigned_to: user.id,
            estimated_effort_hours: 2.0,
            priority: 0,
            requested_deadline: offsetDays(3),
            metadata: { crm_order_code: o.order_number, crm_order_id: o.id, type: 'order' }
          })

          if (o.delivery_type === 'physical') {
            // 3. Printing
            tasksToInsert.push({
              id: `tk_${Date.now()}_3`,
              title: `🖨️ In ảnh: ${orderPrefix}`,
              description: `Gửi file đã retouch sang xưởng in ảnh gỗ/album/khung.${descSuffix}`,
              status: 'backlog',
              project_id: b2cProjectId,
              created_by: user.id,
              assigned_to: user.id,
              estimated_effort_hours: 2.0,
              priority: 0,
              requested_deadline: offsetDays(5),
              metadata: { crm_order_code: o.order_number, crm_order_id: o.id, type: 'order' }
            })

            // 4. Shipping
            tasksToInsert.push({
              id: `tk_${Date.now()}_4`,
              title: `🚚 Giao hàng: ${orderPrefix}`,
              description: `Đóng gói cẩn thận và liên hệ ship giao sản phẩm tận tay khách hàng.${descSuffix}`,
              status: 'backlog',
              project_id: b2cProjectId,
              created_by: user.id,
              assigned_to: user.id,
              estimated_effort_hours: 2.0,
              priority: 0,
              requested_deadline: offsetDays(7),
              metadata: { crm_order_code: o.order_number, crm_order_id: o.id, type: 'order' }
            })
          } else {
            // 3. Digital Delivery
            tasksToInsert.push({
              id: `tk_${Date.now()}_3`,
              title: `✅ Bàn giao file: ${orderPrefix}`,
              description: `Tải ảnh lên Drive/Dropbox, gửi link chất lượng cao cho khách.${descSuffix}`,
              status: 'backlog',
              project_id: b2cProjectId,
              created_by: user.id,
              assigned_to: user.id,
              estimated_effort_hours: 2.0,
              priority: 0,
              requested_deadline: offsetDays(4),
              metadata: { crm_order_code: o.order_number, crm_order_id: o.id, type: 'order' }
            })
          }

          const { error: insErr } = await adminDb.from('tasks').insert(tasksToInsert)
          if (insErr) throw insErr
        }
        syncedOrdersCount++
      }
    }

    return NextResponse.json({
      success: true,
      milestonesCount: syncedMilestonesCount,
      ordersCount: syncedOrdersCount,
    })
  } catch (err: any) {
    console.error('Error executing CRM sync:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
