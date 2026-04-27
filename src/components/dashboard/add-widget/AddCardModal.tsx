/**
 * AddCardModal — Figma-matched widget configurator.
 * Two-column layout with left sidebar and main configuration area.
 */

import { useState, useRef, useEffect } from "react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "./ui-dialog";
import {
  Search, Hash, LineChart as LineChartIcon, BarChart3,
  PieChart as PieChartIcon, Table as TableIcon, TrendingUp,
  LayoutGrid, ChevronDown, Calendar, MapPin, Tag, Layers,
  Briefcase, Package, IndianRupee, Percent, ScanLine,
  Copy, AlertTriangle, Target, Clock, X, GripVertical,
  ArrowRight, Check, Plus, Palette, FileSpreadsheet,
  ArrowRightLeft, MoveVertical, Database, Settings,
  Sliders, Grid3x3, ChevronRight, Bold, Italic, Underline,
  ChevronUp, Lightbulb, Edit, Code2, Info,
} from "lucide-react";
import { createPortal } from "react-dom";
import { ConfigurableChart, PIE_DATA } from "./ConfigurableChart";
import { ColorPicker } from "./ColorPicker";
import { WhiteDropdown } from "./WhiteDropdown";
import TypographySection from "./imports/TypographySection-1760-98";
import RangeYAxisSection from "./imports/RangeYAxisSection";
import ConditionalFormattingSection from "./imports/ConditionalFormattingSection";
import DataSeriesFormattingSection from "./imports/DataSeriesFormattingSection";
import LegendSection from "./imports/LegendSection";
import svgPaths from "./imports/svg-82m27spks2";
import svgPathsDropdown from "./imports/svg-fj9unhx75t";
import svgPathsFile from "./imports/svg-gttg7afvux";
import svgPathsDrag from "./imports/svg-zf1s2powk2";
import svgPathsQuery from "./imports/Icon/svg-0j4oy4u450";

/* ─── Aggregation options ────────────────────────────────────────────────── */
const AGGREGATION_OPTIONS = [
  { value: "",         label: "",                 symbol: "—"  },
  { value: "sum",      label: "Sum",             symbol: "Σ"  },
  { value: "average",  label: "Average",          symbol: "x̄"  },
  { value: "minimum",  label: "Min",              symbol: "↓"  },
  { value: "maximum",  label: "Max",              symbol: "↑"  },
  { value: "count_d",  label: "Count Distinct",   symbol: "#"  },
  { value: "count",    label: "Count",            symbol: "n"  },
  { value: "stddev",   label: "Std Dev",          symbol: "σ"  },
  { value: "variance", label: "Variance",         symbol: "σ²" },
  { value: "median",   label: "Median",           symbol: "M"  },
];

const MAX_FIELDS = 3;

/* ─── Temporal options for Date field ──────────────��──��─────────────────���─── */
const TEMPORAL_OPTIONS = [
  { value: "year", label: "Year" },
  { value: "quarterly", label: "Quarterly" },
  { value: "month", label: "Month" },
  { value: "day", label: "Day" },
];

/* ─── Data field catalog ──────────────────────────────────────────────────── */
type FieldKind = "dimension" | "measure";

interface DataField {
  id: string;
  label: string;
  kind: FieldKind;
  group: string;
  Icon: React.ElementType;
  color: string;
  axisValue: string;
}

const FIELDS: DataField[] = [
  { id: "date",        label: "Date",                kind: "dimension", group: "Time",        Icon: Calendar,      color: "#6a12cd", axisValue: "Date" },
  { id: "month",       label: "Month",               kind: "dimension", group: "Time",        Icon: Calendar,      color: "#6a12cd", axisValue: "Month" },
  { id: "week",        label: "Week",                kind: "dimension", group: "Time",        Icon: Calendar,      color: "#6a12cd", axisValue: "Week" },
  { id: "year",        label: "Year",                kind: "dimension", group: "Time",        Icon: Calendar,      color: "#6a12cd", axisValue: "Year" },
  { id: "region",      label: "Region",              kind: "dimension", group: "Geography",   Icon: MapPin,        color: "#0ea5e9", axisValue: "Region" },
  { id: "state",       label: "State",               kind: "dimension", group: "Geography",   Icon: MapPin,        color: "#0ea5e9", axisValue: "Region" },
  { id: "vendor",      label: "Vendor Name",         kind: "dimension", group: "Entity",      Icon: Briefcase,     color: "#f59e0b", axisValue: "Vendor Name" },
  { id: "status",      label: "Status",              kind: "dimension", group: "Entity",      Icon: Tag,           color: "#10b981", axisValue: "Status" },
  { id: "category",    label: "Categories",          kind: "dimension", group: "Entity",      Icon: Layers,        color: "#8b5cf6", axisValue: "Category" },
  { id: "subcategory", label: "Sub Category",        kind: "dimension", group: "Entity",      Icon: Layers,        color: "#8b5cf6", axisValue: "Category" },
  { id: "department",  label: "Department",          kind: "dimension", group: "Entity",      Icon: Briefcase,     color: "#f59e0b", axisValue: "Department" },
  { id: "product",     label: "Products",            kind: "dimension", group: "Entity",      Icon: Package,       color: "#ec4899", axisValue: "Vendor Name" },
  { id: "services",    label: "Services",            kind: "dimension", group: "Entity",      Icon: Package,       color: "#ec4899", axisValue: "Vendor Name" },
  { id: "solutions",   label: "Solutions",           kind: "dimension", group: "Entity",      Icon: Package,       color: "#ec4899", axisValue: "Vendor Name" },
  { id: "inv_amount",  label: "Invoice Amount (₹)",  kind: "measure",   group: "Financial",   Icon: IndianRupee,   color: "#6a12cd", axisValue: "Invoice Amount (₹)" },
  { id: "risk_amt",    label: "Amount at Risk (₹)",  kind: "measure",   group: "Financial",   Icon: AlertTriangle, color: "#ef4444", axisValue: "Invoice Amount (₹)" },
  { id: "dup_count",   label: "Duplicate Count",     kind: "measure",   group: "Performance", Icon: Copy,          color: "#f59e0b", axisValue: "Duplicate Count" },
  { id: "dup_score",   label: "Duplicate Score (%)", kind: "measure",   group: "Performance", Icon: Percent,       color: "#10b981", axisValue: "Duplicate Score (%)"},
  { id: "inv_scanned", label: "Invoices Scanned",    kind: "measure",   group: "Performance", Icon: ScanLine,      color: "#0ea5e9", axisValue: "Duplicate Count" },
  { id: "dup_found",   label: "Duplicates Found",    kind: "measure",   group: "Performance", Icon: Copy,          color: "#ef4444", axisValue: "Duplicate Count" },
  { id: "accuracy",    label: "Detection Accuracy (%)", kind: "measure", group: "Performance", Icon: Target,       color: "#10b981", axisValue: "Duplicate Score (%)"},
  { id: "proc_time",   label: "Processing Time (d)", kind: "measure",   group: "Performance", Icon: Clock,         color: "#6b7280", axisValue: "Duplicate Score (%)"},
];

const DIMENSION_GROUPS = ["Time", "Geography", "Entity"];
const MEASURE_GROUPS   = ["Financial", "Performance"];

/* ─── Reverse-map stored axis labels → FIELDS entry IDs ─────────────────── */
const AXIS_LABEL_TO_FIELD_ID: Record<string, string> = {
  "Month":               "month",
  "Week":                "week",
  "Year":                "year",
  "State / City":        "state",
  "Region":              "region",
  "Vendor Name":         "vendor",
  "Status":              "status",
  "Category":            "category",
  "Categories":          "category",
  "Sub Category":        "subcategory",
  "Department":          "department",
  "Product Name":        "product",
  "Products":            "product",
  "Services":            "services",
  "Solutions":           "solutions",
  "Invoice Amount (₹)":  "inv_amount",
  "Amount at Risk (₹)":  "risk_amt",
  "Duplicate Count":     "dup_count",
  "Invoice Count":       "inv_scanned",
  "Duplicates Found":    "dup_found",
  "Accuracy %":          "accuracy",
  "Amount (₹)":          "inv_amount",
};

/** Maps a stored widget axis label back to the best FIELDS entry id. */
function resolveFieldId(label: string): string {
  if (!label) return label;
  if (AXIS_LABEL_TO_FIELD_ID[label]) return AXIS_LABEL_TO_FIELD_ID[label];
  const byLabel = FIELDS.find(f => f.label === label);
  if (byLabel) return byLabel.id;
  const byAxis  = FIELDS.find(f => f.axisValue === label);
  if (byAxis)  return byAxis.id;
  return label;
}

/* ─── Widget catalogue ────────────────────────────────────────────────────── */
interface WidgetDef {
  id: string;
  title: string;
  Icon: React.ElementType;
  cardType: string;
  builderType: "kpi" | "line" | "area" | "bar" | "pie" | "table" | "scatter" | "matrix" | "doughnut" | "grid";
  defaultX: string;
  defaultY: string;
  useFieldBuilder: boolean;
  /** Dimension slot labels — defines which drop zones to show per chart type */
  dimensions: Array<{ key: string; label: string }>;
}

