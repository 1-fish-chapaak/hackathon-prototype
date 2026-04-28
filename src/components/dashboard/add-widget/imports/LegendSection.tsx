import { useState } from "react";
import { ChevronDown, Type, Bold, Italic } from "lucide-react";
import { WhiteDropdown } from "../WhiteDropdown";

export default function LegendSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [legendPosition, setLegendPosition] = useState("right");
  const [legendBold, setLegendBold] = useState(false);
  const [legendItalic, setLegendItalic] = useState(false);
  const [legendTextColor, setLegendTextColor] = useState("auto");

  return (
    <div className="bg-white rounded-[8px] border border-[#e5e7eb] overflow-hidden shadow-sm mt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#faf5ff] to-white hover:from-[#f5f0ff] hover:to-[#fefefe] transition-all border-b border-[#f0f0f0]"
      >
        <div className="flex items-center gap-2">
          <div className="size-[18px] rounded-[4px] flex items-center justify-center">
            <Type className="size-[12px] text-[#6a12cd]" strokeWidth={2} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#26064a]">Legend</span>
        </div>
        <ChevronDown
          className="size-[14px] text-[#6a12cd] transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {isOpen && (
        <div className="p-3 bg-[#fafafa] space-y-3">
          {/* Position */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#26064a]">Position</label>
            <WhiteDropdown
              value={legendPosition}
              onChange={setLegendPosition}
              options={[
                { value: "top", label: "Top" },
                { value: "right", label: "Right" },
                { value: "bottom", label: "Bottom" },
                { value: "left", label: "Left" }
              ]}
              size="sm"
            />
          </div>

          {/* Legend Format and Text Color */}
          <div className="grid grid-cols-2 gap-2">
            {/* Legend Format */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#26064a]">Legend Format</label>
              <div className="flex items-center bg-white rounded-[6px] border border-[#e5e7eb] overflow-hidden">
                <button
                  onClick={() => setLegendBold(!legendBold)}
                  className={`flex-1 flex items-center justify-center px-3 py-2 border-r border-[#e5e7eb] transition-all duration-200 ${
                    legendBold
                      ? "bg-[#6a12cd] text-white"
                      : "bg-white text-[#26064a] hover:bg-[#faf5ff]"
                  }`}
                >
                  <Bold className={`size-[14px] transition-colors ${legendBold ? "text-white" : "text-[#6a12cd]"}`} />
                </button>
                <button
                  onClick={() => setLegendItalic(!legendItalic)}
                  className={`flex-1 flex items-center justify-center px-3 py-2 transition-all duration-200 ${
                    legendItalic
                      ? "bg-[#6a12cd] text-white"
                      : "bg-white text-[#26064a] hover:bg-[#faf5ff]"
                  }`}
                >
                  <Italic className={`size-[14px] transition-colors ${legendItalic ? "text-white" : "text-[#6a12cd]"}`} />
                </button>
              </div>
            </div>

            {/* Text Color */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#26064a]">Text Color</label>
              <WhiteDropdown
                value={legendTextColor}
                onChange={setLegendTextColor}
                mode="colorpicker"
                placeholder="Select color..."
                size="sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}