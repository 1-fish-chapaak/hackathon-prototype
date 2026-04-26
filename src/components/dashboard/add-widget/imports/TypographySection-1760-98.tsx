import { useState } from "react";
import { ChevronDown, Type } from "lucide-react";

export default function TypographySection() {
  const [dataLabelsOpen, setDataLabelsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"fixed" | "hover">("fixed");

  return (
    <div className="bg-white rounded-[8px] border border-[#e5e7eb] overflow-hidden shadow-sm mt-3">
      <button
        onClick={() => setDataLabelsOpen(!dataLabelsOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#faf5ff] to-white hover:from-[#f5f0ff] hover:to-[#fefefe] transition-all border-b border-[#f0f0f0]"
      >
        <div className="flex items-center gap-2">
          <div className="size-[18px] rounded-[4px] flex items-center justify-center">
            <Type className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#26064a]">Data Labels</span>
        </div>
        <button
              onClick={() => setSelectedMode(selectedMode === "fixed" ? "hover" : "fixed")}
              className={`relative w-[36px] h-[20px] rounded-full transition-all ${
                selectedMode === "hover"
                  ? "bg-[#6a12cd]"
                  : "bg-[rgba(0,0,0,0.12)]"
              }`}
            >
              <div
                className={`absolute top-[2px] w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-all ${
                  selectedMode === "hover" ? "left-[18px]" : "left-[2px]"
                }`}
              />
            </button>
      </button>
      {dataLabelsOpen && (
        null
      )}
    </div>
  );
}