const WIDGETS: WidgetDef[] = [
  // 1. KPI — top priority, most used for dashboards
  { id: "kpi",              title: "KPI Cards",                      Icon: Hash,          cardType: "KPI",        builderType: "kpi",      defaultX: "Month",       defaultY: "Invoices Scanned",    useFieldBuilder: true,  dimensions: [{ key: "yAxis", label: "Value" }, { key: "xAxis", label: "Trend Axis" }] },
  // 2. Bar charts — most common data comparison
  { id: "clustered-column", title: "Clustered Column Chart",         Icon: BarChart3,     cardType: "Bar Chart",  builderType: "bar",      defaultX: "Month",  defaultY: "Duplicate Count",     useFieldBuilder: true,  dimensions: [{ key: "xAxis", label: "X-axis" }, { key: "yAxis", label: "Y-axis" }, { key: "secondaryY", label: "Y-axis Index" }, { key: "legend", label: "Legend" }] },
  { id: "stacked-column",   title: "Stacked Column Chart",           Icon: BarChart3,     cardType: "Bar Chart",  builderType: "bar",      defaultX: "Month",  defaultY: "Duplicate Count",     useFieldBuilder: true,  dimensions: [{ key: "xAxis", label: "X-axis" }, { key: "yAxis", label: "Y-axis" }, { key: "secondaryY", label: "Y-axis Index" }, { key: "legend", label: "Legend" }] },
  { id: "clustered-bar",    title: "Clustered Bar Chart",            Icon: BarChart3,     cardType: "Bar Chart",  builderType: "bar",      defaultX: "Month",  defaultY: "Duplicate Count",     useFieldBuilder: true,  dimensions: [{ key: "xAxis", label: "X-axis" }, { key: "yAxis", label: "Y-axis" }, { key: "secondaryY", label: "Y-axis Index" }, { key: "legend", label: "Legend" }] },
  { id: "stacked-bar",      title: "Stacked Bar Chart",              Icon: BarChart3,     cardType: "Bar Chart",  builderType: "bar",      defaultX: "Month",  defaultY: "Duplicate Count",     useFieldBuilder: true,  dimensions: [{ key: "xAxis", label: "X-axis" }, { key: "yAxis", label: "Y-axis" }, { key: "secondaryY", label: "Y-axis Index" }, { key: "legend", label: "Legend" }] },
  // 3. Line chart — trend analysis
  { id: "line",             title: "Line Chart",                     Icon: LineChartIcon, cardType: "Line Chart", builderType: "line",     defaultX: "Month",  defaultY: "Duplicate Score (%)", useFieldBuilder: true,  dimensions: [{ key: "xAxis", label: "X-axis" }, { key: "yAxis", label: "Y-axis" }, { key: "secondaryY", label: "Y-axis Index" }, { key: "legend", label: "Legend" }] },
  // 4. Area chart — volume over time
  { id: "area",             title: "Area Chart",                     Icon: TrendingUp,    cardType: "Area Chart", builderType: "area",     defaultX: "Month",  defaultY: "Duplicate Score (%)", useFieldBuilder: true,  dimensions: [{ key: "xAxis", label: "X-axis" }, { key: "yAxis", label: "Y-axis" }, { key: "secondaryY", label: "Y-axis Index" }, { key: "legend", label: "Legend" }] },
  // 5. Pie chart — distribution
  { id: "pie",              title: "Pie Chart",                      Icon: PieChartIcon,  cardType: "Pie Chart",  builderType: "pie",      defaultX: "Status", defaultY: "Duplicate Count",     useFieldBuilder: true,  dimensions: [{ key: "xAxis", label: "Legend" }, { key: "yAxis", label: "Values" }] },
  // 6. Combo charts — advanced comparison
  { id: "line-clustered",   title: "Line & Clustered Column Chart",  Icon: LineChartIcon, cardType: "Line Chart", builderType: "line",     defaultX: "Month",  defaultY: "Duplicate Score (%)", useFieldBuilder: true,  dimensions: [{ key: "xAxis", label: "X-axis" }, { key: "yAxis", label: "Column Y-axis" }, { key: "secondaryY", label: "Line Y-axis" }, { key: "legend", label: "Legend" }] },
  { id: "line-stacked",     title: "Line & Stacked Column Chart",    Icon: LineChartIcon, cardType: "Line Chart", builderType: "line",     defaultX: "Month",  defaultY: "Duplicate Score (%)", useFieldBuilder: true,  dimensions: [{ key: "xAxis", label: "X-axis" }, { key: "yAxis", label: "Column Y-axis" }, { key: "secondaryY", label: "Line Y-axis" }, { key: "legend", label: "Legend" }] },
  // 7. Specialized charts
  { id: "waterfall",        title: "Waterfall Chart",                Icon: TrendingUp,    cardType: "Area Chart", builderType: "area",     defaultX: "Week",   defaultY: "Invoice Amount (₹)",  useFieldBuilder: true,  dimensions: [{ key: "xAxis", label: "Category" }, { key: "legend", label: "Breakdown" }, { key: "yAxis", label: "Y-axis" }] },
  { id: "scatter",          title: "Scatter Chart",                  Icon: TrendingUp,    cardType: "Area Chart", builderType: "scatter",  defaultX: "Week",   defaultY: "Invoice Amount (₹)",  useFieldBuilder: true,  dimensions: [{ key: "yAxis", label: "Values" }, { key: "xAxis", label: "X-axis" }, { key: "legend", label: "Legend" }, { key: "size", label: "Size" }] },
  // 8. Table — always last
  { id: "table",            title: "Table",                          Icon: TableIcon,     cardType: "Table",      builderType: "table",    defaultX: "",       defaultY: "",                    useFieldBuilder: false, dimensions: [{ key: "xAxis", label: "Columns" }] },
];

