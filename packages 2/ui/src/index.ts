/**
 * Tulie Design System v2.0
 * @repo/ui — Shared component library
 *
 * Source of truth: CRM Production
 * Color space: OKLCH
 * Palette: Black & White premium + vibrant accents
 */

// ─── Tier 1: UI Primitives ───────────────────────────────

// Form Controls
export { Button, buttonVariants } from "./components/button"
export { Input } from "./components/input"
export { Textarea } from "./components/textarea"
export { Label } from "./components/label"
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./components/select"
export { Checkbox } from "./components/checkbox"
export { RadioGroup, RadioGroupItem } from "./components/radio-group"
export { Switch } from "./components/switch"
export { Slider } from "./components/slider"
export { Calendar } from "./components/calendar"
export { PriceInput } from "./components/price-input"

// Data Display
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "./components/card"
export { Badge, badgeVariants } from "./components/badge"
export { Avatar, AvatarImage, AvatarFallback } from "./components/avatar"
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./components/table"
export { Progress } from "./components/progress"
export { Separator } from "./components/separator"
export { Skeleton } from "./components/skeleton"
export { ScrollArea, ScrollBar } from "./components/scroll-area"
export { Alert, AlertTitle, AlertDescription } from "./components/alert"

// Feedback
export { LoadingSpinner } from "./components/loading-spinner"
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./components/tooltip"
export { Toaster as Sonner } from "./components/sonner"

// Overlay / Modal
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./components/dialog"
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/alert-dialog"
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/sheet"
export { Popover, PopoverContent, PopoverTrigger } from "./components/popover"
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./components/dropdown-menu"
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./components/command"

// Navigation
export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants } from "./components/tabs"
export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./components/breadcrumb"
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/accordion"
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./components/sidebar"
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./components/collapsible"

// Hooks
export { useIsMobile } from "./hooks/use-mobile"

// Composite Inputs
export { DatePicker } from "./components/date-picker"
export { Combobox } from "./components/combobox"
export { ConfirmProvider, useConfirm } from "./components/confirm-dialog"

// ─── Tier 2: Pattern Components ──────────────────────────

export { PageLayout } from "./patterns/page-layout"
export { PageHeader } from "./patterns/page-header"
export { EmptyState } from "./patterns/empty-state"
export { StatCard, StatGrid } from "./patterns/stat-card"
export { FormField, FormSection } from "./patterns/form-field"
export { DetailLayout } from "./patterns/detail-layout"
export {
  PageSkeleton,
  CardSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "./patterns/loading-state"

// Layout
export {
  AppShell,
  useSidebar as useAppShellSidebar,
  type NavItem,
  type NavGroup,
  type AppShellUser,
} from "./patterns/app-shell"

// Activity
export {
  ActivityTimeline,
  ActivityTimelineItem,
  type TimelineUser,
} from "./patterns/activity-timeline"

// File management
export {
  FileUpload,
  type UploadFile,
} from "./patterns/file-upload"

// Notifications
export {
  NotificationCenter,
  type Notification,
  type NotificationType,
} from "./patterns/notification-center"

// Workflow
export { Stepper, StepperStep } from "./patterns/stepper"

// Page Templates
export { ListPageTemplate } from "./patterns/list-page-template"
export { DashboardTemplate } from "./patterns/dashboard-template"
export { SettingsTemplate, type SettingsSection } from "./patterns/settings-template"

// ─── Tier 3: Composite Components ────────────────────────

export { DataTable } from "./composites/data-table"
export { DataTableColumnHeader } from "./composites/data-table-column-header"
export { StatusBadge } from "./composites/status-badge"
export { CopyButton } from "./composites/copy-button"
export { ThemeProvider } from "./composites/theme-provider"
export { Toaster } from "./composites/toaster"

// CRM composites
export {
  PipelineView,
  PipelineCard,
  type PipelineStage,
  type PipelineCardProps,
} from "./composites/pipeline-view"
export { HealthScoreCard } from "./composites/health-score-card"
export { Leaderboard, type LeaderboardEntry } from "./composites/leaderboard"

// Workspace composites
export {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  type KanbanColumnColor,
  type KanbanPriority,
} from "./composites/kanban-board"
export { FocusView } from "./composites/focus-view"
export { QuickStrikeBar } from "./composites/quick-strike-bar"
export { WipHeatmap } from "./composites/wip-heatmap"
export { CycleDashboard } from "./composites/cycle-dashboard"

// Chat / Messaging
export {
  ChatBubble,
  ChatThreadList,
  TypingDots,
  type ChatUser,
  type ChatThread,
} from "./composites/chat"

// Collaboration
export {
  CommentThread,
  type Comment,
  type CommentType,
} from "./composites/comment-thread"
export { MentionInput, type MentionUser } from "./composites/mention-input"
export {
  QuarantineZone,
  type QuarantineTask,
  type QuarantineReason,
  type TradeOffDecision,
} from "./composites/quarantine-zone"

// AI / Workforce
export { CodeBlock } from "./composites/code-block"
export { AgentCard, type AgentStatus } from "./composites/agent-card"

// Planning
export {
  GanttChart,
  type GanttTask,
  type GanttBarColor,
} from "./composites/gantt-chart"

// ─── Utilities ───────────────────────────────────────────

export { cn } from "./lib/utils"
