import { useState, useRef, useEffect } from "react";
import { ChevronDown, BarChart3, Check } from "lucide-react";
import { WhiteDropdown } from "../WhiteDropdown";

interface DataSeriesFormattingSectionProps {
  series?: string[];
}

export default function DataSeriesFormattingSection({ 
  series = [] 
}: DataSeriesFormattingSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState("");
  const [selectedColor, setSelectedColor] = useState("purple");
  const [spacing, setSpacing] = useState("0");
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  const colorOptions = [
    { value: "purple", label: "Purple", color: "#6a12cd" },
    { value: "blue", label: "Blue", color: "#0ea5e9" },
    { value: "green", label: "Green", color: "#10b981" },
    { value: "orange", label: "Orange", color: "#f59e0b" },
    { value: "red", label: "Red", color: "#ef4444" },
    { value: "pink", label: "Pink", color: "#ec4899" },
    { value: "violet", label: "Violet", color: "#8b5cf6" },
    { value: "teal", label: "Teal", color: "#14b8a6" },
    { value: "orangeRed", label: "Orange Red", color: "#f97316" }
  ];

  const spacingOptions = [
    { value: "0", label: "0%" },
    { value: "10", label: "10%" },
    { value: "20", label: "20%" },
    { value: "30", label: "30%" },
    { value: "40", label: "40%" },
    { value: "50", label: "50%" }
  ];

  const seriesOptions = series.map(s => ({ value: s, label: s }));
  const currentColor = colorOptions.find(c => c.value === selectedColor);

  // Close color dropdown when clicking outside
  useEffect(() => {
    if (!colorDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (colorButtonRef.current && !colorButtonRef.current.contains(event.target as Node)) {
        // Check if click is on dropdown menu itself
        const target = event.target as HTMLElement;
        if (!target.closest('.color-dropdown-menu')) {
          setColorDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [colorDropdownOpen]);

  return (
    <div className="bg-white rounded-[8px] border border-[#e5e7eb] shadow-sm mt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#faf5ff] to-white hover:from-[#f5f0ff] hover:to-[#fefefe] transition-all border-b border-[#f0f0f0]"
      >
        <div className="flex items-center gap-2">
          <div className="size-[18px] rounded-[4px] flex items-center justify-center">
            <BarChart3 className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
          </div>
          <span className="text-[12px] font-bold uppercase tracking-[0.8px] text-[#26064a]">Customize Data Colors</span>
        </div>
        <ChevronDown
          className="size-[14px] text-[#6a12cd] transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {isOpen && (
        <div className="p-3 bg-[#fafafa] space-y-3">
          {/* Select Series */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#26064a]">Categories</label>
            <WhiteDropdown
              value={selectedSeries}
              onChange={setSelectedSeries}
              options={seriesOptions}
              placeholder={seriesOptions.length > 0 ? "Select a series..." : "No series available"}
              size="sm"
            />
          </div>

          {/* Color and Spacing */}
          <div className="grid grid-cols-2 gap-3">
            {/* Color */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#26064a]">Color</label>
              <WhiteDropdown
                value={selectedColor}
                onChange={setSelectedColor}
                mode="colorpicker"
                placeholder="Select color..."
                size="sm"
              />
            </div>

            {/* Spacing */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#26064a]">Spacing</label>
              <WhiteDropdown
                value={spacing}
                onChange={setSpacing}
                options={spacingOptions}
                placeholder="Select spacing..."
                size="sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}