/* ─── Aggregation portal dropdown ─────────────────────────────────────────── */
function AggDropdown({ value, onChange, fieldId }: { value: string; onChange: (v: string) => void; fieldId?: string }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  
  // Check if this is the Date field
  const isDateField = fieldId === "date";
  
  // For Date field, value stores selected temporal options as comma-separated string
  const selectedTemporalOptions = isDateField && value ? value.split(",") : [];
  
  const current = AGGREGATION_OPTIONS.find(a => a.value === value) || AGGREGATION_OPTIONS[0];

  const openMenu = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const dropH = isDateField ? (TEMPORAL_OPTIONS.length * 32 + 40) : (AGGREGATION_OPTIONS.length * 32 + 8);
      const below = window.innerHeight - r.bottom > dropH;
      setPos({ top: below ? r.bottom + 2 : r.top - dropH - 2, left: r.left });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const handleTemporalToggle = (optValue: string) => {
    const currentSelected = selectedTemporalOptions.includes(optValue)
      ? selectedTemporalOptions.filter(v => v !== optValue)
      : [...selectedTemporalOptions, optValue];
    onChange(currentSelected.join(","));
  };

  // Display label for date field
  const getDateDisplayLabel = () => {
    if (selectedTemporalOptions.length === 0) return "Select";
    if (selectedTemporalOptions.length === 1) {
      const opt = TEMPORAL_OPTIONS.find(o => o.value === selectedTemporalOptions[0]);
      return opt?.label || "Select";
    }
    return `${selectedTemporalOptions.length} selected`;
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); open ? setOpen(false) : openMenu(); }}
        onMouseDown={e => e.stopPropagation()}
        className="flex items-center gap-1 px-[9px] py-px rounded-[5px] bg-white hover:bg-white/90 border border-white/80 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] transition-all shrink-0"
        title={isDateField ? "Select date granularity" : "Change aggregation"}
      >
        {isDateField ? (
          <>
            <span className="text-[10px] text-[#26064a]/70">{getDateDisplayLabel()}</span>
            <ChevronDown className="size-[9px] text-[#6a12cd]" strokeWidth="0.75" />
          </>
        ) : (
          <>
            <span className="text-[11px] font-bold text-[#6a12cd]">{current.symbol}</span>
            {current.label && <span className="text-[10px] text-[#26064a]/70">{current.label}</span>}
            <ChevronDown className="size-[9px] text-[#6a12cd]" strokeWidth="0.75" />
          </>
        )}
      </button>
      {open && createPortal(
        <div
          style={{ position: "fixed", top: pos.top, left: pos.left, width: 160, zIndex: 99999 }}
          className="bg-white rounded-[8px] border border-[#e5e7eb] shadow-2xl py-1 overflow-hidden"
          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
        >
          {isDateField ? (
            <>
              <p className="px-3 pt-1.5 pb-1 text-[9px] font-semibold uppercase tracking-[0.8px] text-[#9ca3af]">Date Granularity</p>
              {TEMPORAL_OPTIONS.map(opt => {
                const isSelected = selectedTemporalOptions.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleTemporalToggle(opt.value); }}
                    className={`w-full flex items-center gap-2 px-3 py-[6px] text-left transition-colors hover:bg-[#f5f0ff] ${isSelected ? "bg-[#faf5ff]" : ""}`}
                  >
                    <div className={`w-[14px] h-[14px] rounded-[3px] border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#6a12cd] bg-[#6a12cd]" : "border-[#d1d5db] bg-white"}`}>
                      {isSelected && <Check className="size-[10px] text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-[12px] ${isSelected ? "text-[#6a12cd] font-medium" : "text-[#374151]"}`}>{opt.label}</span>
                  </button>
                );
              })}
              {selectedTemporalOptions.length > 0 && (
                <>
                  <div className="border-t border-[#e5e7eb] my-1" />
                  <button
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onChange(""); }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-[6px] text-left transition-colors hover:bg-[#fef2f2]"
                  >
                    <X className="size-[12px] text-[#ef4444]" strokeWidth={2} />
                    <span className="text-[11px] text-[#ef4444] font-medium">Clear All</span>
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <p className="px-3 pt-1.5 pb-1 text-[9px] font-semibold uppercase tracking-[0.8px] text-[#9ca3af]">Aggregation</p>
              {AGGREGATION_OPTIONS.filter(opt => opt.value !== "").map(opt => (
                <button
                  key={opt.value}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onChange(opt.value); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-[6px] text-left transition-colors hover:bg-[#f5f0ff] ${opt.value === value ? "bg-[#faf5ff] text-[#6a12cd]" : "text-[#374151]"}`}
                >
                  <span className="w-[18px] text-center text-[11px] font-bold shrink-0" style={{ color: opt.value === value ? "#6a12cd" : "#9ca3af" }}>{opt.symbol}</span>
                  <span className="text-[12px]">{opt.label}</span>
                  {opt.value === value && <Check className="size-[10px] ml-auto text-[#6a12cd]" />}
                </button>
              ))}
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}

/* ─── Props ───────────────────────────────────────────────────────���─����������────── */
interface AddCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCard: (cardType: string, config?: { xAxis: string; yAxis: string; color: string; name?: string; description?: string; seriesColors?: Record<string, string>; fontFamily?: string }) => void;
  mode?: 'add' | 'edit';
  initialXAxis?: string;
  initialYAxis?: string;
  initialWidgetType?: string;
  onOpenExcelUpload?: () => void;
  onOpenQueryModal?: () => void;
  isCreateDashboardMode?: boolean;
  onNavigateToBuilder?: (data: { cardType: string; config: any }) => void;
}

/* ─── Modal ────���─────────────────────────────────────────────────────────── */
export function AddCardModal({ open, onOpenChange, onSelectCard, mode = 'add', initialXAxis, initialYAxis, initialWidgetType, onOpenExcelUpload, onOpenQueryModal, isCreateDashboardMode = false, onNavigateToBuilder }: AddCardModalProps) {
  const [activeTab, setActiveTab] = useState<"data" | "format">("data");
  const [selected, setSelected] = useState<WidgetDef | null>(null); // No default selection
  const [chartTypeOpen, setChartTypeOpen] = useState(true);
  const [chartTypeCollapsed, setChartTypeCollapsed] = useState(false);
  const [dataSearch, setDataSearch] = useState("");
  const [file1Open, setFile1Open] = useState(true);
  const [file2Open, setFile2Open] = useState(false);
  const [addDataOpen, setAddDataOpen] = useState(false);
  
  // Widget name and description
  const [widgetName, setWidgetName] = useState("");
  const [widgetDescription, setWidgetDescription] = useState("");
  
  // Widget Info section collapsed state
  const [widgetInfoCollapsed, setWidgetInfoCollapsed] = useState(false);
  
  // Chart type dropdown state
  const [chartDropdownOpen, setChartDropdownOpen] = useState(false);
  const chartDropdownBtnRef = useRef<HTMLButtonElement>(null);
  const [chartDropdownPos, setChartDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  
  const [xFieldIds, setXFieldIds] = useState<string[]>([]);
  const [yFieldIds, setYFieldIds] = useState<string[]>([]);
  const [yIndexFieldIds, setYIndexFieldIds] = useState<string[]>([]);
  const [legendFieldIds, setLegendFieldIds] = useState<string[]>([]);
  const [secondaryYFieldIds, setSecondaryYFieldIds] = useState<string[]>([]);
  const [sizeFieldIds, setSizeFieldIds] = useState<string[]>([]);
  const [timeFieldIds, setTimeFieldIds] = useState<string[]>([]);
  const [yAggs, setYAggs] = useState<Record<string, string>>({});
  const [chartColor, setChartColor] = useState("#6a12cd");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [seriesColors, setSeriesColors] = useState<Record<string, string>>({});
  const [barSpacing, setBarSpacing] = useState("0");
  const [spacingMap, setSpacingMap] = useState<Record<string, string>>({});

  // Format options state
  const [generalThemeOpen, setGeneralThemeOpen] = useState(true);
  const [selectedBaseColor, setSelectedBaseColor] = useState("#6a12cd");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [selectedTextFormat, setSelectedTextFormat] = useState("");
  
  // X axis format section state
  const [xAxisFormatOpen, setXAxisFormatOpen] = useState(false);
  const [xAxisTitle, setXAxisTitle] = useState("");
  const [xAxisBold, setXAxisBold] = useState(false);
  const [xAxisItalic, setXAxisItalic] = useState(false);
  const [xAxisUnderline, setXAxisUnderline] = useState(false);

  // Y axis format section state
  const [yAxisFormatOpen, setYAxisFormatOpen] = useState(false);
  const [yAxisTitle, setYAxisTitle] = useState("");
  const [yAxisBold, setYAxisBold] = useState(false);
  const [yAxisItalic, setYAxisItalic] = useState(false);
  const [yAxisUnderline, setYAxisUnderline] = useState(false);

  // Y axis Index format section state
  const [yIndexFormatOpen, setYIndexFormatOpen] = useState(false);
  const [yIndexTitle, setYIndexTitle] = useState("");
  const [yIndexBold, setYIndexBold] = useState(false);
  const [yIndexItalic, setYIndexItalic] = useState(false);
  const [yIndexUnderline, setYIndexUnderline] = useState(false);

  const baseColors = [
    "#6a12cd", // Purple (default)
    "#3b82f6", // Blue
    "#0ea5e9", // Light Blue
    "#06b6d4", // Cyan
    "#14b8a6", // Teal
    "#10b981", // Green
    "#84cc16", // Lime
    "#f59e0b", // Amber
    "#f97316", // Orange
  ];

  const addDataBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!addDataOpen) return;
    const close = () => setAddDataOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [addDataOpen]);



  /* Chart dropdown close handler */
  useEffect(() => {
    if (!chartDropdownOpen) return;
    const close = (e: MouseEvent) => {
      // Don't close if clicking on the dropdown button or dropdown menu
      const target = e.target as HTMLElement;
      if (chartDropdownBtnRef.current?.contains(target)) return;
      if (target.closest('[data-chart-dropdown]')) return;
      setChartDropdownOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [chartDropdownOpen]);

  /* Pre-select widget type when opening in edit mode */
  useEffect(() => {
    if (open && mode === 'edit' && initialWidgetType) {
      const match = WIDGETS.find(w =>
        w.cardType.toLowerCase() === initialWidgetType.toLowerCase() ||
        w.title.toLowerCase() === initialWidgetType.toLowerCase()
      );
      if (match) setSelected(match);
    }
    if (open && mode === 'edit') {
      if (initialXAxis) {
        const xId = resolveFieldId(initialXAxis);
        setXFieldIds([xId]);
      } else {
        setXFieldIds([]);
      }
      if (initialYAxis) {
        const yId = resolveFieldId(initialYAxis);
        setYFieldIds([yId]);
        setYAggs({ [yId]: "count_d" });
      } else {
        setYFieldIds([]);
        setYAggs({});
      }
    }
    if (open && mode === 'add') {
      setSelected(null);
      setXFieldIds([]);
      setYFieldIds([]);
      setYIndexFieldIds([]);
      setLegendFieldIds([]);
      setSecondaryYFieldIds([]);
      setSizeFieldIds([]);
      setTimeFieldIds([]);
      setYAggs({});
      setSeriesColors({});
      setBarSpacing("0");
      setSpacingMap({});
    }
  }, [open, mode, initialWidgetType, initialXAxis, initialYAxis]);

  const removeXField = (id: string) => setXFieldIds(prev => prev.filter(f => f !== id));
  const removeYField = (id: string) => {
    setYFieldIds(prev => prev.filter(f => f !== id));
    setYAggs(prev => { const n = { ...prev }; delete n[id]; return n; });
  };
  const removeTimeField = (id: string) => setTimeFieldIds(prev => prev.filter(f => f !== id));
  const removeYIndexField = (id: string) => setYIndexFieldIds(prev => prev.filter(f => f !== id));
  const changeAgg = (fieldId: string, v: string) => setYAggs(prev => ({ ...prev, [fieldId]: v }));

  const xAxisValue = xFieldIds[0] ? (FIELDS.find(f => f.id === xFieldIds[0])?.axisValue ?? "") : "";
  const yAxisValue = yFieldIds[0] ? (FIELDS.find(f => f.id === yFieldIds[0])?.axisValue ?? "") : "";
  const needsFields = selected?.useFieldBuilder ?? false;

  const editHasInitialValues = mode === 'edit' && !!(initialXAxis || initialYAxis);
  const previewReady = !needsFields || (xAxisValue !== "" && yAxisValue !== "") || editHasInitialValues;
  const canAdd = selected && (!needsFields || previewReady);

  const resolvedXAxis = xAxisValue || (editHasInitialValues ? initialXAxis : undefined) || selected?.defaultX || "";
  const resolvedYAxis = yAxisValue || (editHasInitialValues ? initialYAxis : undefined) || selected?.defaultY || "";

  const handleAdd = () => {
    if (!selected) return;
    const xAxis = needsFields ? xAxisValue : "";
    const yAxis = needsFields ? yAxisValue : selected.defaultY;
    onSelectCard(selected.cardType, { xAxis, yAxis, color: chartColor, name: widgetName, description: widgetDescription, seriesColors: Object.keys(seriesColors).length > 0 ? seriesColors : undefined, fontFamily });
    onOpenChange(false);
  };

  const addFieldToX = (fieldId: string) => {
    if (xFieldIds.length >= 3) return;
    if (!xFieldIds.includes(fieldId)) {
      setXFieldIds(prev => [...prev, fieldId]);
      // Set all temporal options selected by default for Date field
      if (fieldId === "date") {
        setYAggs(prev => ({ ...prev, [fieldId]: "year,quarterly,month,day" }));
      }
    }
  };

  const addFieldToY = (fieldId: string) => {
    if (yFieldIds.length >= 3) return;
    if (!yFieldIds.includes(fieldId)) {
      setYFieldIds(prev => [...prev, fieldId]);
      // Set all temporal options selected by default for Date field
      setYAggs(prev => ({ ...prev, [fieldId]: fieldId === "date" ? "year,quarterly,month,day" : "count_d" }));
    }
  };

  const addFieldToTime = (fieldId: string) => {
    if (timeFieldIds.length >= 3) return;
    if (!timeFieldIds.includes(fieldId)) {
      setTimeFieldIds(prev => [...prev, fieldId]);
      // Set all temporal options selected by default for Date field
      if (fieldId === "date") {
        setYAggs(prev => ({ ...prev, [fieldId]: "year,quarterly,month,day" }));
      }
    }
  };

  const addFieldToYIndex = (fieldId: string) => {
    if (yIndexFieldIds.length >= 3) return;
    if (!yIndexFieldIds.includes(fieldId)) {
      setYIndexFieldIds(prev => [...prev, fieldId]);
    }
  };

  const filteredFields = FIELDS.filter(f => 
    f.label.toLowerCase().includes(dataSearch.toLowerCase())
  );

  const dimensionFields = filteredFields.filter(f => f.kind === "dimension");
  const measureFields = filteredFields.filter(f => f.kind === "measure");

  // Determine which datasource is active based on selected fields
  const getActiveDatasource = (): "file1" | "file2" | null => {
    const allSelectedIds = [...xFieldIds, ...yFieldIds];
    if (allSelectedIds.length === 0) return null;
    
    // Check if any selected field is in dimensionFields (Invoice_Master.xlsx)
    const hasDimensionField = allSelectedIds.some(id => 
      dimensionFields.some(f => f.id === id)
    );
    if (hasDimensionField) return "file1";
    
    // Check if any selected field is in measureFields (Vendor_Finance.xlsx)
    const hasMeasureField = allSelectedIds.some(id => 
      measureFields.some(f => f.id === id)
    );
    if (hasMeasureField) return "file2";
    
    return null;
  };

  const activeDatasource = getActiveDatasource();
  const isFile1Disabled = activeDatasource === "file2";
  const isFile2Disabled = activeDatasource === "file1";

  // Open chart dropdown
  const openChartDropdown = () => {
    if (chartDropdownBtnRef.current) {
      const rect = chartDropdownBtnRef.current.getBoundingClientRect();
      setChartDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
    setChartDropdownOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing if chart dropdown is open
      if (!newOpen && chartDropdownOpen) return;
      onOpenChange(newOpen);
    }}>
      <DialogContent
        className="!p-0 !gap-0 !overflow-hidden !bg-white !flex !flex-col !rounded-[12px] !border !border-[#e5e7eb] !shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] font-['Inter',sans-serif] sm:max-w-[1200px]"
        style={{ width: "min(1200px, 96vw)", height: "min(775px, 92vh)" }}
      >
        <DialogTitle className="sr-only">{mode === 'edit' ? 'Edit Widget' : 'Add New Widget'}</DialogTitle>
        <DialogDescription className="sr-only">Configure widget data and visualization settings</DialogDescription>

        {/* ── Header ── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-[10px] bg-white border-b border-[#e5e7eb]">
          <div className="flex items-center gap-[8px]">
            <div className="bg-[#faf5ff] rounded-[10px] size-[28px] flex items-center justify-center shrink-0">
              <LayoutGrid className="size-[14px] text-[#7C3AED]" strokeWidth={1.75} />
            </div>
            <span className="text-[15px] font-semibold text-[#26064a]">{mode === 'edit' ? 'Edit Widget' : 'Add New Widget'}</span>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg hover:bg-[#f3f4f6] transition-colors cursor-pointer">
            <X className="size-[18px] text-[#6b7280]" />
          </button>
        </div>

        {/* ── Two-tab switcher ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* ── Right Sidebar (moved to right) ── */}
          <div className="w-[340px] shrink-0 bg-[rgba(249,250,251,0.5)] border-l border-[#f3f4f6] flex flex-col overflow-hidden order-2">
            
            {/* ── Tab Switcher ── */}
            <div className="w-[340px] shrink-0 bg-white border-b border-[#e5e7eb] px-[12px] py-[4px]">
              <div className="flex items-center gap-2 bg-[#00000000]">
                <button
                  onClick={() => setActiveTab("data")}
                  className={`flex-1 flex items-center justify-center gap-2 font-medium transition-all rounded-md ${ activeTab === "data" ? "text-[#6a12cd] bg-[#f4f0ff]" : "text-[#26064a] hover:text-[#6a12cd] hover:bg-[#f9fafb]" } px-[16px] py-[4px] text-[14px]`}
                >
                  <Database className="size-[16px]" strokeWidth={2.5} />
                  Data Source
                </button>
                <button
                  onClick={() => setActiveTab("format")}
                  className={`flex-1 flex items-center justify-center gap-2 font-medium transition-all rounded-md ${ activeTab === "format" ? "text-[#6a12cd] bg-[#f4f0ff]" : "text-[#26064a] hover:text-[#6a12cd] hover:bg-[#f9fafb]" } text-[14px] px-[16px] py-[4px]`}
                >
                  <Settings className="size-[16px]" strokeWidth={2.5} />
                  Customize
                </button>
              </div>
            </div>
            
            {activeTab === "data" && (
              <div className="flex-1 flex flex-col px-[12px] py-[12px] min-h-0 overflow-hidden">

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                  {/* ── CHART TYPE section ── */}
                <div className=" bg-white rounded-[8px] border border-[#e5e7eb] overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setChartTypeCollapsed(!chartTypeCollapsed)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#faf5ff] to-white border-b border-[#f0f0f0] hover:from-[#f5f0ff] hover:to-[#fefefe] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-[16px] flex items-center justify-center">
                        <LayoutGrid className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
                      </div>
                      <span className="text-[12px] font-bold uppercase tracking-[0.8px] text-[#26064a] truncate w-[180px] text-left">
                        {selected ? selected.title : 'Chart Type'}
                      </span>
                    </div>
                    <ChevronDown 
                      className={`size-[16px] text-[#6a12cd] transition-transform duration-200 ${chartTypeCollapsed ? 'rotate-0' : 'rotate-180'}`} 
                      strokeWidth={1.5} 
                    />
                  </button>
                  
                  {!chartTypeCollapsed && (
                    <div className="overflow-y-auto max-h-[300px] py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {WIDGETS.map((w) => {
                        const isActive = selected?.id === w.id;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => { setSelected(w); setChartTypeCollapsed(true); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 transition-all ${
                              isActive
                                ? "bg-[#f4f0ff] text-[#6a12cd]"
                                : "text-[#26064a] hover:bg-[#f9fafb]"
                            }`}
                          >
                            <w.Icon className={`size-[16px] shrink-0 ${isActive ? "text-[#6a12cd]" : "text-[#6a12cd]"}`} strokeWidth={1.5} />
                            <span className={`text-[12px] font-medium whitespace-nowrap ${isActive ? "font-semibold" : ""}`}>{w.title}</span>
                            {isActive && <Check className="size-[14px] ml-auto text-[#6a12cd]" strokeWidth={2} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── DATA SOURCE section ── */}
                <div className="bg-white rounded-[8px] border border-[#e5e7eb] overflow-hidden shadow-sm">
                  <div className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#faf5ff] to-white border-b border-[#f0f0f0]">
                    <div className="flex items-center gap-2">
                      <div className="size-[18px] rounded-[4px]  flex items-center justify-center">
                        <Database className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
                      </div>
                      <span className="text-[12px] font-bold uppercase tracking-[0.8px] text-[#26064a]">Data Source</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        ref={addDataBtnRef}
                        onClick={(e) => { e.stopPropagation(); setAddDataOpen(true); }}
                        className="bg-[#6a12cd] text-white text-[12px] font-semibold uppercase tracking-[0.6px] px-2 py-1 rounded-[4px] hover:bg-[#5a0ebd] transition-colors shadow-sm"
                      >
                        Add Data
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-[#fafafa]">
                      {/* Search */}
                      <div className="px-2.5 pt-2.5 pb-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-[11px] text-[#b0b8c4]" />
                          <input
                            type="text"
                            placeholder="Search fields…"
                            value={dataSearch}
                            onChange={e => setDataSearch(e.target.value)}
                            className="w-full h-[32px] pl-8 pr-2.5 bg-white border border-[#e5e7eb] rounded-[6px] text-[12px] text-[#26064a] placeholder:text-[#c4c9d4] outline-none focus:border-[#6a12cd]/40 transition-colors"
                          />
                        </div>
                      </div>

                      {/* File 1: Invoice_Master.xlsx */}
                      <div className={`mx-2.5 mb-2 bg-white rounded-[6px] border border-[#e5e7eb] overflow-hidden ${isFile1Disabled ? 'opacity-50' : ''}`}>
                        <button
                          onClick={() => !isFile1Disabled && setFile1Open(!file1Open)}
                          disabled={isFile1Disabled}
                          className={`w-full flex items-center justify-between px-2.5 py-2 bg-gradient-to-r from-[#faf5ff] to-white transition-all border-b border-[#e5e7eb] ${isFile1Disabled ? 'cursor-not-allowed' : 'hover:from-[#f5f0ff] hover:to-[#fefefe]'}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="size-[16px] rounded-[4px] flex items-center justify-center">
                              <FileSpreadsheet className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
                            </div>
                            <span className="font-semibold text-[#26064a] text-[12px]">Invoice_Master.xlsx</span>
                            {isFile1Disabled && <span className="text-[9px] text-gray-400 ml-1">(Locked)</span>}
                          </div>
                          <ChevronDown
                            className="size-[12px] text-[#6a12cd] transition-transform duration-200"
                            style={{ transform: file1Open ? "rotate(180deg)" : "rotate(0deg)" }}
                          />
                        </button>
                        {file1Open && !isFile1Disabled && (
                          <div className="px-2 py-1 bg-white">
                            {dimensionFields.slice(0, 8).map((f) => (
                              <div
                                key={f.id}
                                draggable={!isFile1Disabled}
                                onDragStart={(e) => {
                                  if (isFile1Disabled) {
                                    e.preventDefault();
                                    return;
                                  }
                                  e.dataTransfer.effectAllowed = "copy";
                                  e.dataTransfer.setData("fieldId", f.id);
                                  e.dataTransfer.setData("fieldKind", f.kind);
                                }}
                                className={`w-full flex items-center gap-2 px-1 py-1.5 rounded-[4px] transition-colors ${isFile1Disabled ? 'cursor-not-allowed' : 'cursor-move hover:bg-[#faf5ff]'}`}
                              >
                                <svg className="shrink-0 size-[12px]" fill="none" viewBox="0 0 12 12">
                                  <path d={svgPathsDrag.p233bb300} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
                                  <path d={svgPathsDrag.p358d1c00} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
                                  <path d={svgPathsDrag.p31563d00} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
                                  <path d={svgPathsDrag.p37817400} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
                                  <path d={svgPathsDrag.p14c67980} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
                                  <path d={svgPathsDrag.p1acad500} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
                                </svg>
                                <span className="font-normal text-[#26064a] text-[12px]">{f.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* File 2: Vendor_Finance.xlsx */}
                      <div className={`mx-2.5 mb-2.5 bg-white rounded-[6px] border border-[#e5e7eb] overflow-hidden ${isFile2Disabled ? 'opacity-50' : ''}`}>
                        <button
                          onClick={() => !isFile2Disabled && setFile2Open(!file2Open)}
                          disabled={isFile2Disabled}
                          className={`w-full flex items-center justify-between px-2.5 py-2 bg-gradient-to-r from-[#faf5ff] to-white transition-all border-b border-[#e5e7eb] ${isFile2Disabled ? 'cursor-not-allowed' : 'hover:from-[#f5f0ff] hover:to-[#fefefe]'}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="size-[16px] rounded-[3px] flex items-center justify-center">
                              <FileSpreadsheet className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
                            </div>
                            <span className="font-semibold text-[#26064a] text-[12px]">Vendor_Finance.xlsx</span>
                            {isFile2Disabled && <span className="text-[9px] text-gray-400 ml-1">(Locked)</span>}
                          </div>
                          <ChevronDown
                            className="size-[12px] text-[#6a12cd] transition-transform duration-200"
                            style={{ transform: file2Open ? "rotate(180deg)" : "rotate(0deg)" }}
                          />
                        </button>
                        {file2Open && !isFile2Disabled && (
                          <div className="px-2 py-1 bg-white">
                            {measureFields.map((f) => (
                              <div
                                key={f.id}
                                draggable={!isFile2Disabled}
                                onDragStart={(e) => {
                                  if (isFile2Disabled) {
                                    e.preventDefault();
                                    return;
                                  }
                                  e.dataTransfer.effectAllowed = "copy";
                                  e.dataTransfer.setData("fieldId", f.id);
                                  e.dataTransfer.setData("fieldKind", f.kind);
                                }}
                                className={`w-full flex items-center gap-2 px-1 py-1.5 rounded-[4px] transition-colors ${isFile2Disabled ? 'cursor-not-allowed' : 'cursor-move hover:bg-[#faf5ff]'}`}
                              >
                                <svg className="shrink-0 size-[12px]" fill="none" viewBox="0 0 12 12">
                                  <path d={svgPathsDrag.p233bb300} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
                                  <path d={svgPathsDrag.p358d1c00} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
                                  <path d={svgPathsDrag.p31563d00} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
                                  <path d={svgPathsDrag.p37817400} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
                                  <path d={svgPathsDrag.p14c67980} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
                                  <path d={svgPathsDrag.p1acad500} stroke="#D1D5DC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
                                </svg>
                                <span className="text-[12px] font-normal text-[#26064a]">{f.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── WIDGET INFO section (moved to last position) ── */}
                <div className="bg-white rounded-[8px] border border-[#e5e7eb] overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setWidgetInfoCollapsed(!widgetInfoCollapsed)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#faf5ff] to-white border-b border-[#f0f0f0] hover:from-[#f5f0ff] hover:to-[#fefefe] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-[16px] flex items-center justify-center">
                        <Info className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
                      </div>
                      <span className="font-bold uppercase tracking-[0.8px] text-[#26064a] text-[12px]">Widget Info</span>
                    </div>
                    <ChevronDown 
                      className={`size-[16px] text-[#6a12cd] transition-transform duration-200 ${widgetInfoCollapsed ? 'rotate-0' : 'rotate-180'}`} 
                      strokeWidth={1.5} 
                    />
                  </button>
                  {!widgetInfoCollapsed && (
                    <div className="p-3 space-y-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[#6b7280] mb-1.5">Widget Name</label>
                        <input
                          type="text"
                          value={widgetName}
                          onChange={(e) => setWidgetName(e.target.value)}
                          placeholder="Enter widget name"
                          className="w-full px-3 py-2 text-[13px] border border-[#e5e7eb] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#6a12cd]/20 focus:border-[#6a12cd] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#6b7280] mb-1.5">Description</label>
                        <textarea
                          value={widgetDescription}
                          onChange={(e) => setWidgetDescription(e.target.value)}
                          placeholder="Enter widget description"
                          rows={2}
                          className="w-full px-3 py-2 text-[13px] border border-[#e5e7eb] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#6a12cd]/20 focus:border-[#6a12cd] transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}
                  </div>
                </div>

              </div>
            )}

            {activeTab === "format" && (
              <div className="flex-1 flex flex-col overflow-hidden px-3 py-3">
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
                  {/* ── General section with colors and text formatting ── */}
                <div className="bg-white rounded-[8px] border border-[#e5e7eb] overflow-hidden shadow-sm">
                  <button
                    onClick={() => setGeneralThemeOpen(!generalThemeOpen)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#faf5ff] to-white hover:from-[#f5f0ff] hover:to-[#fefefe] transition-all border-b border-[#f0f0f0]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-[18px] rounded-[4px] flex items-center justify-center">
                        <Palette className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#26064a]">General </span>
                    </div>
                    <ChevronDown
                      className="size-[14px] text-[#6a12cd] transition-transform duration-200"
                      style={{ transform: generalThemeOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>
                  {generalThemeOpen && (
                    <div className="bg-[#fafafa] p-2.5 space-y-3">
                      {/* Font Family dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-semibold text-[#26064a]">Font Family</label>
                        <WhiteDropdown
                          value={fontFamily}
                          onChange={setFontFamily}
                          options={[
                            { value: "Inter", label: "Inter" },
                            { value: "Poppins", label: "Poppins" },
                            { value: "Roboto", label: "Roboto" },
                            { value: "Open Sans", label: "Open Sans" },
                            { value: "Montserrat", label: "Montserrat" },
                            { value: "Lato", label: "Lato" },
                            { value: "Nunito", label: "Nunito" },
                            { value: "Raleway", label: "Raleway" },
                            { value: "PT Sans", label: "PT Sans" },
                            { value: "Merriweather", label: "Merriweather" },
                            { value: "Playfair Display", label: "Playfair Display" },
                          ]}
                          placeholder="Select font..."
                          size="sm"
                        />
                      </div>

                      {/* Text formatting options */}
                      <div className="flex items-center bg-white rounded-[6px] border border-[#e5e7eb] overflow-hidden">
                        <button
                          onClick={() => setIsBold(!isBold)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-r border-[#e5e7eb] transition-all duration-200 ${
                            isBold
                              ? "bg-[#6a12cd] text-white"
                              : "bg-white text-[#26064a] hover:bg-[#faf5ff]"
                          }`}
                        >
                          <Bold className={`size-[14px] transition-colors ${isBold ? "text-white" : "text-[#6a12cd]"}`} />
                          <span className="text-[11px] font-medium">
                            Bold
                          </span>
                        </button>
                        <button
                          onClick={() => setIsItalic(!isItalic)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-r border-[#e5e7eb] transition-all duration-200 ${
                            isItalic
                              ? "bg-[#6a12cd] text-white"
                              : "bg-white text-[#26064a] hover:bg-[#faf5ff]"
                          }`}
                        >
                          <Italic className={`size-[14px] transition-colors ${isItalic ? "text-white" : "text-[#6a12cd]"}`} />
                          <span className="text-[11px] font-medium">
                            Italic
                          </span>
                        </button>
                        <button
                          onClick={() => setIsUnderline(!isUnderline)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 transition-all duration-200 ${
                            isUnderline
                              ? "bg-[#6a12cd] text-white"
                              : "bg-white text-[#26064a] hover:bg-[#faf5ff]"
                          }`}
                        >
                          <Underline className={`size-[14px] transition-colors ${isUnderline ? "text-white" : "text-[#6a12cd]"}`} />
                          <span className="text-[11px] font-medium">
                            Underline
                          </span>
                        </button>
                      </div>

                      {/* Text Formatting Dropdown */}
                      
                    </div>
                  )}
                  </div>

                  {/* ── X AXIS section ── */}
                  <div className="bg-white rounded-[8px] border border-[#e5e7eb] overflow-hidden shadow-sm">
                    <button
                      onClick={() => setXAxisFormatOpen(!xAxisFormatOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#faf5ff] to-white hover:from-[#f5f0ff] hover:to-[#fefefe] transition-all border-b border-[#f0f0f0]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="size-[18px] rounded-[4px] flex items-center justify-center">
                          <ArrowRightLeft className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#26064a]">X axis</span>
                      </div>
                      <ChevronDown
                        className="size-[14px] text-[#6a12cd] transition-transform duration-200"
                        style={{ transform: xAxisFormatOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      />
                    </button>
              
                    {xAxisFormatOpen && (
                      <div className="bg-[#fafafa] p-2.5 space-y-3">
                        {/* Title input */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[12px] font-medium text-[#26064a]">Title</label>
                          <input
                            type="text"
                            value={xAxisTitle}
                            onChange={(e) => setXAxisTitle(e.target.value)}
                            placeholder="Enter X Axis Title"
                            className="w-full px-3.5 py-2 text-[12px] bg-white border border-[rgba(38,6,74,0.2)] rounded-[8px] text-[#26064a] placeholder:text-[rgba(38,6,74,0.2)] focus:outline-none focus:border-[#6a12cd] focus:ring-1 focus:ring-[#6a12cd] transition-all shadow-sm"
                          />
                        </div>

                        {/* Text formatting options */}
                        <div className="flex items-center bg-white rounded-[6px] border border-[#e5e7eb] overflow-hidden">
                          <button
                            onClick={() => setXAxisBold(!xAxisBold)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-r border-[#e5e7eb] transition-all duration-200 ${
                              xAxisBold
                                ? "bg-[#6a12cd] text-white"
                                : "bg-white text-[#26064a] hover:bg-[#faf5ff]"
                            }`}
                          >
                            <Bold className={`size-[14px] transition-colors ${xAxisBold ? "text-white" : "text-[#6a12cd]"}`} />
                            <span className="text-[11px] font-medium">
                              Bold
                            </span>
                          </button>
                          <button
                            onClick={() => setXAxisItalic(!xAxisItalic)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-r border-[#e5e7eb] transition-all duration-200 ${
                              xAxisItalic
                                ? "bg-[#6a12cd] text-white"
                                : "bg-white text-[#26064a] hover:bg-[#faf5ff]"
                            }`}
                          >
                            <Italic className={`size-[14px] transition-colors ${xAxisItalic ? "text-white" : "text-[#6a12cd]"}`} />
                            <span className="text-[11px] font-medium">
                              Italic
                            </span>
                          </button>
                          <button
                            onClick={() => setXAxisUnderline(!xAxisUnderline)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 transition-all duration-200 ${
                              xAxisUnderline
                                ? "bg-[#6a12cd] text-white"
                                : "bg-white text-[#26064a] hover:bg-[#faf5ff]"
                            }`}
                          >
                            <Underline className={`size-[14px] transition-colors ${xAxisUnderline ? "text-white" : "text-[#6a12cd]"}`} />
                            <span className="text-[11px] font-medium">
                              Underline
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Y AXIS section ── */}
                  <div className="bg-white rounded-[8px] border border-[#e5e7eb] overflow-hidden shadow-sm mt-3">
                    <button
                      onClick={() => setYAxisFormatOpen(!yAxisFormatOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#faf5ff] to-white hover:from-[#f5f0ff] hover:to-[#fefefe] transition-all border-b border-[#f0f0f0]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="size-[18px] rounded-[4px] flex items-center justify-center">
                          <MoveVertical className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#26064a]">Y axis</span>
                      </div>
                      <ChevronDown
                        className="size-[14px] text-[#6a12cd] transition-transform duration-200"
                        style={{ transform: yAxisFormatOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      />
                    </button>
              
                    {yAxisFormatOpen && (
                      <div className="bg-[#fafafa] p-2.5 space-y-3">
                        {/* Title input */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[12px] font-medium text-[#26064a]">Title</label>
                          <input
                            type="text"
                            value={yAxisTitle}
                            onChange={(e) => setYAxisTitle(e.target.value)}
                            placeholder="Enter Y Axis Title"
                            className="w-full px-3.5 py-2 text-[12px] bg-white border border-[rgba(38,6,74,0.2)] rounded-[8px] text-[#26064a] placeholder:text-[rgba(38,6,74,0.2)] focus:outline-none focus:border-[#6a12cd] focus:ring-1 focus:ring-[#6a12cd] transition-all shadow-sm"
                          />
                        </div>

                        {/* Text formatting options */}
                        <div className="flex items-center bg-white rounded-[6px] border border-[#e5e7eb] overflow-hidden">
                          <button
                            onClick={() => setYAxisBold(!yAxisBold)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-r border-[#e5e7eb] transition-all duration-200 ${
                              yAxisBold
                                ? "bg-[#6a12cd] text-white"
                                : "bg-white text-[#26064a] hover:bg-[#faf5ff]"
                            }`}
                          >
                            <Bold className={`size-[14px] transition-colors ${yAxisBold ? "text-white" : "text-[#6a12cd]"}`} />
                            <span className="text-[11px] font-medium">
                              Bold
                            </span>
                          </button>
                          <button
                            onClick={() => setYAxisItalic(!yAxisItalic)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-r border-[#e5e7eb] transition-all duration-200 ${
                              yAxisItalic
                                ? "bg-[#6a12cd] text-white"
                                : "bg-white text-[#26064a] hover:bg-[#faf5ff]"
                            }`}
                          >
                            <Italic className={`size-[14px] transition-colors ${yAxisItalic ? "text-white" : "text-[#6a12cd]"}`} />
                            <span className="text-[11px] font-medium">
                              Italic
                            </span>
                          </button>
                          <button
                            onClick={() => setYAxisUnderline(!yAxisUnderline)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 transition-all duration-200 ${
                              yAxisUnderline
                                ? "bg-[#6a12cd] text-white"
                                : "bg-white text-[#26064a] hover:bg-[#faf5ff]"
                            }`}
                          >
                            <Underline className={`size-[14px] transition-colors ${yAxisUnderline ? "text-white" : "text-[#6a12cd]"}`} />
                            <span className="text-[11px] font-medium">
                              Underline
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Y AXIS INDEX section — only for charts with secondaryY ── */}
                  {selected && selected.dimensions.some(d => d.key === 'secondaryY') && (
                  <div className="bg-white rounded-[8px] border border-[#e5e7eb] overflow-hidden shadow-sm mt-3">
                    <button
                      onClick={() => setYIndexFormatOpen(!yIndexFormatOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#faf5ff] to-white hover:from-[#f5f0ff] hover:to-[#fefefe] transition-all border-b border-[#f0f0f0]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="size-[18px] rounded-[4px] flex items-center justify-center">
                          <MoveVertical className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#26064a]">Y Axis Index</span>
                      </div>
                      <ChevronDown
                        className="size-[14px] text-[#6a12cd] transition-transform duration-200"
                        style={{ transform: yIndexFormatOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      />
                    </button>
                    {yIndexFormatOpen && (
                      <div className="bg-[#fafafa] p-2.5 space-y-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[12px] font-medium text-[#26064a]">Title</label>
                          <input
                            type="text"
                            value={yIndexTitle}
                            onChange={(e) => setYIndexTitle(e.target.value)}
                            placeholder="Enter Y Axis Index Title"
                            className="w-full px-3.5 py-2 text-[12px] bg-white border border-[rgba(38,6,74,0.2)] rounded-[8px] text-[#26064a] placeholder:text-[rgba(38,6,74,0.2)] focus:outline-none focus:border-[#6a12cd] focus:ring-1 focus:ring-[#6a12cd] transition-all shadow-sm"
                          />
                        </div>
                        <div className="flex items-center bg-white rounded-[6px] border border-[#e5e7eb] overflow-hidden">
                          <button
                            onClick={() => setYIndexBold(!yIndexBold)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-r border-[#e5e7eb] transition-all duration-200 ${yIndexBold ? "bg-[#6a12cd] text-white" : "bg-white text-[#26064a] hover:bg-[#faf5ff]"}`}
                          >
                            <Bold className={`size-[14px] transition-colors ${yIndexBold ? "text-white" : "text-[#6a12cd]"}`} />
                            <span className="text-[11px] font-medium">Bold</span>
                          </button>
                          <button
                            onClick={() => setYIndexItalic(!yIndexItalic)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-r border-[#e5e7eb] transition-all duration-200 ${yIndexItalic ? "bg-[#6a12cd] text-white" : "bg-white text-[#26064a] hover:bg-[#faf5ff]"}`}
                          >
                            <Italic className={`size-[14px] transition-colors ${yIndexItalic ? "text-white" : "text-[#6a12cd]"}`} />
                            <span className="text-[11px] font-medium">Italic</span>
                          </button>
                          <button
                            onClick={() => setYIndexUnderline(!yIndexUnderline)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 transition-all duration-200 ${yIndexUnderline ? "bg-[#6a12cd] text-white" : "bg-white text-[#26064a] hover:bg-[#faf5ff]"}`}
                          >
                            <Underline className={`size-[14px] transition-colors ${yIndexUnderline ? "text-white" : "text-[#6a12cd]"}`} />
                            <span className="text-[11px] font-medium">Underline</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                  {/* ── LEGENDS section ── */}
                  <LegendSection />

                  {/* ── DATA LABELS section ── */}
                <TypographySection />

                {/* ── RANGE (Y AXIS) section ── */}
                <RangeYAxisSection />

                {/* ── CONDITIONAL FORMATTING section ── */}
                <ConditionalFormattingSection 
                  xAxisFields={xFieldIds.map(id => FIELDS.find(f => f.id === id)?.label || id)}
                  yAxisFields={yFieldIds.map(id => FIELDS.find(f => f.id === id)?.label || id)}
                />

                {/* ── DATA SERIES FORMATTING section ── */}
                <DataSeriesFormattingSection
                  series={(() => {
                    if (!selected) return [];
                    const bt = selected.builderType;
                    if (bt === 'pie') {
                      const pieData = PIE_DATA[resolvedXAxis] ?? PIE_DATA["Status"];
                      return pieData.map((d: any) => d.name);
                    }
                    if (bt === 'bar') return ['Total Duplicates', 'Resolved', 'Pending'];
                    if (bt === 'line') return ['Actual Accuracy', 'Target Accuracy'];
                    if (bt === 'area') {
                      const yShort = (resolvedYAxis || 'Duplicate Count').replace(/\s*\(.*?\)/, '').trim();
                      return [`Actual ${yShort}`, `Target ${yShort}`];
                    }
                    // Fallback: use Y-axis fields if available, otherwise use resolved axis labels
                    const yLabels = yFieldIds.map(id => FIELDS.find(f => f.id === id)?.label || id);
                    if (yLabels.length > 0) return yLabels;
                    if (resolvedYAxis) return [resolvedYAxis];
                    return [selected.title];
                  })()}
                  seriesColors={seriesColors}
                  onSeriesColorsChange={setSeriesColors}
                  spacingType={selected?.builderType === 'bar' ? 'bar' : selected?.builderType === 'pie' ? 'pie' : 'disabled'}
                  spacingMap={spacingMap}
                  onSpacingMapChange={(map) => {
                    setSpacingMap(map);
                    // For bar charts, use the max spacing value as global barSpacing
                    if (selected?.builderType === 'bar') {
                      const vals = Object.values(map).map(Number).filter(n => !isNaN(n));
                      setBarSpacing(vals.length > 0 ? String(Math.max(...vals)) : "0");
                    }
                  }}
                />
                </div>
              </div>
            )}

            {/* ── ADD WIDGET BUTTON — fixed at sidebar bottom ── */}
            <div className="shrink-0 px-3 py-3 border-t border-[#e5e7eb] bg-white">
              <button
                onClick={() => {
                  if (isCreateDashboardMode && onNavigateToBuilder) {
                    if (!selected) return;
                    const xAxis = needsFields ? xAxisValue : "";
                    const yAxis = needsFields ? yAxisValue : selected.defaultY;
                    onNavigateToBuilder({ cardType: selected.cardType, config: { xAxis, yAxis, color: chartColor, name: widgetName, description: widgetDescription, fontFamily } });
                    onOpenChange(false);
                  } else {
                    handleAdd();
                  }
                }}
                disabled={!canAdd}
                className={`w-full h-[40px] px-4 rounded-[8px] text-[14px] font-semibold transition-all ${
                  canAdd
                    ? "bg-[#6a12cd] text-white hover:bg-[#5a0ebd] shadow-sm"
                    : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
                }`}
              >
                {isCreateDashboardMode ? "Create Dashboard" : "Add Widget"}
              </button>
            </div>
          </div>

          {/* ── Main Area ── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white order-1">
            
            {/* ── Axis Configuration Rows — dynamic per chart type ── */}
            {selected && (
              <div className="shrink-0 px-6 py-3 space-y-2 border-b border-[#e5e7eb] bg-white">
                {(() => {
                  const stateMap: Record<string, { ids: string[]; add: (id: string) => void; remove: (id: string) => void; showAgg?: boolean }> = {
                    xAxis:      { ids: xFieldIds,          add: addFieldToX,     remove: removeXField,      showAgg: true },
                    yAxis:      { ids: yFieldIds,          add: addFieldToY,     remove: removeYField,      showAgg: true },
                    legend:     { ids: legendFieldIds,     add: (id) => { if (!legendFieldIds.includes(id)) setLegendFieldIds(p => [...p, id]); }, remove: (id) => setLegendFieldIds(p => p.filter(f => f !== id)) },
                    secondaryY: { ids: secondaryYFieldIds, add: (id) => { if (!secondaryYFieldIds.includes(id)) setSecondaryYFieldIds(p => [...p, id]); }, remove: (id) => setSecondaryYFieldIds(p => p.filter(f => f !== id)), showAgg: true },
                    size:       { ids: sizeFieldIds,       add: (id) => { if (!sizeFieldIds.includes(id)) setSizeFieldIds(p => [...p, id]); }, remove: (id) => setSizeFieldIds(p => p.filter(f => f !== id)) },
                  };

                  const hasSecondaryY = selected.dimensions.some(d => d.key === 'secondaryY');

                  // Render a single drop zone
                  const renderDropZone = (dim: { key: string; label: string }) => {
                    const slot = stateMap[dim.key];
                    if (!slot) return null;
                    return (
                      <div
                        key={dim.key}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
                        onDrop={(e) => { e.preventDefault(); const fieldId = e.dataTransfer.getData("fieldId"); if (fieldId) slot.add(fieldId); }}
                        className="flex-1 min-h-[40px] bg-white border border-dashed border-[#d1d5db] hover:border-[#6a12cd] hover:bg-[#faf5ff] rounded-[6px] px-2.5 py-2 transition-all duration-200"
                      >
                        {slot.ids.length === 0 ? (
                          <div className="flex items-center gap-2 h-full">
                            <GripVertical className="size-[14px] text-[#d1d5db]" />
                            <span className="text-[12px] text-[#9ca3af]">{dim.label}</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {slot.ids.map((fid) => {
                              const field = FIELDS.find(f => f.id === fid);
                              if (!field) return null;
                              const agg = yAggs[fid] || "count_d";
                              return (
                                <div key={fid} className="flex items-center gap-1.5 h-[28px] px-2.5 bg-[#faf5ff] rounded-[4px] border border-[#6a12cd]/30 shrink-0">
                                  <span className="text-[12px] font-medium text-[#26064a] whitespace-nowrap">{field.label}</span>
                                  {slot.showAgg && <AggDropdown value={agg} onChange={(v) => changeAgg(fid, v)} fieldId={fid} />}
                                  <button onClick={() => slot.remove(fid)} className="p-0.5 rounded hover:bg-[rgba(38,6,74,0.1)] transition-colors">
                                    <X className="size-[12px] text-[#6b7280] hover:text-[#ef4444]" strokeWidth={2} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  };

                  // Group dimensions: yAxis + secondaryY go side by side (regardless of position), rest get their own row
                  const dims = selected.dimensions;
                  const secondaryYDim = hasSecondaryY ? dims.find(d => d.key === 'secondaryY') : null;
                  const rows: React.ReactElement[] = [];
                  let i = 0;
                  while (i < dims.length) {
                    const dim = dims[i];
                    // Skip secondaryY here — it's rendered alongside yAxis
                    if (dim.key === 'secondaryY' && secondaryYDim) {
                      i++;
                      continue;
                    }
                    // If this is yAxis and we have secondaryY, render them side by side
                    if (dim.key === 'yAxis' && secondaryYDim) {
                      rows.push(
                        <div key="yAxis-group" className="flex items-center gap-4">
                          <div className="w-[80px] shrink-0">
                            <p className="text-[12px] font-semibold text-[#26064a]">{dim.label}</p>
                          </div>
                          <div className="flex-1 flex gap-2">
                            {renderDropZone(dim)}
                            {renderDropZone(secondaryYDim)}
                          </div>
                        </div>
                      );
                      i++;
                    } else {
                      rows.push(
                        <div key={dim.key} className="flex items-center gap-4">
                          <div className="w-[80px] shrink-0">
                            <p className="text-[12px] font-semibold text-[#26064a]">{dim.label}</p>
                          </div>
                          {renderDropZone(dim)}
                        </div>
                      );
                      i++;
                    }
                  }
                  return rows;
                })()}

                {/* SUGGESTION BANNER - Show when 2+ Y-axis fields */}
                {yFieldIds.length >= 2 && (
                  <div className="flex items-center gap-4 ml-[80px] pl-4">
                    <div className="flex items-center gap-4 px-4 py-2 bg-[#fafafa] rounded-[4px]">
                      <Lightbulb className="size-[14px] text-[#6A12CD]" strokeWidth={2} />
                      <div className="flex items-center gap-2">
                        {[
                          { id: "clustered-column", Icon: BarChart3, label: "Bar" },
                          { id: "line", Icon: LineChartIcon, label: "Line" },
                          { id: "area", Icon: TrendingUp, label: "Area" },
                        ].map(({ id, Icon, label }) => (
                          <button
                            key={id}
                            onClick={() => { const w = WIDGETS.find(w => w.id === id); if (w) setSelected(w); }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-[4px] transition-colors ${selected?.id === id ? "bg-[#6A12CD] text-white" : "hover:bg-[#6A12CD]/10 text-[#26064A]"}`}
                          >
                            <Icon className={`size-[12px] ${selected?.id === id ? "text-white" : "text-[#26064A]"}`} strokeWidth={2} />
                            <span className="text-[12px]">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PREVIEW Section ── */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-[#f0f0f0] px-[16px] pt-[8px] pb-[8px]">
                <p className="text-[12px] font-medium uppercase tracking-[1px] text-[#26064a]">Preview</p>
                {selected && <span className="text-[12px] font-medium text-[#6a12cd]">{selected.title}</span>}
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                {previewReady && selected && (
                  <div className="w-full h-full min-h-[300px]">
                    {selected.id === "kpi" ? (
                      yFieldIds.length > 0 ? (
                        <div className="flex items-center justify-center h-full gap-5 flex-wrap">
                          {yFieldIds.map((fid, i) => {
                            const field = FIELDS.find(f => f.id === fid);
                            const label = field?.label || fid;
                            const values = ["12,450", "94.2%", "₹4.2M", "23", "1.8d", "38d", "₹85L"];
                            return (
                              <div key={fid} className="bg-white rounded-xl border-2 border-[#e5e7eb] p-6 shadow-sm hover:shadow-md transition-shadow w-[280px]">
                                <p className="text-[16px] font-semibold text-[#26064a] mb-3">
                                  {label}
                                </p>
                                <p className="text-[48px] font-bold text-[#26064a]">
                                  {values[i % values.length]}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center max-w-[280px]">
                            <div className="mx-auto mb-4 size-20 rounded-2xl bg-[#f4f0ff] flex items-center justify-center">
                              <Hash className="size-10 text-[#6a12cd]/30" strokeWidth={1.5} />
                            </div>
                            <p className="text-[15px] font-semibold text-[#26064a] mb-1">Add a Value Field</p>
                            <p className="text-[13px] text-[#9ca3af] leading-relaxed">Drag a measure field into the Value slot above to see your KPI card.</p>
                          </div>
                        </div>
                      )
                    ) : (
                      <ConfigurableChart
                        type={selected.builderType as any}
                        xAxis={resolvedXAxis}
                        yAxis={resolvedYAxis}
                        color={chartColor}
                        seriesColors={seriesColors}
                        onSeriesColorChange={(label, color) => setSeriesColors(prev => ({ ...prev, [label]: color }))}
                        barSpacing={barSpacing}
                        pieSpacingMap={selected?.builderType === 'pie' ? spacingMap : undefined}
                        fontFamily={fontFamily}
                      />
                    )}
                  </div>
                )}
                {(!previewReady || !selected) && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center max-w-[280px]">
                      <div className="mx-auto mb-4 size-20 rounded-2xl bg-[#f4f0ff] flex items-center justify-center">
                        {!selected ? (
                          <BarChart3 className="size-10 text-[#6a12cd]/30" strokeWidth={1.5} />
                        ) : (
                          <selected.Icon className="size-10 text-[#6a12cd]/30" strokeWidth={1.5} />
                        )}
                      </div>
                      <p className="text-[15px] font-semibold text-[#26064a] mb-1">
                        {!selected ? "No Chart Selected" : "Almost There"}
                      </p>
                      <p className="text-[13px] text-[#9ca3af] leading-relaxed">
                        {!selected
                          ? "Select a chart type from the sidebar to start building your visualization."
                          : "Drag data fields into the axis slots above to generate a preview."
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer: Add Widget Button (Moved to Sidebar) ── */}
            <div className="shrink-0 h-[57px] border-t border-[#f0f0f0]" style={{ display: 'none' }}>
              {/* Button moved to Format sidebar */}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* ── Add Data Dropdown Portal ── */}
      {addDataOpen && addDataBtnRef.current && createPortal(
        <div
          style={{
            position: "fixed",
            top: addDataBtnRef.current.getBoundingClientRect().bottom + 4,
            left: addDataBtnRef.current.getBoundingClientRect().left,
            zIndex: 99999,
          }}
          className="bg-[#fefefe] rounded-[8px] border border-[rgba(106,18,205,0.2)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)] w-[180px] overflow-hidden"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseLeave={() => setAddDataOpen(false)}
        >
          <div className="p-1.5">
            {/* From Excel */}
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                setAddDataOpen(false); 
                onOpenExcelUpload?.();
              }}
              className="flex items-center gap-2 px-2 py-2 bg-white hover:bg-purple-50 rounded-[6px] transition-colors group"
            >
              <FileSpreadsheet className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
              <span className="text-[12px] font-medium text-[#26064a]">From Excel</span>
            </button>

            {/* From Query */}
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setAddDataOpen(false); 
                onOpenQueryModal?.();
              }} 
              className="flex items-center gap-2 px-2 py-2 bg-white hover:bg-purple-50 rounded-[6px] transition-colors group"
            >
              <svg className="size-[12px] shrink-0" fill="none" viewBox="0 0 17.5 17.5">
                <path d={svgPathsQuery.p309aaa80} fill="#6a12cd" fillOpacity="1" />
              </svg>
              <span className="text-[12px] font-medium text-[#26064a] whitespace-nowrap">From Query</span>
            </button>
          </div>
        </div>,
        document.body,
      )}


    </Dialog>
  );
}